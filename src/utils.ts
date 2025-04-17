import {InputNumber, InvalidFormatError, InvalidNumberError, SpellerConfig} from './types';

/**
 * Validates an input number, ensures it's a valid string representation.
 * @param input The input number to validate
 * @returns A valid string representation of the number
 */
export function validateNumber(input: InputNumber): string {
  if (input === null || input === undefined) {
    throw new InvalidFormatError('Input cannot be null or undefined');
  }

  let numberStr: string;
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || Number.isNaN(input)) {
      throw new InvalidFormatError('Input must be a finite number');
    }

    // Kiểm tra nếu số nhỏ hơn 1e21 (1 với 21 số 0) thì xử lý thủ công
    if (Math.abs(input) < 1e21) {
      // Chuyển đổi số thành chuỗi và chuẩn hóa ký hiệu mũ (xóa dấu + nếu có)
      numberStr = input.toString().replace(/e\+?/, 'e');

      // Tách thành phần cơ số và số mũ
      const parts = numberStr.split('e');
      const base = parts[0];         // Phần cơ số (ví dụ: "1.23" trong "1.23e5")
      const exponent = parseInt(parts[1], 10);  // Phần số mũ (ví dụ: 5 trong "1.23e5")

      if (exponent >= 0) {
        // Xử lý số mũ dương (ví dụ: 1.23e5 = 123000)
        const decimalPos = base.indexOf('.');
        if (decimalPos === -1) {
          // Không có phần thập phân, chỉ cần thêm số 0
          numberStr = base + '0'.repeat(exponent);  // Ví dụ: "5e3" -> "5000"
        } else {
          // Có phần thập phân
          const fraction = base.substring(decimalPos + 1);  // Phần thập phân (không bao gồm dấu chấm)
          const whole = base.substring(0, decimalPos);      // Phần nguyên

          if (exponent >= fraction.length) {
            // Số mũ lớn hơn độ dài phần thập phân
            // Ví dụ: "1.23e5" -> "123" + "000" = "123000"
            numberStr = whole + fraction + '0'.repeat(exponent - fraction.length);
          } else {
            // Số mũ nhỏ hơn độ dài phần thập phân
            // Ví dụ: "1.23456e2" -> "123.456"
            numberStr = whole + fraction.substring(0, exponent) + '.' + fraction.substring(exponent);
          }
        }
      } else {
        // Xử lý số mũ âm (ví dụ: 1.23e-5 = 0.0000123)
        const baseWithoutDot = base.replace('.', '');  // Loại bỏ dấu chấm
        const pos = baseWithoutDot.length + exponent;

        if (pos <= 0) {
          // Số quá nhỏ, cần thêm số 0 trước
          // Ví dụ: "1.23e-5" -> "0.0000123"
          numberStr = '0.' + '0'.repeat(-pos) + baseWithoutDot;
        } else {
          // Số mũ âm nhưng không quá nhỏ
          // Ví dụ: "123e-1" -> "12.3"
          numberStr = baseWithoutDot.substring(0, pos) + '.' + baseWithoutDot.substring(pos);
        }
      }
    } else {
      // Nếu số quá lớn, quay lại phương pháp tiêu chuẩn
      numberStr = input.toString();
    }
  } else {
    numberStr = input.trim();
  }

  // Basic pattern check
  const validPattern = /^-?\d*(\.\d*)?$/;
  const validThousandsPattern = /^-?(\d{1,3}(,\d{3})+|\d+)(\.\d*)?$/;

  if (!validPattern.test(numberStr.replace(/,/g, '')) && !validThousandsPattern.test(numberStr)) {
    throw new InvalidNumberError('Invalid number format');
  }

  return numberStr;
}

/**
 * Removes thousands separators from a number string
 * @param config SpellerConfig instance
 * @param numberStr Number string to process
 * @returns Number string without thousands separators
 */
export function removeThousandsSeparators(config: SpellerConfig, numberStr: string): string {
  return numberStr.replace(new RegExp(escapeRegExp(config.thousandSign), 'g'), '');
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
export function truncateIncorrectZeros(
  config: {
    pointSign: string,
    filledDigit: string,
    keepTrailingZero?: boolean,
    keepLeadingPointZero?: boolean
  },
  numberStr: string
): string {
  const keepTrailingZero = config.keepTrailingZero ?? false;
  const keepLeadingPointZero = config.keepLeadingPointZero ?? true;

  if (numberStr.includes(config.pointSign)) {
    // Handle decimal numbers
    const parts = numberStr.split(config.pointSign);
    let intPart = trimLeft(parts[0], config.filledDigit);
    let fracPart = keepTrailingZero ? parts[1] : trimRight(parts[1], config.filledDigit);

    // Always ensure the integral part has at least one digit (0)
    if (intPart === '') {
      intPart = '0';
    }

    // Handle empty fractional part
    if (fracPart === '') {
      return keepTrailingZero ? `${intPart}${config.pointSign}0` : `${intPart}${config.pointSign}`;
    }

    return `${intPart}${config.pointSign}${fracPart}`;
  } else {
    // Handle integer numbers
    let trimmed = trimLeft(numberStr, config.filledDigit);
    // Return '0' for empty string after trimming
    return trimmed === '' ? '0' : trimmed;
  }
}
