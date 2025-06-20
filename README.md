# skill-icons

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Live Demo](https://deploy-badge.vercel.app/vercel/skill-icons-two)](https://skill-icons-two.vercel.app)

## Overview

All credits to [skill-icons](https://github.com/tandpfun/skill-icons) for the icons and the original project idea !

## Features

- Collection of SVG-based skill/technology icons
- Easy to integrate into web projects
- MIT Licensed and open-source
- [Live demo available](https://skill-icons-two.vercel.app)

## Getting Started

### Usage

Example usage in HTML:

```html
<img src="https://skill-icons-two.vercel.app/api/svg?i=react,vuejs,angular&t=Dark&perline=3" alt="Tech stack">
```
<img src="https://skill-icons-two.vercel.app/api/svg?i=react,vuejs,angular&t=Dark&perline=3" alt="Tech stack">

Example usage in Markdown:
```markdown
![My tools](https://skill-icons-two.vercel.app/api/svg?i=autocad,photoshop,illustrator&t=Light&perline=5)
```
![My tools](https://skill-icons-two.vercel.app/api/svg?i=autocad,photoshop,illustrator&t=Light&perline=5)

## Naming Convention

Icons must follow this format:
- `{IconName}-Light.svg` for light theme
- `{IconName}-Dark.svg` for dark theme

Examples:
- `React-Light.svg`, `React-Dark.svg`
- `AutoCAD-Light.svg`, `AutoCAD-Dark.svg`

## Parameters:
- `i` or `icons`: Comma-separated list of icons (**case-insensitive**)
- `t` or `theme`: `Light` or `Dark` (default: Light)
- `perline`: Number of icons per line (1-50, default: 15)

## Contributing

Contributions are welcome! Please open an issue or pull request for suggestions and improvements.

## License

This project is licensed under the [MIT License](LICENSE).
