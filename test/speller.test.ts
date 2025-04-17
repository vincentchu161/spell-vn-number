import { describe, expect, it } from '@jest/globals';
import { spell, spellVnNumber, SpellerConfig, InvalidNumberError } from '../src';
import {truncateIncorrectZeros} from "../src/utils";

describe('Vietnamese Number Speller', () => {
  // Test utility functions
  describe('truncateIncorrectZeros function', () => {
    it('should trim redundant zeros correctly with default settings', () => {
      const config = { pointSign: '.', filledDigit: '0' };

      // Test integral part only
      expect(truncateIncorrectZeros(config, '0')).toBe('0');
      expect(truncateIncorrectZeros(config, '00123')).toBe('123');
      expect(truncateIncorrectZeros(config, '00010')).toBe('10');

      // Test with decimal point - default behavior
      expect(truncateIncorrectZeros(config, '00123.4560')).toBe('123.456');
      expect(truncateIncorrectZeros(config, '0.0')).toBe('0.');
      expect(truncateIncorrectZeros(config, '00.00100')).toBe('0.001');
      expect(truncateIncorrectZeros(config, '000.000')).toBe('0.');
    });

    it('should respect keepTrailingZero flag', () => {
      const config = {
        pointSign: '.',
        filledDigit: '0',
        keepTrailingZero: true
      };

      expect(truncateIncorrectZeros(config, '123.4560')).toBe('123.4560');
      expect(truncateIncorrectZeros(config, '0.0')).toBe('0.0');
      expect(truncateIncorrectZeros(config, '000.000')).toBe('0.000');
      expect(truncateIncorrectZeros(config, '00.00100')).toBe('0.00100');
    });

    it('should always keep at least one digit for integral part', () => {
      const config = { pointSign: '.', filledDigit: '0' };

      expect(truncateIncorrectZeros(config, '00')).toBe('0');
      expect(truncateIncorrectZeros(config, '00.123')).toBe('0.123');
      expect(truncateIncorrectZeros(config, '000.001')).toBe('0.001');
    });

    it('should handle custom keepLeadingPointZero and keepTrailingZero settings', () => {
      const config1 = {
        pointSign: '.',
        filledDigit: '0',
        keepTrailingZero: true,
        keepLeadingPointZero: true
      };

      expect(truncateIncorrectZeros(config1, '00.00100')).toBe('0.00100');
      expect(truncateIncorrectZeros(config1, '000.000')).toBe('0.000');

      const config2 = {
        pointSign: '.',
        filledDigit: '0',
        keepTrailingZero: false,
        keepLeadingPointZero: false
      };

      // keepLeadingPointZero: false is ignored in current implementation
      // to always ensure the integral part has at least one digit
      expect(truncateIncorrectZeros(config2, '00.00100')).toBe('0.001');
      expect(truncateIncorrectZeros(config2, '000.000')).toBe('0.');
    });
  });

  // Test convenience function
  describe('spell function', () => {
    it('should spell numbers correctly with default config', () => {
      expect(spell('110,000,031,000,001')).toBe(
        'một trăm mười nghìn tỷ không trăm ba mươi mốt triệu không trăm lẻ một'
      );
      expect(spell('1,111,105')).toBe(
        'một triệu một trăm mười một nghìn một trăm lẻ năm'
      );
      expect(spell('1,111,115')).toBe(
        'một triệu một trăm mười một nghìn một trăm mười lăm'
      );
    });
  });

  // Test main function with custom config
  describe('spellVnNumber function', () => {
    it('should throw InvalidNumberError for invalid number format', () => {
      const config = new SpellerConfig();
      expect(() => spellVnNumber(config, '1..23')).toThrow(InvalidNumberError);
      expect(() => spellVnNumber(config, '--1.23')).toThrow(InvalidNumberError);
      expect(() => spellVnNumber(config, 'abc123')).toThrow(InvalidNumberError);
    });

    it('should handle very large numbers by cycling through units', () => {
      const config = new SpellerConfig();
      // With default config, we have 3 unit groups: BILLION, MINION, THOUSAND
      // This should repeat the units rather than throw an error
      expect(spellVnNumber(config, '1000000000000000000000')).toContain('tỷ');
    });

    it('should handle zero correctly', () => {
      const config = new SpellerConfig();
      expect(spellVnNumber(config, '0')).toBe('không');
      expect(spellVnNumber(config, '000')).toBe('không');
      expect(spellVnNumber(config, '00.00')).toBe('không');
    });

    it('should handle negative numbers', () => {
      const config = new SpellerConfig();
      expect(spellVnNumber(config, '-123')).toBe('âm một trăm hai mươi ba');
      expect(spellVnNumber(config, '-1.23')).toBe('âm một chấm hai mươi ba');
    });

    it('should handle decimal numbers', () => {
      const config = new SpellerConfig();
      expect(spellVnNumber(config, '123.45')).toBe('một trăm hai mươi ba chấm bốn mươi lăm');
      expect(spellVnNumber(config, '0.123')).toBe('không chấm một trăm hai mươi ba');
    });

    it('should handle numbers with thousands separators', () => {
      const config = new SpellerConfig();
      expect(spellVnNumber(config, '1,234,567')).toBe(
        'một triệu hai trăm ba mươi tư nghìn năm trăm sáu mươi bảy'
      );
    });

    it('should handle special cases correctly', () => {
      const config = new SpellerConfig();

      // Test for digit 1 in unit position
      expect(spellVnNumber(config, '21')).toBe('hai mươi mốt');
      expect(spellVnNumber(config, '11')).toBe('mười một');

      // Test for digit 4 in unit position
      expect(spellVnNumber(config, '24')).toBe('hai mươi tư');
      expect(spellVnNumber(config, '14')).toBe('mười bốn');

      // Test for digit 5 in unit position
      expect(spellVnNumber(config, '25')).toBe('hai mươi lăm');
      expect(spellVnNumber(config, '15')).toBe('mười lăm');
      expect(spellVnNumber(config, '5')).toBe('năm');

      // Test for zeros in different positions
      expect(spellVnNumber(config, '101')).toBe('một trăm lẻ một');
      expect(spellVnNumber(config, '1001')).toBe('một nghìn không trăm lẻ một');
    });

    // Test the examples from the original code
    it('should match all the example cases', () => {
      const config = new SpellerConfig();

      expect(spellVnNumber(config, '110,000,031,000,001')).toBe(
        'một trăm mười nghìn tỷ không trăm ba mươi mốt triệu không trăm lẻ một'
      );

      expect(spellVnNumber(config, '20,000,000,000,000,000,000')).toBe(
        'hai mươi tỷ tỷ'
      );

      expect(spellVnNumber(config, '2,300,000,000,000,000')).toBe(
        'hai triệu ba trăm nghìn tỷ'
      );

      expect(spellVnNumber(config, '2,300,000,111,110,123')).toBe(
        'hai triệu ba trăm nghìn tỷ một trăm mười một triệu một trăm mười nghìn một trăm hai mươi ba'
      );

      expect(spellVnNumber(config, '2,300,000,111,110,103')).toBe(
        'hai triệu ba trăm nghìn tỷ một trăm mười một triệu một trăm mười nghìn một trăm lẻ ba'
      );

      expect(spellVnNumber(config, '1,111,105')).toBe(
        'một triệu một trăm mười một nghìn một trăm lẻ năm'
      );

      expect(spellVnNumber(config, '1,111,115')).toBe(
        'một triệu một trăm mười một nghìn một trăm mười lăm'
      );

      expect(spellVnNumber(config, '1,111,104')).toBe(
        'một triệu một trăm mười một nghìn một trăm lẻ bốn'
      );

      expect(spellVnNumber(config, '1,111,114')).toBe(
        'một triệu một trăm mười một nghìn một trăm mười bốn'
      );

      expect(spellVnNumber(config, '1,111,134')).toBe(
        'một triệu một trăm mười một nghìn một trăm ba mươi tư'
      );

      expect(spellVnNumber(config, '1100000000000')).toBe(
        'một nghìn một trăm tỷ'
      );

      expect(spellVnNumber(config, '1100000000000000')).toBe(
        'một triệu một trăm nghìn tỷ'
      );

      expect(spellVnNumber(config, '1100000000000000000.1100000000000000000')).toBe(
        'một tỷ một trăm triệu tỷ chấm mười một'
      );
    });

    it('should work with a customized config', () => {
      const customConfig = new SpellerConfig({
        separator: '-',
        pointText: 'phẩy',
        digits: {
          0: 'không',
          1: 'một',
          2: 'hai',
          3: 'ba',
          4: 'bốn',
          5: 'năm',
          6: 'sáu',
          7: 'bảy',
          8: 'tám',
          9: 'chín',
        },
      });

      expect(spellVnNumber(customConfig, '123.45')).toBe('một-trăm-hai-mươi-ba-phẩy-bốn-mươi-lăm');
    });
  });
});
