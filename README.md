# spell-vn-number

A JavaScript/TypeScript library for spelling out numbers in Vietnamese. Lightweight and compatible with all modern browsers and older browsers like IE11.

## Demo & Resources

- **Demo:** [https://npm-spell-vn-number.vincentchu.work/](https://npm-spell-vn-number.vincentchu.work/)
- **Demo2:** [github-pages-demo.html](https://vincentchu161.github.io/spell-vn-number/examples/github-pages-demo.html)
- **Repository:** [https://github.com/vincentchu161/spell-vn-number](https://github.com/vincentchu161/spell-vn-number)
- **Java Version:** [https://github.com/vincentchu161/spell-vn-number-java](https://github.com/vincentchu161/spell-vn-number-java)

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
  keepOneZeroWhenAllZeros: true, // Keep one zero when all decimal digits are zeros
  capitalizeInitial: true, // Capitalize the first letter of the spelled number
});

console.log(spellVnNumber(customConfig, '123.45'));
// "Một-trăm-hai-mươi-ba-phẩy-bốn-mươi-lăm"
console.log(spellVnNumber(customConfig, '123.4500'));
// "Một-trăm-hai-mươi-ba-phẩy-bốn-mươi-lăm"
console.log(spellVnNumber(customConfig, '123.000'));
// "Một-trăm-hai-mươi-ba-phẩy-không"
```

### Using Utility Functions

The library also exports utility functions that can be used independently:

#### cleanInputNumber

Validates, normalizes, and cleans number inputs:

```javascript
import { cleanInputNumber } from 'spell-vn-number';

// Default configuration
const config = {};

// Validate various input types
console.log(cleanInputNumber(123, config)); // "123"
console.log(cleanInputNumber('123.45', config)); // "123.45" 
console.log(cleanInputNumber('-123', config)); // "-123"

// Handle scientific notation
console.log(cleanInputNumber(1.23e5, config)); // "123000"
console.log(cleanInputNumber(1.23e-5, config)); // "0.0000123"

// Handle BigInt values (added support)
console.log(cleanInputNumber(BigInt('9007199254740991'), config)); // "9007199254740991"
console.log(cleanInputNumber(BigInt('123456789012345678901234567890'), config)); // "123456789012345678901234567890"

// Automatically removes thousands separators
console.log(cleanInputNumber('1,234,567', { thousandSign: ',' })); // "1234567"
console.log(cleanInputNumber('–123', config)); // "-123" - normalizes unicode minus signs
console.log(cleanInputNumber(' 1 000 000 ', config)); // "1000000" - removes spaces

// Custom separators
const euroConfig = { 
  thousandSign: '.', 
  decimalPoint: ',' 
};
console.log(cleanInputNumber('1.234.567,89', euroConfig)); // "1234567,89"

// Throws InvalidNumberError for invalid inputs
try {
  cleanInputNumber('123abc', config);
} catch (e) {
  console.error(e.message); // "Invalid number format"
}
```

#### Custom Format Support (Advanced Usage)

The library can be extended to support additional number formats:

```javascript
// You can import and customize normalizeNumberString directly for advanced cases
import { normalizeNumberString } from 'spell-vn-number';

// Default behavior
normalizeNumberString('1 234,56'); // "1234,56"

// With custom options for different formats
normalizeNumberString('1 234,56', {
  decimalPoint: ',',              // Use comma as decimal separator
  thousandSign: ' '        // Use space as thousands separator
}); // "1234.56"

```

#### handleRedundantZeros

Handles redundant zeros in number strings based on configuration:

```javascript
import { handleRedundantZeros, SpellerConfig } from 'spell-vn-number';

// Default config (keepOneZeroWhenAllZeros: false)
const defaultConfig = new SpellerConfig();
console.log(handleRedundantZeros(defaultConfig, '00123')); // "123"
console.log(handleRedundantZeros(defaultConfig, '123.4560')); // "123.456"
console.log(handleRedundantZeros(defaultConfig, '000.000')); // "0." - all decimal zeros removed

// With keepOneZeroWhenAllZeros: true
const customConfig = new SpellerConfig({ keepOneZeroWhenAllZeros: true });
// Still trims trailing zeros for non-zero decimal parts
console.log(handleRedundantZeros(customConfig, '123.4560')); // "123.456" 
// Keeps one zero when all decimal digits are zeros
console.log(handleRedundantZeros(customConfig, '000.000')); // "0.0" - one zero kept after decimal
console.log(handleRedundantZeros(customConfig, '123.0000')); // "123.0" - one zero kept
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

### `spell(input: string | number | bigint): string`

Convenience function to spell a number with default configuration.

### `spellVnNumber(config: SpellerConfig, input: string | number | bigint): string`

Main function to spell a number with custom configuration.

### `SpellerConfig`

Configuration class with the following properties:

- `separator`: Word separator (default: ' ')
- `negativeSign`: Negative sign (default: '-')
- `pointSign`: Decimal point (default: '.')
- `thousandSign`: Thousands separator (default: ',')
- `keepOneZeroWhenAllZeros`: Controls how to handle redundant zeros (default: false); When the decimal part is all zeros, it will always remain a zero.
  - When `true`: '000.000' -> '0.0' (spelled: không chấm không)
  - When `false`: '000.000' -> '0.' (spelled: không)
- `negativeText`: Text for negative numbers (default: 'âm')
- `pointText`: Text for decimal point (default: 'chấm')
- `oddText`: Text for odd numbers (default: 'lẻ')
- `digits`: Mapping of digits to their spellings
- And various other properties for Vietnamese-specific spelling rules

### Utility Functions

The library also exports several utility functions:

- `handleRedundantZeros(config, numberStr)`: Intelligently formats numbers by:
  - Removing excess leading zeros from integral part (always keeping at least one '0')
  - Handling decimal part according to configuration:
    - When `keepOneZeroWhenAllZeros` is false (default): removes all trailing zeros from the decimal part and keeps just the decimal point if all decimal digits are zeros
    - When `keepOneZeroWhenAllZeros` is true: removes all trailing zeros from the decimal part, but keeps a single '0' after the decimal point when all decimal digits are zeros
  - Examples:
    - '00123' → '123' (with any config)
    - '00.00100' → '0.001' (with any config, non-zero decimal digits always have trailing zeros removed)
    - '000.000' → '0.' (with default config, when all decimal digits are zeros)
    - '000.000' → '0.0' (with keepOneZeroWhenAllZeros: true, keeps one zero after decimal point when all are zeros)
    - '123.0000' → '123.' (with default config)
    - '123.0000' → '123.0' (with keepOneZeroWhenAllZeros: true)
    
- `cleanInputNumber(input, config)`: Validates, normalizes and cleans number inputs with extensive format support:
  - **Input types supported**:
    - Numbers: Regular JavaScript numbers including integers, decimals and scientific notation
    - Strings: Number strings with or without decimal points, commas, or spaces
    - BigInt: For handling very large integers beyond JavaScript's Number.MAX_SAFE_INTEGER
  - **Format handling**:
    - Scientific notation: Converts to standard decimal notation (e.g., 1.23e5 → '123000')
    - Thousands separators: Automatically removes thousands separators (e.g., '1,234,567' → '1234567')
    - Alternative minus signs: Normalizes Unicode dashes (en dash, em dash) to standard hyphen-minus
    - Whitespace removal: Automatically removes spaces and non-breaking spaces
  - **Configuration options**:
    - `thousandSign`: Custom thousands separator character (default: ',')
    - `decimalPoint`: Custom decimal point character (default: '.')
  - **Error handling**:
    - Throws InvalidFormatError for null, undefined, NaN, Infinity
    - Throws InvalidNumberError for strings that don't represent valid numbers
  - **Browser compatibility**:
    - Works in all modern browsers
    - Compatible with older browsers including IE11

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
