/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  formatAsset,
  formatAmount,
  toBaseUnits,
} from '../../nodes/THORChain/transport/apiClient';

describe('apiClient utilities', () => {
  describe('formatAsset', () => {
    it('should return asset as-is if already formatted', () => {
      expect(formatAsset('BTC.BTC')).toBe('BTC.BTC');
      expect(formatAsset('ETH.USDC')).toBe('ETH.USDC');
    });

    it('should format simple chain name to asset', () => {
      expect(formatAsset('btc')).toBe('BTC.BTC');
      expect(formatAsset('eth')).toBe('ETH.ETH');
    });

    it('should uppercase asset', () => {
      expect(formatAsset('btc.btc')).toBe('BTC.BTC');
    });

    it('should trim whitespace', () => {
      expect(formatAsset('  BTC.BTC  ')).toBe('BTC.BTC');
    });
  });

  describe('formatAmount', () => {
    it('should format amount with default 8 decimals', () => {
      expect(formatAmount('100000000')).toBe('1.00000000');
      expect(formatAmount(100000000)).toBe('1.00000000');
    });

    it('should format amount with custom decimals', () => {
      expect(formatAmount('1000000', 6)).toBe('1.000000');
    });

    it('should handle decimal values', () => {
      expect(formatAmount('50000000')).toBe('0.50000000');
    });

    it('should handle zero', () => {
      expect(formatAmount('0')).toBe('0.00000000');
    });
  });

  describe('toBaseUnits', () => {
    it('should convert string to base units', () => {
      expect(toBaseUnits('1')).toBe('100000000');
      expect(toBaseUnits('0.5')).toBe('50000000');
    });

    it('should convert number to base units', () => {
      expect(toBaseUnits(1)).toBe('100000000');
      expect(toBaseUnits(0.5)).toBe('50000000');
    });

    it('should handle custom decimals', () => {
      expect(toBaseUnits('1', 6)).toBe('1000000');
    });

    it('should floor fractional satoshis', () => {
      expect(toBaseUnits('0.000000001')).toBe('0');
    });

    it('should handle large amounts', () => {
      expect(toBaseUnits('21000000')).toBe('2100000000000000');
    });
  });
});
