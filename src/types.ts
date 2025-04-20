import {cleanInputNumber, trimLeft, trimRight} from './utils';

export type InputNumber = string | number | bigint;

/**
 * Options for normalizing number strings
 */
export interface NormalizeOptions {
  /**
   * Custom thousands separator character
   * @default ','
   */
  thousandSign?: string;

  /**
   * Custom decimal point character
   * @default '.'
   */
  decimalPoint?: string;
}

export interface NumberData {
  isNegative: boolean;
  integralPart: string;
  fractionalPart: string;
}

export class InvalidFormatError extends Error {
  name: string;
  constructor(message: string) {
    super(message);
    // For IE 11 and older browsers without proper Error inheritance
    this.name = 'InvalidFormatError';
    Object.setPrototypeOf(this, InvalidFormatError.prototype);
  }
}

export class InvalidNumberError extends Error {
  name: string;
  constructor(message: string) {
    super(message);
    // For IE 11 and older browsers without proper Error inheritance
    this.name = 'InvalidNumberError';
    Object.setPrototypeOf(this, InvalidNumberError.prototype);
  }
}

/**
 * Group and position indices
 * Chỉ số nhóm và vị trí
 */
export enum Index {
  // Group indices (chỉ số nhóm)
  BILLION = 0,  // tỷ
  MILLION = 1,  // triệu
  THOUSAND = 2, // nghìn

  // Position indices (chỉ số vị trí)
  HUNDREDS = 3, // trăm
  TENS = 4,     // mươi
  UNITS = 5     // (empty)
}

/**
 * Number of magnitude groups in the system (billions, millions, thousands)
 * Số lượng nhóm đơn vị trong hệ thống (tỷ, triệu, nghìn)
 */
export const NUMBER_OF_GROUPS = 3;

/**
 * Number of positions in each group of digits (hundreds, tens, units)
 * Số lượng vị trí trong mỗi nhóm chữ số (hàng trăm, hàng chục, hàng đơn vị)
 */
export const NUMBER_OF_POSITIONS = 3;

export interface SpecificText {
  // Number specific text
  oddText: string;
  tenText: string;

  // Tone specific text
  oneToneText: string;
  fourToneText: string;
  fiveToneText: string;
}

export class SpellerConfig {
  separator: string = ' ';
  negativeSign: string = '-';
  decimalPoint: string = '.';
  thousandSign: string = ',';

  negativeText: string = 'âm';
  pointText: string = 'chấm';

  capitalizeInitial: boolean = true;
  currencyUnit: string = ''; // option for currency unit

  /**
   * Character used to represent redundant zeros in number strings.
   * This character will be trimmed from both the beginning and end of numbers.
   * Default is '0'.
   */
  redundantZeroChar: string = '0';
  // Controls how to handle redundant zeros in fractional part
  keepOneZeroWhenAllZeros: boolean = false; // When true, keeps a single '0' after decimal point when all decimal digits are zeros (e.g., '123.000' -> '123.0')
                                            // When false, removes all trailing zeros and keeps only the decimal point (e.g., '123.000' -> '123.')

  /**
   * Custom names for digits (chữ số)
   * @example { '4': 'tư' }
   */
  digitNames: Record<string, string> = {
    '0': 'không',
    '1': 'một',
    '2': 'hai',
    '3': 'ba',
    '4': 'bốn',
    '5': 'năm',
    '6': 'sáu',
    '7': 'bảy',
    '8': 'tám',
    '9': 'chín'
  };

  /**
   * Custom names for all units (đơn vị)
   * @example {
   *   0: 'tỉ',    // magnitude unit: billion
   *   1: 'triệu', // magnitude unit: million
   *   2: 'nghìn', // magnitude unit: thousand
   *   3: 'trăm',  // position unit:  hundred
   *   4: 'mươi',  // position unit:  ten
   *   5: ''       // position unit:  unit
   * }
   */
  unitNames: Record<number, string> = {
    0: 'tỷ',
    1: 'triệu',
    2: 'nghìn',
    3: 'trăm',
    4: 'mươi',
    5: ''
  };

  specificText: SpecificText = {
    oddText: 'lẻ',
    tenText: 'mười',
    oneToneText: 'mốt',
    fourToneText: 'tư',
    fiveToneText: 'lăm'
  };

  constructor(config: Partial<SpellerConfig> = {}) {
    // Apply configuration with type safety
    if (config) {
      const configKeys = Object.keys(config) as Array<keyof typeof config>;
      for (let i = 0; i < configKeys.length; i++) {
        const key = configKeys[i];
        if (key !== 'specificText' && key !== 'digitNames' && key !== 'unitNames') {
          (this as any)[key] = config[key];
        }
      }
    }

    // Apply specific text configuration with type safety
    if (config?.specificText) {
      this.specificText = {
        oddText: config.specificText.oddText || this.specificText.oddText,
        tenText: config.specificText.tenText || this.specificText.tenText,
        oneToneText: config.specificText.oneToneText || this.specificText.oneToneText,
        fourToneText: config.specificText.fourToneText || this.specificText.fourToneText,
        fiveToneText: config.specificText.fiveToneText || this.specificText.fiveToneText
      };
    }

    // Apply custom digit names if provided
    if (config?.digitNames) {
      this.digitNames = {
        '0': config.digitNames['0'] || this.digitNames['0'],
        '1': config.digitNames['1'] || this.digitNames['1'],
        '2': config.digitNames['2'] || this.digitNames['2'],
        '3': config.digitNames['3'] || this.digitNames['3'],
        '4': config.digitNames['4'] || this.digitNames['4'],
        '5': config.digitNames['5'] || this.digitNames['5'],
        '6': config.digitNames['6'] || this.digitNames['6'],
        '7': config.digitNames['7'] || this.digitNames['7'],
        '8': config.digitNames['8'] || this.digitNames['8'],
        '9': config.digitNames['9'] || this.digitNames['9']
      };
    }

    // Apply custom unit names if provided
    if (config?.unitNames) {
      this.unitNames = {
        0: config.unitNames[0] || this.unitNames[0],
        1: config.unitNames[1] || this.unitNames[1],
        2: config.unitNames[2] || this.unitNames[2],
        3: config.unitNames[3] || this.unitNames[3],
        4: config.unitNames[4] || this.unitNames[4],
        5: config.unitNames[5] || this.unitNames[5]
      };
    }
  }

  getDigit(digit: string): string {
    return this.digitNames[digit];
  }

  getUnitName(index: number): string {
    return this.unitNames[index];
  }

  getUnitNameOfMagnitude(magnitudeIndex: number): string {
    if (magnitudeIndex === Index.BILLION) {
      return this.unitNames[Index.MILLION];
    } else if (magnitudeIndex === Index.MILLION) {
      return this.unitNames[Index.THOUSAND];
    }
    // magnitudeIndex === Index.THOUSAND
    return this.unitNames[Index.UNITS];
  }

  // Getters for specific text
  get oddText(): string {
    return this.specificText.oddText;
  }

  get tenText(): string {
    return this.specificText.tenText;
  }

  get oneToneText(): string {
    return this.specificText.oneToneText;
  }

  get fourToneText(): string {
    return this.specificText.fourToneText;
  }

  get fiveToneText(): string {
    return this.specificText.fiveToneText;
  }

  /**
   * Parses and processes the input number into a structured format.
   * This method is responsible for:
   * - Cleaning and validating the input number
   * - Handling negative signs
   * - Splitting the number into integral and fractional parts
   * - Trimming redundant zeros according to configuration
   * 
   * The method can be overridden in a subclass to implement custom parsing logic
   * while maintaining the default behavior through super.parseNumberData().
   * 
   * @param input - The number to parse, can be a string, number, or bigint
   * @returns A NumberData object containing:
   *          - isNegative: boolean indicating if the number is negative
   *          - integralPart: string containing the integral part
   *          - fractionalPart: string containing the fractional part
   * 
   * @example
   * ```typescript
   * class CustomSpellerConfig extends SpellerConfig {
   *   parseNumberData(input: InputNumber): NumberData {
   *     // Custom parsing logic here
   *     // For example, handle special number formats
   *     
   *     // Use default implementation for standard cases
   *     return super.parseNumberData(input);
   *   }
   * }
   * ```
   */
  parseNumberData(input: InputNumber): NumberData {
    // Clean and validate input
    let numberStr = cleanInputNumber(input, this);

    // Handle negative sign
    const isNegative = numberStr.startsWith(this.negativeSign);
    numberStr = isNegative ? numberStr.substring(this.negativeSign.length) : numberStr;

    // Trim redundant zeros && Split into integral and fractional parts
    const pointPos = numberStr.indexOf(this.decimalPoint);
    if (pointPos === -1) {
      numberStr = trimLeft(numberStr, this.redundantZeroChar);
      return {
        isNegative,
        integralPart: numberStr,
        fractionalPart: '',
      }
    } else {
      return {
        isNegative,
        integralPart: trimLeft(numberStr.substring(0, pointPos), this.redundantZeroChar),
        fractionalPart: trimRight(numberStr.substring(pointPos + 1), this.redundantZeroChar, this.keepOneZeroWhenAllZeros),
      };
    }
  }
}
