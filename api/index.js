import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_UNIT = 300;
const ONE_ICON = 48;
const SCALE = ONE_ICON / (BASE_UNIT - 44);
const ICONS_PER_LINE = 15;
const ICONS_DIR = path.join(__dirname, '../icons');

const iconCache = new Map();

function getAvailableIcons() {
  try {
    const files = fs.readdirSync(ICONS_DIR);
    const icons = new Set();
    
    files.forEach(file => {
      if (file.endsWith('.svg')) {
        const name = file.replace(/(-(?:Light|Dark))?\.svg$/i, '');
        icons.add(name.toLowerCase());
      }
    });
    
    return Array.from(icons).sort();
  } catch (error) {
    console.error('Error reading icons directory:', error);
    return [];
  }
}

function loadIcon(iconName, theme = 'Light') {
  const normalizedTheme = theme.charAt(0).toUpperCase() + theme.slice(1).toLowerCase();
  const normalizedIcon = iconName.toLowerCase();
  const cacheKey = `${normalizedIcon}-${normalizedTheme}`;
  
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey);
  }
  
  const suffixedFilename = `${normalizedIcon}-${normalizedTheme}.svg`;
  const suffixedPath = path.join(ICONS_DIR, suffixedFilename);
  
  const plainFilename = `${normalizedIcon}.svg`;
  const plainPath = path.join(ICONS_DIR, plainFilename);
  
  try {
    let filepath = null;
    if (fs.existsSync(suffixedPath)) {
      filepath = suffixedPath;
    } else if (fs.existsSync(plainPath)) {
      filepath = plainPath;
    } else {
      return null;
    }
    
    let svgContent = fs.readFileSync(filepath, 'utf8');
    
    svgContent = svgContent.replace(
      /<svg([^>]*)>/,
      '<svg$1 width="256" height="256">'
    );
    
    iconCache.set(cacheKey, svgContent);
    return svgContent;
  } catch (error) {
    console.error(`Error loading icon ${iconName}:`, error);
    return null;
  }
}

function generateSvg(iconData, perLine) {
  const length = Math.min(perLine * BASE_UNIT, iconData.length * BASE_UNIT) - 44;
  const height = Math.ceil(iconData.length / perLine) * BASE_UNIT - 44;
  const scaledHeight = height * SCALE;
  const scaledWidth = length * SCALE;
  
  return `<svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${length} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
${iconData
  .map((iconSvg, index) => {
    if (!iconSvg) return '';
    
    const content = iconSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');
    
    return `<g transform="translate(${(index % perLine) * 300}, ${Math.floor(index / perLine) * 300})">
${content}
</g>`;
  })
  .filter(Boolean)
  .join('\n')}
</svg>`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  if (pathname === '/api/icons') {
    const icons = getAvailableIcons();
    return res.status(200).json({ icons });
  }
  
  if (pathname === '/api/svg') {
    const iconParam = url.searchParams.get('i') || url.searchParams.get('icons');
    
    if (!iconParam) {
      return res.status(400).json({ error: 'Parameter "i" or "icons" required' });
    }
    
    const icons = iconParam.split(',').map(i => i.trim()).filter(Boolean);
    if (!icons.length) {
      return res.status(400).json({ error: 'No icons specified' });
    }
    
    const theme = (url.searchParams.get('t') || url.searchParams.get('theme') || 'Light');
    if (!['light', 'dark'].includes(theme.toLowerCase())) {
      return res.status(400).json({ error: 'Theme must be "Light" or "Dark"' });
    }
    
    const perLine = parseInt(url.searchParams.get('perline') || ICONS_PER_LINE);
    if (isNaN(perLine) || perLine < 1 || perLine > 50) {
      return res.status(400).json({ error: 'perline must be between 1 and 50' });
    }
    
    const iconData = [];
    const notFound = [];
    
    for (const iconName of icons) {
      const iconSvg = loadIcon(iconName.toLowerCase(), theme);
      if (iconSvg) {
        iconData.push(iconSvg);
      } else {
        notFound.push(iconName);
      }
    }
    
    if (iconData.length === 0) {
      return res.status(404).json({ 
        error: 'No icons found', 
        notFound,
        available: getAvailableIcons()
      });
    }
    
    const svgResult = generateSvg(iconData, perLine);
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    if (notFound.length > 0) {
      res.setHeader('X-Not-Found', notFound.join(','));
    }
    
    return res.status(200).send(svgResult);
  }
  
  return res.status(404).json({ error: 'Route not found' });
}