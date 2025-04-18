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

export class SpellerConfig {
  separator: string = ' ';
  negativeSign: string = '-';
  decimalPoint: string = '.';
  thousandSign: string = ',';
  filledDigit: string = '0';
  
  capitalizeInitial: boolean = false;
  // Controls how to handle redundant zeros in decimal part
  keepOneZeroWhenAllZeros: boolean = false; // When true, keeps a single '0' after decimal point when all decimal digits are zeros (e.g., '123.000' -> '123.0')
                                           // When false, removes all trailing zeros and keeps only the decimal point (e.g., '123.000' -> '123.')

  // Vietnamese specific text
  negativeText: string = 'âm';
  pointText: string = 'chấm';

  oddText: string = 'lẻ';
  tenText: string = 'mười';

  oneToneText: string = 'mốt';
  fourToneText: string = 'tư';
  fiveToneText: string = 'lăm';

  // Digits mapping
  digits: Record<string, string> = {
    '0': 'không',
    '1': 'một',
    '2': 'hai',
    '3': 'ba',
    '4': 'bốn',
    '5': 'năm',
    '6': 'sáu',
    '7': 'bảy',
    '8': 'tám',
    '9': 'chín',
  };

  // Unit group names
  UNIT_GROUP: string[] = ['BILLION', 'MINION', 'THOUSAND'];

  UNIT_OF_GROUP: Record<string, string> = {
    'BILLION': 'tỷ',
    'MINION': 'triệu',
    'THOUSAND': 'nghìn',
  };

  // Unit mapping
  UNIT_GROUP_MAPPER: Record<string, string[]> = {
    'BILLION': ['trăm', 'mươi', 'triệu'],
    'MINION': ['trăm', 'mươi', 'nghìn'],
    'THOUSAND': ['trăm', 'mươi', ''],
  };

  // Constants for positions in a group
  UNIT_EACH_GROUP: string[] = ['HUNDRED', 'TENS', 'UNITS'];

  // Index of UNIT_EACH_GROUP
  AT_HUNDRED: number = 0;
  AT_TEN: number = 1;
  AT_UNIT: number = 2;

  constructor(config: Partial<SpellerConfig> = {}) {
    // Apply configuration overrides in a browser-compatible way
    for (const key in config) {
      if (Object.prototype.hasOwnProperty.call(config, key)) {
        // @ts-ignore - This is safe as we're only overriding existing properties
        this[key] = (config as any)[key];
      }
    }
  }
}
