import {InputNumber, InvalidFormatError, InvalidNumberError, NormalizeOptions, SpellerConfig} from './types';

/**
 * Validates an input number, ensures it's a valid string representation.
 * @param input The input number to validate
 * @param config NormalizeOptions
 * @returns A valid string representation of the number
 */
export function cleanInputNumber(input: InputNumber, config: NormalizeOptions): string {
  if (input === null || input === undefined) {
    throw new InvalidFormatError('Input cannot be null or undefined');
  }

  let numberStr: string;

  // Handle bigint - simplest case, just convert to string
  if (typeof input === 'bigint') {
    return input.toString();
  }

  // Handle number
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || Number.isNaN(input)) {
      throw new InvalidFormatError('Input must be a finite number');
    }

    // Convert number to string and handle scientific notation
    numberStr = input.toString();
    if (/e/i.test(numberStr)) {
      numberStr = convertScientificToDecimal(input);
    }
  }
  // Handle string
  else {
    // Normalize and clean the string input
    numberStr = normalizeNumberString(input, config);
  }

  // Escape special characters for regex
  const escapedDecimal = escapeRegExp(config.decimalPoint || '.');
  const escapedThousand = escapeRegExp(config.thousandSign || ',');

  // Create dynamic pattern based on config - IE11 compatible
  const validPattern = new RegExp('^-?\\d+(' + escapedDecimal + '\\d+)?$');

  // Remove thousands separators
  const strWithoutSeparators = numberStr.replace(new RegExp(escapedThousand, 'g'), '');

  // Check if the string follows a valid number pattern
  if (!validPattern.test(strWithoutSeparators)) {
    throw new InvalidNumberError('Invalid number format');
  }

  // Additional check for scientific notation in string format
  if (/e/i.test(strWithoutSeparators)) {
    throw new InvalidNumberError('Invalid number format');
  }

  // Return the cleaned string without thousands separators
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
  // Default options
  const thousandsSep = options.thousandSign || ',';

  // First trim and normalize the string
  let result = input
    .trim()
    .replace(/[\u2013\u2014]/g, '-')     // Replace en/em dash with hyphen-minus
    .replace(/[\s\u00A0]/g, '');         // Remove all spaces and non-breaking spaces

  // Remove thousands separators if requested
  result = result.replace(new RegExp(escapeRegExp(thousandsSep), 'g'), '');

  return result;
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
 * Removes leading zeros from a string
 * @param str The input string
 * @param char The character to trim (default '0')
 * @returns The string with leading chars removed
 */
export function trimLeft(str: string, char: string = '0'): string {
  let startIndex = 0;
  while (startIndex < str.length && str.charAt(startIndex) === char) {
    startIndex++;
  }
  return startIndex === str.length ? '' : str.substring(startIndex);
}

/**
 * Removes trailing zeros from a string
 * @param str The input string
 * @param char The character to trim (default '0')
 * @returns The string with trailing chars removed
 */
export function trimRight(str: string, char: string = '0'): string {
  let endIndex = str.length - 1;
  while (endIndex >= 0 && str.charAt(endIndex) === char) {
    endIndex--;
  }
  return endIndex < 0 ? '' : str.substring(0, endIndex + 1);
}

/**
 * Trims redundant zeros at the beginning and end of a number string with configurable behavior
 * For integral part: trims leading zeros but always keeps at least one if at start
 * For fractional part: trims trailing zeros with configurable behavior
 * @param config Configuration object with trim settings
 * @param numberStr The number string to process
 * @returns The trimmed number string
 */
export function handleRedundantZeros(config: SpellerConfig, numberStr: string): string {
  // When true, decimal part that consists of all zeros will result in a single trailing zero
  // When false, decimal part that consists of all zeros will be completely removed, leaving only the decimal point
  const keepOneZeroWhenAllZeros = config.keepOneZeroWhenAllZeros ?? false;

  if (numberStr.includes(config.decimalPoint)) {
    // Handle decimal numbers
    const parts = numberStr.split(config.decimalPoint);
    let intPart = trimLeft(parts[0], config.filledDigit);
    // Always trim trailing zeros from the fractional part regardless of config
    let fracPart = trimRight(parts[1], config.filledDigit);

    // Always ensure the integral part has at least one digit (0)
    if (intPart === '') {
      intPart = '0';
    }

    // Handle empty fractional part
    if (fracPart === '') {
      // If the original fractional part had content and keepOneZeroWhenAllZeros is true,
      // keep a single zero after the decimal point
      if (keepOneZeroWhenAllZeros && parts[1].length > 0) {
        return `${intPart}${config.decimalPoint}0`;
      }
      // Otherwise just keep the decimal point
      return `${intPart}${config.decimalPoint}`;
    }

    return `${intPart}${config.decimalPoint}${fracPart}`;
  } else {
    // Handle integer numbers
    let trimmed = trimLeft(numberStr, config.filledDigit);
    // Return '0' for empty string after trimming
    return trimmed === '' ? '0' : trimmed;
  }
}
