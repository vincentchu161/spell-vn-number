import { describe, expect, it } from '@jest/globals';
import { spell, spellVnNumber, SpellerConfig } from '../src';


describe('Advanced Vietnamese Number Speller Tests', () => {
  describe('Boundary cases and edge values', () => {
    it('should handle extremely large numbers', () => {
      const config = new SpellerConfig();
      // Test with a number having multiple unit cycles
      const largeNumber = '9'.repeat(100);
      expect(spellVnNumber(config, largeNumber)).toBeTruthy();
      expect(spellVnNumber(config, largeNumber).length).toBeGreaterThan(100);
    });

    it('should handle very precise decimal numbers', () => {
      const config = new SpellerConfig();
      // Test with a number having many decimal places
      const preciseNumber = '0.' + '1'.repeat(20);
      const result = spellVnNumber(config, preciseNumber);
      expect(result).toContain('chấm');
      expect(result.split('chấm')[1].trim().length).toBeGreaterThan(10);
    });

    it('should handle Number.MAX_SAFE_INTEGER and beyond', () => {
      const config = new SpellerConfig();
      const maxSafeInt = Number.MAX_SAFE_INTEGER.toString();
      expect(spellVnNumber(config, maxSafeInt)).toBeTruthy();

      // Beyond max safe integer
      const beyondMaxSafe = (Number.MAX_SAFE_INTEGER + 1).toString();
      expect(spellVnNumber(config, beyondMaxSafe)).toBeTruthy();
    });
  });

  describe('Configuration testing', () => {
    it('should handle custom unit names', () => {
      const customConfig = new SpellerConfig({
        unitNames: {
          0: 'tỉ',    // magnitude unit: billion
          2: 'ngàn',  // magnitude unit: thousand
        }
      });

      expect(spellVnNumber(customConfig, '1,000')).toBe('Một ngàn');
      expect(spellVnNumber(customConfig, '1,000,000,000')).toBe('Một tỉ');
      expect(spellVnNumber(customConfig, '1,000,000')).toBe('Một triệu');
    });

    it('should handle custom digit names', () => {
      const customConfig = new SpellerConfig({
        digitNames: {
          '0': 'không',
          '1': 'một',
          '2': 'hai',
          '3': 'ba',
          '4': 'tư',      // Changed from 'bốn'
          '5': 'lăm',     // Changed from 'năm'
          '6': 'sáu',
          '7': 'bảy',
          '8': 'tám',
          '9': 'chín'
        },
      });

      expect(spellVnNumber(customConfig, '45')).toBe('Tư mươi lăm');
    });

    it('should handle different decimal point text', () => {
      const customConfig = new SpellerConfig({
        pointText: 'phẩy'   // Changed from 'chấm'
      });

      expect(spellVnNumber(customConfig, '1.5')).toBe('Một phẩy năm');
    });

    it('should handle different separators', () => {
      const customConfig = new SpellerConfig({
        separator: '_'   // Changed from space
      });

      expect(spellVnNumber(customConfig, '123')).toBe('Một_trăm_hai_mươi_ba');
    });

    it('should handle custom decimal handling configuration', () => {
      const config = new SpellerConfig({
        keepOneZeroWhenAllZeros: true
      });

      expect(spellVnNumber(config, '10.0')).toContain('chấm không');
    });

    it('should handle custom specific text', () => {
      const customConfig = new SpellerConfig({
        specificText: {
          oddText: 'lẻ',
          tenText: 'mười',
          oneToneText: 'mốt',
          fourToneText: 'tư',
          fiveToneText: 'lăm'
        }
      });

      expect(spellVnNumber(customConfig, '101')).toBe('Một trăm lẻ một');
      expect(spellVnNumber(customConfig, '21')).toBe('Hai mươi mốt');
      expect(spellVnNumber(customConfig, '24')).toBe('Hai mươi tư');
      expect(spellVnNumber(customConfig, '25')).toBe('Hai mươi lăm');
    });
  });

  describe('Special cases in Vietnamese spelling', () => {
    it('should handle the special "lẻ" case correctly', () => {
      const config = new SpellerConfig();

      // Cases where "lẻ" should be used
      expect(spellVnNumber(config, '101')).toBe('Một trăm lẻ một');
      expect(spellVnNumber(config, '1001')).toBe('Một nghìn không trăm lẻ một');
      expect(spellVnNumber(config, '10001')).toBe('Mười nghìn không trăm lẻ một');

      // Cases where "lẻ" should not be used
      expect(spellVnNumber(config, '110')).toBe('Một trăm mười');
      expect(spellVnNumber(config, '1010')).toBe('Một nghìn không trăm mười');
    });

    it('should handle special pronunciation rules for "một", "tư", "lăm"', () => {
      const config = new SpellerConfig();

      // Special cases for "một" -> "mốt"
      expect(spellVnNumber(config, '21')).toBe('Hai mươi mốt');
      expect(spellVnNumber(config, '31')).toBe('Ba mươi mốt');

      // Special cases for "bốn" -> "tư"
      expect(spellVnNumber(config, '24')).toBe('Hai mươi tư');
      expect(spellVnNumber(config, '34')).toBe('Ba mươi tư');

      // Special cases for "năm" -> "lăm"
      expect(spellVnNumber(config, '25')).toBe('Hai mươi lăm');
      expect(spellVnNumber(config, '35')).toBe('Ba mươi lăm');

      // Regular usage
      expect(spellVnNumber(config, '1')).toBe('Một');
      expect(spellVnNumber(config, '4')).toBe('Bốn');
      expect(spellVnNumber(config, '5')).toBe('Năm');
    });
  });

  describe('Convenience function (spell) with additional tests', () => {
    it('should handle compact input formats correctly', () => {
      // Without separators
      expect(spell('1234567')).toBe('Một triệu hai trăm ba mươi tư nghìn năm trăm sáu mươi bảy');

      // With various types of input
      expect(spell(1234567)).toBe('Một triệu hai trăm ba mươi tư nghìn năm trăm sáu mươi bảy');
      expect(spell(BigInt('1234567'))).toBe('Một triệu hai trăm ba mươi tư nghìn năm trăm sáu mươi bảy');
    });

    it('should handle complex combinations of numbers', () => {
        expect(spell('1,000,200,034,000,567,890')).toBe(
            'Một tỷ hai trăm nghìn không trăm ba mươi tư tỷ năm trăm sáu mươi bảy nghìn tám trăm chín mươi'
          );
    });

    it('should handle numbers beyond MAX_SAFE_INTEGER', function() {
      const beyondMaxSafe = (Number.MAX_SAFE_INTEGER + 1).toString();
      // console.log(beyondMaxSafe) //9,007,199,254,740,992
      expect(spell(beyondMaxSafe)).toBe('Chín triệu không trăm lẻ bảy nghìn một trăm chín mươi chín tỷ hai trăm năm mươi tư triệu bảy trăm bốn mươi nghìn chín trăm chín mươi hai');
    });

    it('should handle very large numbers', function() {
      expect(spell('1000000000000000000')).toBe('Một tỷ tỷ');
    });

    it('should handle numbers with many decimal places', function() {
      expect(spell('123.456789')).toBe('Một trăm hai mươi ba chấm bốn trăm năm mươi sáu nghìn bảy trăm tám mươi chín');
    });

    it('should handle numbers with leading zeros', function() {
      expect(spell('00123')).toBe('Một trăm hai mươi ba');
    });

    it('should handle numbers with trailing zeros after decimal', function() {
      expect(spell('123.45000')).toBe('Một trăm hai mươi ba chấm bốn mươi lăm');
    });
  });
});
