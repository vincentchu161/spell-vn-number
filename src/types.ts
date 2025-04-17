export type InputNumber = string | number;

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
  pointSign: string = '.';
  thousandSign: string = ',';
  periodSize: number = 3;
  filledDigit: string = '0';
  // Controls how to handle redundant zeros
  keepTrailingZero: boolean = false; // When true, '000.000' -> '0.0', when false, '000.000' -> '0.'
  keepLeadingPointZero: boolean = true; // When true, '00.001' -> '0.001', when false, '00.001' -> '.001'

  // Vietnamese specific text
  negativeText: string = 'âm';
  pointText: string = 'chấm';
  oddText: string = 'lẻ';
  tenText: string = 'mười';
  tenToneText: string = 'mươi';
  hundredText: string = 'trăm';

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

  // Unit mapping
  UNIT_GROUP_MAPPER: Record<string, string[]> = {
    'BILLION': ['trăm', 'mươi', 'triệu'],
    'MINION': ['trăm', 'mươi', 'nghìn'],
    'THOUSAND': ['trăm', 'mươi', ''],
  };

  UNIT_OF_GROUP: Record<string, string> = {
    'BILLION': 'tỷ',
    'MINION': 'triệu',
    'THOUSAND': 'nghìn',
  };

  // Constants for positions in a group
  UNIT_EACH_GROUP: string[] = ['HUNDRED', 'TENS', 'UNITS'];
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
