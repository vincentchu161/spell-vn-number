import { describe, expect, it } from '@jest/globals';
import { spell, spellVnNumber, SpellerConfig, InvalidNumberError } from '../src';

describe('Vietnamese Number Speller', () => {
  // Test convenience function
  describe('spell function', () => {
    it('should spell numbers correctly with default config', () => {
      expect(spell('110,000,031,000,001')).toBe(
        'Một trăm mười nghìn tỷ không trăm ba mươi mốt triệu không trăm lẻ một'
      );
      expect(spell('1,111,105')).toBe(
        'Một triệu một trăm mười một nghìn một trăm lẻ năm'
      );
      expect(spell('1,111,115')).toBe(
        'Một triệu một trăm mười một nghìn một trăm mười lăm'
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
      expect(spellVnNumber(config, '0')).toBe('Không');
      expect(spellVnNumber(config, '000')).toBe('Không');
      expect(spellVnNumber(config, '00.00')).toBe('Không');
    });

    it('should handle negative numbers', () => {
      const config = new SpellerConfig();
      expect(spellVnNumber(config, '-123')).toBe('Âm một trăm hai mươi ba');
      expect(spellVnNumber(config, '-1.23')).toBe('Âm một chấm hai mươi ba');
    });

    it('should handle decimal numbers', () => {
      const config = new SpellerConfig();
      expect(spellVnNumber(config, '123.45')).toBe('Một trăm hai mươi ba chấm bốn mươi lăm');
      expect(spellVnNumber(config, '0.123')).toBe('Không chấm một trăm hai mươi ba');
    });

    it('should handle numbers with thousands separators', () => {
      const config = new SpellerConfig();
      expect(spellVnNumber(config, '1,234,567')).toBe(
        'Một triệu hai trăm ba mươi tư nghìn năm trăm sáu mươi bảy'
      );
    });

    it('should handle special cases correctly', () => {
      const config = new SpellerConfig();

      // Test for digit 1 in unit position
      expect(spellVnNumber(config, '21')).toBe('Hai mươi mốt');
      expect(spellVnNumber(config, '11')).toBe('Mười một');

      // Test for digit 4 in unit position
      expect(spellVnNumber(config, '24')).toBe('Hai mươi tư');
      expect(spellVnNumber(config, '14')).toBe('Mười bốn');

      // Test for digit 5 in unit position
      expect(spellVnNumber(config, '25')).toBe('Hai mươi lăm');
      expect(spellVnNumber(config, '15')).toBe('Mười lăm');
      expect(spellVnNumber(config, '5')).toBe('Năm');

      // Test for zeros in different positions
      expect(spellVnNumber(config, '101')).toBe('Một trăm lẻ một');
      expect(spellVnNumber(config, '1001')).toBe('Một nghìn không trăm lẻ một');
    });

    // Test the examples from the original code
    it('should match all the example cases', () => {
      const config = new SpellerConfig();

      expect(spellVnNumber(config, '110,000,031,000,001')).toBe(
        'Một trăm mười nghìn tỷ không trăm ba mươi mốt triệu không trăm lẻ một'
      );

      expect(spellVnNumber(config, '20,000,000,000,000,000,000')).toBe(
        'Hai mươi tỷ tỷ'
      );

      expect(spellVnNumber(config, '2,300,000,000,000,000')).toBe(
        'Hai triệu ba trăm nghìn tỷ'
      );

      expect(spellVnNumber(config, '2,300,000,111,110,123')).toBe(
        'Hai triệu ba trăm nghìn tỷ một trăm mười một triệu một trăm mười nghìn một trăm hai mươi ba'
      );

      expect(spellVnNumber(config, '2,300,000,111,110,103')).toBe(
        'Hai triệu ba trăm nghìn tỷ một trăm mười một triệu một trăm mười nghìn một trăm lẻ ba'
      );

      expect(spellVnNumber(config, '1,111,105')).toBe(
        'Một triệu một trăm mười một nghìn một trăm lẻ năm'
      );

      expect(spellVnNumber(config, '1,111,115')).toBe(
        'Một triệu một trăm mười một nghìn một trăm mười lăm'
      );

      expect(spellVnNumber(config, '1,111,104')).toBe(
        'Một triệu một trăm mười một nghìn một trăm lẻ bốn'
      );

      expect(spellVnNumber(config, '1,111,114')).toBe(
        'Một triệu một trăm mười một nghìn một trăm mười bốn'
      );

      expect(spellVnNumber(config, '1,111,134')).toBe(
        'Một triệu một trăm mười một nghìn một trăm ba mươi tư'
      );

      expect(spellVnNumber(config, '1100000000000')).toBe(
        'Một nghìn một trăm tỷ'
      );

      expect(spellVnNumber(config, '1100000000000000')).toBe(
        'Một triệu một trăm nghìn tỷ'
      );

      expect(spellVnNumber(config, '1100000000000000000.1100000000000000000')).toBe(
        'Một tỷ một trăm triệu tỷ chấm mười một'
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

      expect(spellVnNumber(customConfig, '123.45')).toBe('Một-trăm-hai-mươi-ba-phẩy-bốn-mươi-lăm');
    });

    it('should capitalize the first letter when capitalizeInitial is false', () => {
      const config = new SpellerConfig({ capitalizeInitial: false });
      expect(spellVnNumber(config, '123')).toBe('một trăm hai mươi ba');
      expect(spellVnNumber(config, '1,234.56')).toBe('một nghìn hai trăm ba mươi tư chấm năm mươi sáu');
      expect(spellVnNumber(config, '-1000000')).toBe('âm một triệu');
    });
  });
});
