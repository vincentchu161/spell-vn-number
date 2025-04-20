import {InputNumber, InvalidFormatError, InvalidNumberError, NormalizeOptions, SpellerConfig} from './types';

/**
 * Validates an input number, ensures it's a valid string representation.
 * @param input The input number to validate
 * @param config NormalizeOptions
 * @returns A valid string representation of the number
 */
export function cleanInputNumber(input: InputNumber, config: NormalizeOptions): string {
  if (input === null || input === undefined || input === '') {
    throw new InvalidFormatError('Input cannot be null or undefined');
  }

  // Handle bigint - simplest case, just convert to string and return
  if (typeof input === 'bigint') {
    return input.toString();
  }

  // Handle number
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || Number.isNaN(input)) {
      throw new InvalidFormatError('Input must be a finite number');
    }

    // Convert number to string and handle scientific notation
    const numberStr = input.toString();
    return /e/i.test(numberStr) ? convertScientificToDecimal(input) : numberStr;
  }

  // Handle string - requires validation
  const strWithoutSeparators = normalizeNumberString(input, config);

  // Create a dynamic pattern based on config - IE11 compatible
  const validPattern = new RegExp('^-?\\d+(' + escapeRegExp(config.decimalPoint || '.') + '\\d+)?$');

  // Check if the string follows a valid number pattern
  if (!validPattern.test(strWithoutSeparators)) {
    throw new InvalidNumberError('Invalid number format');
  }

  return strWithoutSeparators;
}

/**
 * Converts a number in scientific notation to decimal notation
 * Compatible with older browsers including IE11
 * @param num The number to convert
 * @returns String representation in decimal notation
 */
function convertScientificToDecimal(num: number): string {
  // Get string representation in exponential format
  const str = num.toString();

  // If it doesn't contain 'e', return as is
  if (!str.includes('e') && !str.includes('E')) {
    return str;
  }

  // Normalize the exponential notation
  const normalizedStr = str.replace(/E/i, 'e');

  // Split into base and exponent
  const parts = normalizedStr.split('e');
  const base = parts[0];
  const exponent = parseInt(parts[1], 10);

  // If exponent is 0, return the base
  if (exponent === 0) {
    return base;
  }

  // Handle the case without decimal point in base
  const hasDecimal = base.includes('.');
  let coefficient = hasDecimal ? base.replace('.', '') : base;
  let decimalPosition = hasDecimal ? base.indexOf('.') : base.length;

  // Adjust decimal position based on exponent
  decimalPosition += exponent;

  // Create result with appropriate decimal position
  let result = '';
  if (decimalPosition <= 0) {
    // Need leading zeros (e.g., 0.000123)
    result = '0.' + '0'.repeat(-decimalPosition) + coefficient;
  } else if (decimalPosition >= coefficient.length) {
    // Need trailing zeros (e.g., 123000)
    result = coefficient + '0'.repeat(decimalPosition - coefficient.length);
  } else {
    // Insert decimal point at the right position
    result = coefficient.substring(0, decimalPosition) + '.' + coefficient.substring(decimalPosition);
  }

  // If the original number was negative, keep the sign
  if (base.startsWith('-')) {
    result = '-' + result.replace('-', '');
  }

  return result;
}

/**
 * Normalizes a number string by cleaning whitespace and special characters.
 * Compatible with IE11 and older browsers.
 * @param input The string to normalize
 * @param options Options for normalization
 * @returns Normalized number string
 */
export function normalizeNumberString(input: string,
                                      options: NormalizeOptions = {decimalPoint: '.', thousandSign: ','}): string {
  return input
    .replace(/[\s\u00A0]/g, '') // Remove all spaces and non-breaking spaces
    .replace(/[\u2013\u2014]/g, '-') // Replace en/em dash with hyphen-minus
    .replace(new RegExp(escapeRegExp(options.thousandSign || ','), 'g'), ''); // Remove thousands separators
}

/**
 * Escapes special characters for use in RegExp
 * @param string String to escape
 * @returns Escaped string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Removes leading characters from a string.
 * If the result was empty after removing all leading characters that match the input character,
 * returns the input character (char parameter) instead of an empty string.
 *
 * @example
 * trimLeft('000123', '0') // returns '123'
 * trimLeft('000', '0')    // returns '0'
 * trimLeft('000', '1')    // returns '000' (no trimming since no '1's at start)
 * trimLeft('111', '1')    // returns '1'
 *
 * @param str The input string
 * @param char The character to trim (default '0')
 * @returns The string with leading chars removed, or the input char if all matching characters were removed
 */
export function trimLeft(str: string, char: string = '0'): string {
  let startIndex = 0;
  while (startIndex < str.length && str.charAt(startIndex) === char) {
    startIndex++;
  }
  return startIndex === str.length ? char : str.substring(startIndex);
}

/**
 * Removes trailing zeros from a string
 * @param str The input string
 * @param char The character to trim (default '0')
 * @param keepOneZeroWhenAllZeros
 * @returns The string with trailing chars removed
 */
export function trimRight(str: string, char: string = '0', keepOneZeroWhenAllZeros: boolean = false): string {
  let endIndex = str.length - 1;
  while (endIndex >= 0 && str.charAt(endIndex) === char) {
    endIndex--;
  }
  return endIndex < 0 ? (keepOneZeroWhenAllZeros ? char : '') : str.substring(0, endIndex + 1);
}

/**
 * Trims redundant zeros at the beginning and end of a number string with configurable behavior
 * For integral part: trims leading zeros but always keeps at least one if at start
 * For fractional part: trims trailing zeros with configurable behavior
 * keepOneZeroWhenAllZeros:
 * - When true, fractional part that consists of all zeros will result in a single trailing zero
 * - When false, fractional part that consists of all zeros will be completely removed, leaving only the decimal point
 * @param config Configuration object with trim settings
 * @param numberStr The number string to process
 * @returns The trimmed number string
 */
export function trimRedundantZeros(config: SpellerConfig, numberStr: string): string {
  if (numberStr.includes(config.decimalPoint)) {
    // Handle decimal numbers
    const parts = numberStr.split(config.decimalPoint);
    const intPart = trimLeft(parts[0], config.redundantZeroChar);
    let fractionalPart = trimRight(parts[1], config.redundantZeroChar, config.keepOneZeroWhenAllZeros);

    return `${intPart}${config.decimalPoint}${fractionalPart}`;
  } else {
    // Handle integer numbers
    return trimLeft(numberStr, config.redundantZeroChar);
  }
}
