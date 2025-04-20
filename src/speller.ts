import {
  Index,
  InputNumber,
  InvalidFormatError,
  InvalidNumberError,
  NUMBER_OF_GROUPS,
  NUMBER_OF_POSITIONS,
  NumberData,
  SpellerConfig
} from './types';

/**
 * Process a section of the number by splitting it into groups and spelling each group
 * @param spelledParts
 * @param config SpellerConfig instance
 * @param numberStr The number string to process
 * @returns Array of spelled parts
 */
function processPart(spelledParts: string[], config: SpellerConfig, numberStr: string): string[] {
  if (numberStr === '') {
    return [];
  }

  const mod = numberStr.length % NUMBER_OF_POSITIONS;
  // Add zeros to the beginning if length is not divisible by NUMBER_OF_POSITIONS
  let paddedNumber = numberStr;
  if (mod !== 0) {
    paddedNumber = '0'.repeat(NUMBER_OF_POSITIONS - mod) + numberStr;
  }

  const arrNum = paddedNumber.split('');
  const totalThreeDigitSegments = arrNum.length / NUMBER_OF_POSITIONS; // Not odd because already padded

  const magnitudeMod = totalThreeDigitSegments % NUMBER_OF_GROUPS;
  let remainingGroups = magnitudeMod === 0
      ? totalThreeDigitSegments / NUMBER_OF_GROUPS
      : Math.floor(totalThreeDigitSegments / NUMBER_OF_GROUPS) + 1;

  let currentMagnitudeIndex = magnitudeMod !== 0 ? NUMBER_OF_GROUPS - magnitudeMod : Index.BILLION;

  let isFirst = true;
  let i = 0;

  while (remainingGroups > 0) {
    // THOUSAND/MILLION/BILLION (Unit of magnitude groups)
    if (!isFirst) {
      // Add unit for the group
      spelledParts.push(config.getUnitName(currentMagnitudeIndex));
    }

    // Group indices (chỉ số nhóm)
    for (; currentMagnitudeIndex <= Index.THOUSAND; currentMagnitudeIndex++) {
      // Process three digits at a time
      const hundredsDigit = arrNum[i];
      const tensDigit = arrNum[i + 1];
      const unitsDigit = arrNum[i + 2];
      i += 3;

      if (isFirst) {
        // Process hundreds
        if (hundredsDigit !== '0') {
          isFirst = false;
          spellHundreds(spelledParts, config, hundredsDigit, tensDigit, unitsDigit);
        }
        // Process tens
        if (!isFirst || tensDigit !== '0') {
          isFirst = false;
          spellTens(spelledParts, config, tensDigit, unitsDigit);
        }
        // Process units
        if (!isFirst || unitsDigit !== '0') {
          isFirst = false;
          spellUnits(spelledParts, config, hundredsDigit, tensDigit, unitsDigit, currentMagnitudeIndex);
        }
        // If all digits are zero, return "không"
        if (isFirst) {
          isFirst = false;
          spelledParts.push(config.getDigit('0'));
        }
      } else {
        // Process hundreds
        spellHundreds(spelledParts, config, hundredsDigit, tensDigit, unitsDigit);
        // Process tens
        spellTens(spelledParts, config, tensDigit, unitsDigit);
        // Process units
        spellUnits(spelledParts, config, hundredsDigit, tensDigit, unitsDigit, currentMagnitudeIndex);
      }
    }

    remainingGroups--;
    currentMagnitudeIndex = Index.BILLION;
  }

  return spelledParts;
}

/**
 * Spell a digit and its unit based on its position and context
 * @param spelledParts
 * @param config SpellerConfig instance
 * @param hundredsDigit Digit at hundreds position
 * @param tensDigit Digit at tens position
 * @param unitsDigit Digit at units position
 * @param currentMagnitudeIndex Index of the magnitude type (thousand, million, billion)
 * @returns Array of spelled parts
 */
function spellUnits(
  spelledParts: string[],
  config: SpellerConfig,
  hundredsDigit: string,
  tensDigit: string,
  unitsDigit: string,
  currentMagnitudeIndex: number
): void {
  if (unitsDigit === '0') {
    if ((tensDigit !== '0' || hundredsDigit !== '0')) {
      // Unit digit is zero, but hundreds or tens are not both zero ⇒ still need to read the unit for correct group reading.
      if (currentMagnitudeIndex !== Index.THOUSAND) {
        spelledParts.push(config.getUnitNameOfMagnitude(currentMagnitudeIndex));
      }
    }
    return; // return...
  }

  if (unitsDigit === '1') {
    if (tensDigit !== '0' && tensDigit !== '1') {
      spelledParts.push(config.oneToneText);
    } else {
      spelledParts.push(config.getDigit(unitsDigit));
    }
  } else if (unitsDigit === '4') {
    if (tensDigit !== '0' && tensDigit !== '1') {
      spelledParts.push(config.fourToneText);
    } else {
      spelledParts.push(config.getDigit(unitsDigit));
    }
  } else if (unitsDigit === '5') {
    if (tensDigit !== '0') {
      spelledParts.push(config.fiveToneText);
    } else {
      spelledParts.push(config.getDigit(unitsDigit));
    }
  } else {
    spelledParts.push(config.getDigit(unitsDigit));
  }

  // 2. Add unit if needed (spelled is not empty)
  if (currentMagnitudeIndex !== Index.THOUSAND) {
    spelledParts.push(config.getUnitNameOfMagnitude(currentMagnitudeIndex));
  }
}

/**
 * Spell a digit and its unit based on its position and context
 * @param spelledParts
 * @param config SpellerConfig instance
 * @param tensDigit Digit at tens position
 * @param unitsDigit Digit at units position
 * @returns Array of spelled parts
 */
function spellTens(
  spelledParts: string[],
  config: SpellerConfig,
  tensDigit: string,
  unitsDigit: string
): void {

  if (tensDigit === '0') {
    if (unitsDigit !== '0') {
      spelledParts.push(config.oddText);
    }
  } else if (tensDigit === '1') {
    spelledParts.push(config.tenText);
  } else {
    spelledParts.push(config.getDigit(tensDigit));
    spelledParts.push(config.getUnitName(Index.TENS));
  }
}

/**
 * Spell a digit and its unit based on its position and context
 * @param spelledParts
 * @param config SpellerConfig instance
 * @param hundredsDigit Digit at hundreds position
 * @param tensDigit Digit at tens position
 * @param unitsDigit Digit at units position
 * @returns Array of spelled parts
 */
function spellHundreds(
  spelledParts: string[],
  config: SpellerConfig,
  hundredsDigit: string,
  tensDigit: string,
  unitsDigit: string
): void {
  if (hundredsDigit === '0') {
    if (!(tensDigit === '0' && unitsDigit === '0')) {
      spelledParts.push(config.getDigit(hundredsDigit));
      spelledParts.push(config.getUnitName(Index.HUNDREDS));
    }
  } else {
    spelledParts.push(config.getDigit(hundredsDigit));
    spelledParts.push(config.getUnitName(Index.HUNDREDS));
  }
}

/**
 * Main function to spell a Vietnamese number
 * @param config SpellerConfig instance
 * @param input Number to spell
 * @returns Vietnamese spelling of the number
 */
export function spellVnNumber(config: SpellerConfig, input: InputNumber): string {
  // Parse the number using the configurable parser
  const numberData = config.parseNumberData(input);

  // Spell out each part
  const spelledParts: string[] = [];

  // Add negative sign if needed
  if (numberData.isNegative) {
    spelledParts.push(config.negativeText);
  }

  // Process integral part
  processPart(spelledParts, config, numberData.integralPart);

  // Process fractional part if exists
  if (numberData.fractionalPart.length > 0) {
    spelledParts.push(config.pointText);
    processPart(spelledParts, config, numberData.fractionalPart);
  }

  // Capitalize the first letter if capitalizeInitial is true
  if (config.capitalizeInitial) {
    const firstNumb = spelledParts[0];
    spelledParts[0] = firstNumb.charAt(0).toUpperCase() + firstNumb.slice(1);
  }

  // Join all parts with the separator
  let result = spelledParts.join(config.separator);

  // After joining all parts, append the currency unit if provided
  if (config.currencyUnit) {
    result += ` ${config.currencyUnit}`;
  }

  return result;
}

/**
 * Convenience function to spell a Vietnamese number with default config
 * @param input Number to spell
 * @returns Vietnamese spelling of the number
 */
export function spell(input: InputNumber): string {
  const config = new SpellerConfig();
  return spellVnNumber(config, input);
}

/**
 * Convenience function to spell a Vietnamese number with default value on error
 * @param input Number to spell
 * @param subConfig Partial<SpellerConfig> to override default configuration
 * @param defaultOnError Default value to return when an error occurs. If undefined, the error will be thrown.
 * @returns Vietnamese spelling of the number or defaultOnError if an error occurs
 * @throws InvalidFormatError when input format is invalid
 * @throws InvalidNumberError when number is invalid
 * @throws Error for other unexpected errors
 */
export function spellOrDefault(
  input: InputNumber,
  subConfig: Partial<SpellerConfig> = {},
  defaultOnError?: string
): string {
  const config = new SpellerConfig(subConfig);
  try {
    return spellVnNumber(config, input);
  } catch (err) {
    if (defaultOnError === undefined) {
      throw err;
    }

    if (err instanceof InvalidFormatError) {
      console.warn(err.name, err.message, '(', input, typeof input, ')');
    } else if (err instanceof InvalidNumberError) {
      console.warn(err.name, err.message, '(', input, typeof input, ')');
    } else {
      console.error('Unexpected error with input', '(', input, typeof input, '):', err);
    }

    return defaultOnError;
  }
}
