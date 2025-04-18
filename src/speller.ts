import {InputNumber, NumberData, SpellerConfig} from './types';
import {cleanInputNumber, handleRedundantZeros} from './utils';

/**
 * Process a section of the number by splitting it into groups and spelling each group
 * @param config SpellerConfig instance
 * @param numberStr The number string to process
 * @returns Array of spelled parts
 */
function processPart(config: SpellerConfig, numberStr: string): string[] {
  if (numberStr === '') {
    return [];
  }

  const mod = numberStr.length % config.UNIT_EACH_GROUP.length;
  // Add zeros to the beginning if length is not divisible by UNIT_EACH_GROUP.length
  let paddedNumber = numberStr;
  if (mod !== 0) {
    const offset = config.UNIT_EACH_GROUP.length - mod;
    paddedNumber = '0'.repeat(offset) + numberStr;
  }

  const arrNum = paddedNumber.split('');
  const numbSpelled: string[] = [];
  const totalDigitGroup = arrNum.length / config.UNIT_EACH_GROUP.length; // Not odd because already padded

  const periodGroupSize = config.UNIT_GROUP.length;
  const periodGroupMod = totalDigitGroup % periodGroupSize;
  const totalPeriodGroup = periodGroupMod === 0
    ? totalDigitGroup / periodGroupSize
    : Math.floor(totalDigitGroup / periodGroupSize) + 1;

  let groupEachPeriodIndex = periodGroupMod === 0 ? periodGroupMod : periodGroupSize - periodGroupMod;

  let isFirst = true;
  let i = 0;
  let remainingGroups = totalPeriodGroup;

  while (remainingGroups > 0) {
    // THOUSAND/MILLION/BILLION (Unit of UNIT_GROUP)
    if (!isFirst) {
      // Add unit for the group
      const unit = config.UNIT_OF_GROUP[config.UNIT_GROUP[groupEachPeriodIndex]];
      numbSpelled.push(unit);
    }

    for (; groupEachPeriodIndex < config.UNIT_GROUP.length; groupEachPeriodIndex++) {
      // Process three digits at a time
      const arrNumb = [arrNum[i], arrNum[i+1], arrNum[i+2]];
      i += 3;

      if (isFirst) {
        isFirst = false;
        const firstSpelled = firstSpellThreeDigit(config, arrNumb, groupEachPeriodIndex);
        for (let j = 0; j < firstSpelled.length; j++) {
          numbSpelled.push(firstSpelled[j]);
        }
      } else {
        const spelled = spellThreeDigit(config, arrNumb, groupEachPeriodIndex);
        for (let j = 0; j < spelled.length; j++) {
          numbSpelled.push(spelled[j]);
        }
      }
    }

    remainingGroups--;
    groupEachPeriodIndex = 0;
  }

  return numbSpelled;
}

/**
 * Spell the first three digits of a number
 * @param config SpellerConfig instance
 * @param arrNumb Array of three digit characters
 * @param groupEachPeriodIndex Index of the unit group
 * @returns Array of spelled parts
 */
function firstSpellThreeDigit(config: SpellerConfig, arrNumb: string[], groupEachPeriodIndex: number): string[] {
  const spelled: string[] = [];

  let isFirst = true;
  for (let atIndex = 0; atIndex < arrNumb.length; atIndex++) {
    if (isFirst && arrNumb[atIndex] !== '0') {
      isFirst = false;
    }

    if (!isFirst) {
      const specialSpelled = spellSpecialDigit(config, arrNumb, atIndex, groupEachPeriodIndex);
      for (let j = 0; j < specialSpelled.length; j++) {
        spelled.push(specialSpelled[j]);
      }
    }
  }

  // If all digits are zero, return "không"
  if (spelled.length === 0) {
    spelled.push(config.digits['0']);
  }

  return spelled;
}

/**
 * Spell three digits of a number
 * @param config SpellerConfig instance
 * @param arrNumb Array of three digit characters
 * @param groupEachPeriodIndex Index of the unit group
 * @returns Array of spelled parts
 */
function spellThreeDigit(config: SpellerConfig, arrNumb: string[], groupEachPeriodIndex: number): string[] {
  const spelled: string[] = [];

  for (let atIndex = 0; atIndex < arrNumb.length; atIndex++) {
    const specialSpelled = spellSpecialDigit(config, arrNumb, atIndex, groupEachPeriodIndex);
    for (let j = 0; j < specialSpelled.length; j++) {
      spelled.push(specialSpelled[j]);
    }
  }

  return spelled;
}

/**
 * Spell a special digit based on its position and context
 * @param config SpellerConfig instance
 * @param arrNumb Array of three digit characters
 * @param atIndex Index within the three-digit group
 * @param groupEachPeriodIndex Index of the unit group
 * @returns Array of spelled parts
 */
function spellSpecialDigit(
  config: SpellerConfig,
  arrNumb: string[],
  atIndex: number,
  groupEachPeriodIndex: number
): string[] {
  const currentNumb = arrNumb[atIndex];
  const parts: string[] = [];

  // 1.SPELL currentNumb
  switch (currentNumb) {
    case '0':
      if (atIndex === config.AT_UNIT) {
        // UNIT position
        // Empty for both cases
      } else if (atIndex === config.AT_TEN) {
        // TENS position
        if (arrNumb[atIndex + 1] !== '0') {
          parts.push(config.oddText);
        }
      } else {
        // HUNDREDS position
        if (arrNumb[atIndex + 1] === '0' && arrNumb[atIndex + 2] === '0') {
          // Empty
        } else {
          parts.push(config.digits[currentNumb]);
        }
      }
      break;

    case '1':
      if (atIndex === config.AT_UNIT) {
        // UNIT position
        const previousNumb = arrNumb[atIndex - 1];
        if (previousNumb !== '0' && previousNumb !== '1') {
          parts.push(config.oneToneText);
        } else {
          parts.push(config.digits[currentNumb]);
        }
      } else if (atIndex === config.AT_TEN) {
        // TENS position
        parts.push(config.tenText);
      } else {
        // HUNDREDS position
        parts.push(config.digits[currentNumb]);
      }
      break;

    case '4':
      if (atIndex === config.AT_UNIT) {
        // UNIT position
        if (arrNumb[atIndex - 1] !== '0' && arrNumb[atIndex - 1] !== '1') {
          parts.push(config.fourToneText);
        } else {
          parts.push(config.digits[currentNumb]);
        }
      } else {
        // TENS or HUNDREDS position
        parts.push(config.digits[currentNumb]);
      }
      break;

    case '5':
      if (atIndex === config.AT_UNIT) {
        // UNIT position
        if (arrNumb[atIndex - 1] !== '0') {
          parts.push(config.fiveToneText);
        } else {
          parts.push(config.digits[currentNumb]);
        }
      } else {
        // TENS or HUNDREDS position
        parts.push(config.digits[currentNumb]);
      }
      break;

    default:
      // For all other digits
      parts.push(config.digits[currentNumb]);
      break;
  }

  // 2.ADD UNIT FOR DIGIT
  const groupName = config.UNIT_GROUP[groupEachPeriodIndex];
  if (parts.length > 0) {
    // parts is not empty
    if (
      !(currentNumb === '1' && atIndex === config.AT_TEN) &&
      !(parts[0] === config.oddText && atIndex === config.AT_TEN)
    ) {
      // Number 1 is not read as "mười mươi" && number 0 is not read as "lẻ mươi"
      const unit = config.UNIT_GROUP_MAPPER[groupName][atIndex];
      if (unit !== '') {
        parts.push(unit);
      }
    }
  } else if (
    atIndex === config.AT_UNIT &&
    currentNumb === '0' &&
    (arrNumb[atIndex - 1] !== '0' || arrNumb[atIndex - 2] !== '0')
  ) {
    // Zero in unit position -> this reads the unit for the whole group (3 digits -> UNIT_EACH_GROUP.length).
    // (hundred & tens are not both zero)
    const unit = config.UNIT_GROUP_MAPPER[groupName][atIndex];
    if (unit !== '') {
      parts.push(unit);
    }
  }
  return parts;
}

/**
 * Parse a number string into structured number data
 * @param config SpellerConfig instance
 * @param input InputNumber
 * @returns Structured number data
 */
function parseNumberData(config: SpellerConfig, input: InputNumber): NumberData {
  // Clean and validate input
  let numberStr = cleanInputNumber(input, config);

  // Handle negative sign
  const isNegative = numberStr.startsWith(config.negativeSign);
  numberStr = isNegative ? numberStr.substring(config.negativeSign.length) : numberStr;

  // Trim redundant zeros
  numberStr = handleRedundantZeros(config, numberStr);

  // Split into integral and fractional parts
  const pointPos = numberStr.indexOf(config.decimalPoint);
  const integralPart = pointPos === -1 ? numberStr : numberStr.substring(0, pointPos);
  const fractionalPart = pointPos === -1 ? '' : numberStr.substring(pointPos + 1);

  return {
    isNegative,
    integralPart,
    fractionalPart,
  };
}

/**
 * Main function to spell a Vietnamese number
 * @param config SpellerConfig instance
 * @param input Number to spell
 * @returns Vietnamese spelling of the number
 */
export function spellVnNumber(config: SpellerConfig, input: InputNumber): string {
  // Parse the number
  const numberData = parseNumberData(config, input);

  // Spell out each part
  const numbSpelled: string[] = [];

  // Add negative sign if needed
  if (numberData.isNegative) {
    numbSpelled.push(config.negativeText);
  }

  // Process integral part
  const integralSpelling = processPart(config, numberData.integralPart);
  for (let i = 0; i < integralSpelling.length; i++) {
    numbSpelled.push(integralSpelling[i]);
  }

  // Process fractional part if exists
  if (numberData.fractionalPart.length > 0) {
    numbSpelled.push(config.pointText);
    const fractionalSpelling = processPart(config, numberData.fractionalPart);
    for (let i = 0; i < fractionalSpelling.length; i++) {
      numbSpelled.push(fractionalSpelling[i]);
    }
  }

  // Join all parts with the separator
  let result = numbSpelled.join(config.separator);

  // Capitalize the first letter if capitalizeInitial is true
  if (config.capitalizeInitial) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

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
