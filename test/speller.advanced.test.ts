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
      const beyondMaxSafe = BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1);
      expect(spellVnNumber(config, beyondMaxSafe.toString())).toBeTruthy();
    });
  });

  describe('Configuration testing', () => {
    it('should handle custom unit names', () => {
      const customConfig = new SpellerConfig({
        UNIT_OF_GROUP: {
          'THOUSAND': 'ngàn',  // Changed from 'nghìn'
          'MINION': 'triệu',
          'BILLION': 'tỉ'       // Changed from 'tỷ'
        },
        UNIT_GROUP_MAPPER: {
          'BILLION': ['trăm', 'mươi', 'triệu'],
          'MINION': ['trăm', 'mươi', 'ngàn'],  // Changed from 'nghìn'
          'THOUSAND': ['trăm', 'mươi', ''],
        }
      });
      
      expect(spellVnNumber(customConfig, '1,000')).toBe('một ngàn');
      expect(spellVnNumber(customConfig, '1,000,000,000')).toBe('một tỉ');
    });

    it('should handle custom digit names', () => {
      const customConfig = new SpellerConfig({
        digits: {
          0: 'không',
          1: 'một',
          2: 'hai',
          3: 'ba',
          4: 'tư',      // Changed from 'bốn'
          5: 'lăm',     // Changed from 'năm'
          6: 'sáu',
          7: 'bảy',
          8: 'tám',
          9: 'chín',
        }
      });
      
      expect(spellVnNumber(customConfig, '45')).toBe('tư mươi lăm');
    });

    it('should handle different decimal point text', () => {
      const customConfig = new SpellerConfig({
        pointText: 'phẩy'   // Changed from 'chấm'
      });
      
      expect(spellVnNumber(customConfig, '1.5')).toBe('một phẩy năm');
    });

    it('should handle different separators', () => {
      const customConfig = new SpellerConfig({
        separator: '_'   // Changed from space
      });
      
      expect(spellVnNumber(customConfig, '123')).toBe('một_trăm_hai_mươi_ba');
    });

    it('should handle custom decimal handling configuration', () => {
      const config = new SpellerConfig({
        keepOneZeroWhenAllZeros: true
      });
      
      expect(spellVnNumber(config, '10.0')).toContain('chấm không');
    });
  });

  describe('Special cases in Vietnamese spelling', () => {
    it('should handle the special "lẻ" case correctly', () => {
      const config = new SpellerConfig();
      
      // Cases where "lẻ" should be used
      expect(spellVnNumber(config, '101')).toBe('một trăm lẻ một');
      expect(spellVnNumber(config, '1001')).toBe('một nghìn không trăm lẻ một');
      expect(spellVnNumber(config, '10001')).toBe('mười nghìn không trăm lẻ một');
      
      // Cases where "lẻ" should not be used
      expect(spellVnNumber(config, '110')).toBe('một trăm mười');
      expect(spellVnNumber(config, '1010')).toBe('một nghìn không trăm mười');
    });

    it('should handle special pronunciation rules for "một", "tư", "lăm"', () => {
      const config = new SpellerConfig();
      
      // Special cases for "một" -> "mốt"
      expect(spellVnNumber(config, '21')).toBe('hai mươi mốt');
      expect(spellVnNumber(config, '31')).toBe('ba mươi mốt');
      
      // Special cases for "bốn" -> "tư"
      expect(spellVnNumber(config, '24')).toBe('hai mươi tư');
      expect(spellVnNumber(config, '34')).toBe('ba mươi tư');
      
      // Special cases for "năm" -> "lăm"
      expect(spellVnNumber(config, '25')).toBe('hai mươi lăm');
      expect(spellVnNumber(config, '35')).toBe('ba mươi lăm');
      
      // Regular usage
      expect(spellVnNumber(config, '1')).toBe('một');
      expect(spellVnNumber(config, '4')).toBe('bốn');
      expect(spellVnNumber(config, '5')).toBe('năm');
    });
  });

  describe('Convenience function (spell) with additional tests', () => {
    it('should handle compact input formats correctly', () => {
      // Without separators
      expect(spell('1234567')).toBe('một triệu hai trăm ba mươi tư nghìn năm trăm sáu mươi bảy');
      
      // With various types of input
      expect(spell(1234567)).toBe('một triệu hai trăm ba mươi tư nghìn năm trăm sáu mươi bảy');
      expect(spell(BigInt('1234567'))).toBe('một triệu hai trăm ba mươi tư nghìn năm trăm sáu mươi bảy');
    });
    
    it('should handle complex combinations of numbers', () => {
        expect(spell('1,000,200,034,000,567,890')).toBe(
            'một tỷ hai trăm nghìn không trăm ba mươi tư tỷ năm trăm sáu mươi bảy nghìn tám trăm chín mươi'
          );
    });
  });
}); 