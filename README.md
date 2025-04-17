# spell-vn-number

A JavaScript/TypeScript library for spelling out numbers in Vietnamese. Lightweight and compatible with all modern browsers and older browsers like IE11.

## Demo & Resources

- **Demo:** [https://npm-spell-vn-number.vincentchu.work/](https://npm-spell-vn-number.vincentchu.work/)
- **Demo2:** [https://vincentchu161.github.io/spell-vn-number/examples/github-pages-demo.html](github-pages-demo.html)
- **Repository:** [https://github.com/vincentchu161/spell-vn-number](https://github.com/vincentchu161/spell-vn-number)

## Installation

```bash
npm install spell-vn-number
```

## Usage

### Basic Usage

```javascript
import { spell } from 'spell-vn-number';

console.log(spell('123456')); 
// "một trăm hai mươi ba nghìn bốn trăm năm mươi sáu"

console.log(spell('1,234.56')); 
// "một nghìn hai trăm ba mươi bốn chấm năm mươi sáu"

console.log(spell('-1000000')); 
// "âm một triệu"
```

### Browser Usage

You can use the library directly in the browser via CDN:

```html
<!-- From unpkg -->
<script src="https://unpkg.com/spell-vn-number"></script>

<!-- From jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/spell-vn-number"></script>

<script>
  // Use the global spellVnNumber object
  console.log(spellVnNumber.spell('123456')); 
  // "một trăm hai mươi ba nghìn bốn trăm năm mươi sáu"
</script>
```

### Custom Configuration

You can customize the spelling using the `SpellerConfig` class and the `spellVnNumber` function:

```javascript
import { spellVnNumber, SpellerConfig } from 'spell-vn-number';

const customConfig = new SpellerConfig({
  separator: '-',   // Change word separator
  pointText: 'phẩy', // Change decimal point text
  keepTrailingZero: true, // Keep trailing zeros in decimal part
  // You can customize more properties as needed
});

console.log(spellVnNumber(customConfig, '123.45')); 
// "một-trăm-hai-mươi-ba-phẩy-bốn-mươi-lăm"
```

## Features

- Spells numbers in Vietnamese
- Supports large numbers (up to infinity with unit repetition)
- Handles decimal numbers
- Handles negative numbers
- Intelligently handles redundant zeros (configurable behavior)
- Customizable spelling configuration
- Proper handling of Vietnamese spelling rules
- Special handling for specific digits (1, 4, 5) based on position
- Browser compatibility including older browsers like IE11
- Lightweight and performant (<2KB minified and gzipped)

## Browser Compatibility

The library is compatible with:
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Internet Explorer 11
- Mobile browsers (iOS Safari, Android Chrome)

## API

### `spell(input: string | number): string`

Convenience function to spell a number with default configuration.

### `spellVnNumber(config: SpellerConfig, input: string | number): string`

Main function to spell a number with custom configuration.

### `SpellerConfig`

Configuration class with the following properties:

- `separator`: Word separator (default: ' ')
- `negativeSign`: Negative sign (default: '-')
- `pointSign`: Decimal point (default: '.')
- `thousandSign`: Thousands separator (default: ',')
- `keepTrailingZero`: Whether to keep trailing zeros in fractional part (default: false)
- `keepLeadingPointZero`: Whether to keep leading zero before decimal point (default: true)
- `negativeText`: Text for negative numbers (default: 'âm')
- `pointText`: Text for decimal point (default: 'chấm')
- `oddText`: Text for odd numbers (default: 'lẻ')
- `digits`: Mapping of digits to their spellings
- And various other properties for Vietnamese-specific spelling rules

### Utility Functions

The library also exports several utility functions:

- `truncateIncorrectZeros(config, numberStr)`: Intelligently formats numbers by:
  - Removing excess leading zeros from integral part (always keeping at least one '0')
  - Handling decimal part according to configuration:
    - When `keepTrailingZero` is false (default): remove trailing zeros
    - When `keepTrailingZero` is true: preserve all trailing zeros
  - Examples:
    - '00.00100' → '0.001' (with default config)
    - '00.00100' → '0.00100' (with keepTrailingZero: true)
    - '000.000' → '0.' (with default config)
    - '000.000' → '0.0' (with keepTrailingZero: true)
- `trimLeft(str, char)`: Removes leading character (default: '0')
- `trimRight(str, char)`: Removes trailing character (default: '0')
- `validateNumber(input)`: Validates and normalizes a number input

## Error Handling

The library throws different types of errors:

- `InvalidFormatError`: When the input number format is invalid
- `InvalidNumberError`: When the number contains invalid characters

## Author

- **Name:** vincentchu
- **Email:** contact@vincentchu.work
- **Website:** [https://resume.vincentchu.work/](https://resume.vincentchu.work/)

## License

MIT 
