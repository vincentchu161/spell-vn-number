import { describe, expect, it } from '@jest/globals';
import { SpellerConfig } from '../src';
import {
  cleanInputNumber,
  trimRedundantZeros,
  normalizeNumberString,
  trimLeft,
  trimRight
} from "../src/utils";

describe('Utility Functions', () => {
  // Test trimRedundantZeros function
  describe('trimRedundantZeros function', () => {
    it('should trim redundant zeros correctly with default settings', () => {
      const config = new SpellerConfig({ decimalPoint: '.', redundantZeroChar: '0' });

      // Test integral part only
      expect(trimRedundantZeros(config, '0')).toBe('0');
      expect(trimRedundantZeros(config, '00123')).toBe('123');
      expect(trimRedundantZeros(config, '00010')).toBe('10');
      expect(trimRedundantZeros(config, '01')).toBe('1');
      expect(trimRedundantZeros(config, '001')).toBe('1');

      // Test fractional part
      expect(trimRedundantZeros(config, '123.456')).toBe('123.456');
      expect(trimRedundantZeros(config, '123.4560')).toBe('123.456');
      expect(trimRedundantZeros(config, '00123.4560')).toBe('123.456');
      expect(trimRedundantZeros(config, '0.0')).toBe('0.');
      expect(trimRedundantZeros(config, '000.000')).toBe('0.');
      expect(trimRedundantZeros(config, '00.00100')).toBe('0.001');
    });

    it('should respect keepOneZeroWhenAllZeros flag', () => {
      const config = new SpellerConfig({
        decimalPoint: '.',
        redundantZeroChar: '0',
        keepOneZeroWhenAllZeros: true // Keep one zero after decimal point when all decimal digits are zero
      });

      // Test non-zero fractional part - should trim trailing zeros
      expect(trimRedundantZeros(config, '123.4560')).toBe('123.456');
      expect(trimRedundantZeros(config, '00.00100')).toBe('0.001');

      // Test all-zero fractional part - should keep one zero
      expect(trimRedundantZeros(config, '0.0')).toBe('0.0');
      expect(trimRedundantZeros(config, '000.000')).toBe('0.0');
      expect(trimRedundantZeros(config, '123.0000')).toBe('123.0');
    });

    it('should always keep at least one digit for integral part', () => {
      const config = new SpellerConfig({ decimalPoint: '.', redundantZeroChar: '0' });

      expect(trimRedundantZeros(config, '00')).toBe('0');
      expect(trimRedundantZeros(config, '00.123')).toBe('0.123');
      expect(trimRedundantZeros(config, '000.001')).toBe('0.001');
    });

    it('should handle custom keepOneZeroWhenAllZeros settings', () => {
      const config1 = new SpellerConfig({
        decimalPoint: '.',
        redundantZeroChar: '0',
        keepOneZeroWhenAllZeros: true
      });

      expect(trimRedundantZeros(config1, '00.00100')).toBe('0.001');
      expect(trimRedundantZeros(config1, '000.000')).toBe('0.0');
      expect(trimRedundantZeros(config1, '123.0000')).toBe('123.0');

      const config2 = new SpellerConfig({
        decimalPoint: '.',
        redundantZeroChar: '0',
        keepOneZeroWhenAllZeros: false
      });

      expect(trimRedundantZeros(config2, '00.00100')).toBe('0.001');
      expect(trimRedundantZeros(config2, '000.000')).toBe('0.');
      expect(trimRedundantZeros(config2, '123.0000')).toBe('123.');
    });
  });

  // Test cleanInputNumber function
  describe('cleanInputNumber function', () => {
    const defaultConfig = {};

    it('should handle various input types correctly', () => {
      expect(cleanInputNumber(123, defaultConfig)).toBe('123');
      expect(cleanInputNumber('123', defaultConfig)).toBe('123');
      expect(cleanInputNumber(-123, defaultConfig)).toBe('-123');
      expect(cleanInputNumber('-123', defaultConfig)).toBe('-123');
      expect(cleanInputNumber(123.456, defaultConfig)).toBe('123.456');
      expect(cleanInputNumber('123.456', defaultConfig)).toBe('123.456');
      expect(cleanInputNumber(0, defaultConfig)).toBe('0');
      expect(cleanInputNumber('0', defaultConfig)).toBe('0');
      expect(cleanInputNumber(BigInt(9007199254740991), defaultConfig)).toBe('9007199254740991'); // Max safe integer as BigInt
    });

    it('should handle scientific notation correctly', () => {
      expect(cleanInputNumber(1.23e5, defaultConfig)).toBe('123000');
      expect(cleanInputNumber(1.23e-5, defaultConfig)).toBe('0.0000123');
      expect(() => cleanInputNumber('1.23e5', defaultConfig)).toThrow('Invalid number format');
    });

    it('should remove thousands separators from number strings', () => {
      const config = { thousandSign: ',' };
      expect(cleanInputNumber('1,234,567', config)).toBe('1234567');
      expect(cleanInputNumber('1,234.567', config)).toBe('1234.567');
    });

    it('should handle custom thousands separators', () => {
      const config = { thousandSign: ' ' };
      expect(cleanInputNumber('1 234 567', config)).toBe('1234567');

      const config2 = { thousandSign: '.', decimalPoint: ',' };
      expect(cleanInputNumber('1.234.567,89', config2)).toBe('1234567,89');
    });

    it('should throw error for invalid number format', () => {
      expect(() => cleanInputNumber(null as any, defaultConfig)).toThrow('Input cannot be null or undefined');
      expect(() => cleanInputNumber(undefined as any, defaultConfig)).toThrow('Input cannot be null or undefined');
      expect(() => cleanInputNumber(NaN, defaultConfig)).toThrow('Input must be a finite number');
      expect(() => cleanInputNumber(Infinity, defaultConfig)).toThrow('Input must be a finite number');
      expect(() => cleanInputNumber('abc', defaultConfig)).toThrow('Invalid number format');
      expect(() => cleanInputNumber('123abc', defaultConfig)).toThrow('Invalid number format');
      expect(() => cleanInputNumber('123..456', defaultConfig)).toThrow('Invalid number format');
      expect(() => cleanInputNumber('..456', defaultConfig)).toThrow('Invalid number format');
      expect(() => cleanInputNumber('123..', defaultConfig)).toThrow('Invalid number format');
    });

    it('should handle very large BigInt values', () => {
      const bigValue = BigInt('123456789012345678901234567890');
      expect(cleanInputNumber(bigValue, defaultConfig)).toBe('123456789012345678901234567890');
    });
  });

  // Additional tests for normalizeNumberString function
  describe('normalizeNumberString function', () => {
    it('should correctly normalize strings with whitespace and special characters', () => {
      expect(normalizeNumberString('  123  ')).toBe('123');
      expect(normalizeNumberString('1 2 3')).toBe('123');
      expect(normalizeNumberString('1\u00A02\u00A03')).toBe('123'); // non-breaking spaces
      expect(normalizeNumberString('1–2')).toBe('1-2'); // en dash
      expect(normalizeNumberString('1—2')).toBe('1-2'); // em dash
    });

    it('should handle thousands separators correctly', () => {
      expect(normalizeNumberString('1,234,567')).toBe('1234567');
      expect(normalizeNumberString('1.234.567', {
        thousandSign: '.'
      })).toBe('1234567');
    });

    it('should handle custom options correctly', () => {
      expect(normalizeNumberString('1,234.56', {
        thousandSign: ',',
        decimalPoint: '.'
      })).toBe('1234.56');
    });
  });

  // Tests for cleanInputNumber
  describe('cleanInputNumber function', () => {
    it('should remove thousands separators from number string', () => {
      const config = new SpellerConfig({ thousandSign: ',' });
      expect(cleanInputNumber( '1,234,567', config)).toBe('1234567');
      expect(cleanInputNumber('1,234,567.89', config)).toBe('1234567.89');
    });

    it('should handle custom thousands separators', () => {
      const config = new SpellerConfig({ thousandSign: ' ' });
      expect(cleanInputNumber('1 234 567', config)).toBe('1234567');

      const config2 = new SpellerConfig({ thousandSign: '.', decimalPoint: ',' });
      expect(cleanInputNumber('1.234.567,89', config2)).toBe('1234567,89');
    });
  });

  // Tests for trimLeft function
  describe('trimLeft function', () => {
    it('should trim leading characters correctly', () => {
      expect(trimLeft('00123')).toBe('123');
      expect(trimLeft('00123', '0')).toBe('123');
      expect(trimLeft('xxyzz', 'x')).toBe('yzz');
      expect(trimLeft('0000', '0')).toBe('0');
      expect(trimLeft('123', '0')).toBe('123'); // No leading zeros
    });
  });

  // Tests for trimRight function
  describe('trimRight function', () => {
    it('should trim trailing characters correctly', () => {
      expect(trimRight('12300')).toBe('123');
      expect(trimRight('12300', '0')).toBe('123');
      expect(trimRight('xyzxx', 'x')).toBe('xyz');
      expect(trimRight('0000', '0')).toBe('');
      expect(trimRight('123', '0')).toBe('123'); // No trailing zeros
    });
  });
});
