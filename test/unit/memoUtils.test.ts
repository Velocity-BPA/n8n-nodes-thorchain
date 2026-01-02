/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  buildSwapMemo,
  buildAddLiquidityMemo,
  buildWithdrawMemo,
  buildSaverDepositMemo,
  buildSaverWithdrawMemo,
  buildOpenLoanMemo,
  buildCloseLoanMemo,
  buildDonateMemo,
  buildBondMemo,
  buildUnbondMemo,
  buildLeaveMemo,
  parseMemo,
  validateAddress,
  validateAsset,
  extractChainFromAsset,
  extractSymbolFromAsset,
  isNativeAsset,
  isSynthAsset,
  toSynthAsset,
  fromSynthAsset,
  formatTxHash,
  shortenAddress,
} from '../../nodes/THORChain/utils/memoUtils';

describe('memoUtils', () => {
  describe('buildSwapMemo', () => {
    it('should build basic swap memo', () => {
      const memo = buildSwapMemo({
        asset: 'BTC.BTC',
        destAddress: 'bc1qtest',
      });
      expect(memo).toBe('SWAP:BTC.BTC:bc1qtest');
    });

    it('should build swap memo with limit', () => {
      const memo = buildSwapMemo({
        asset: 'BTC.BTC',
        destAddress: 'bc1qtest',
        limit: '100000',
      });
      expect(memo).toBe('SWAP:BTC.BTC:bc1qtest:100000');
    });

    it('should build swap memo with affiliate', () => {
      const memo = buildSwapMemo({
        asset: 'BTC.BTC',
        destAddress: 'bc1qtest',
        affiliateAddress: 'thor1affiliate',
        affiliateFee: '50',
      });
      expect(memo).toBe('SWAP:BTC.BTC:bc1qtest::thor1affiliate:50');
    });

    it('should build swap memo with streaming', () => {
      const memo = buildSwapMemo({
        asset: 'BTC.BTC',
        destAddress: 'bc1qtest',
        streamingInterval: 10,
        streamingQuantity: 5,
      });
      expect(memo).toBe('SWAP:BTC.BTC:bc1qtest:::::10/5');
    });
  });

  describe('buildAddLiquidityMemo', () => {
    it('should build basic add liquidity memo', () => {
      const memo = buildAddLiquidityMemo({
        asset: 'BTC.BTC',
      });
      expect(memo).toBe('+:BTC.BTC');
    });

    it('should build paired add liquidity memo', () => {
      const memo = buildAddLiquidityMemo({
        asset: 'BTC.BTC',
        pairedAddress: 'thor1paired',
      });
      expect(memo).toBe('+:BTC.BTC:thor1paired');
    });

    it('should build add liquidity memo with affiliate', () => {
      const memo = buildAddLiquidityMemo({
        asset: 'BTC.BTC',
        pairedAddress: 'thor1paired',
        affiliateAddress: 'thor1aff',
        affiliateFee: '30',
      });
      expect(memo).toBe('+:BTC.BTC:thor1paired:thor1aff:30');
    });
  });

  describe('buildWithdrawMemo', () => {
    it('should build withdraw memo', () => {
      const memo = buildWithdrawMemo({
        asset: 'BTC.BTC',
        basisPoints: 10000,
      });
      expect(memo).toBe('-:BTC.BTC:10000');
    });

    it('should build partial withdraw memo', () => {
      const memo = buildWithdrawMemo({
        asset: 'BTC.BTC',
        basisPoints: 5000,
      });
      expect(memo).toBe('-:BTC.BTC:5000');
    });

    it('should build asymmetric withdraw memo', () => {
      const memo = buildWithdrawMemo({
        asset: 'BTC.BTC',
        basisPoints: 5000,
        targetAsset: 'BTC.BTC',
      });
      expect(memo).toBe('-:BTC.BTC:5000:BTC.BTC');
    });
  });

  describe('buildSaverDepositMemo', () => {
    it('should build saver deposit memo', () => {
      const memo = buildSaverDepositMemo({
        asset: 'BTC/BTC',
      });
      expect(memo).toBe('+BTC/BTC/');
    });

    it('should build saver deposit with affiliate', () => {
      const memo = buildSaverDepositMemo({
        asset: 'BTC/BTC',
        affiliateAddress: 'thor1aff',
        affiliateFee: '50',
      });
      expect(memo).toBe('+:BTC/BTC::thor1aff:50');
    });
  });

  describe('buildSaverWithdrawMemo', () => {
    it('should build full saver withdraw memo', () => {
      const memo = buildSaverWithdrawMemo('BTC/BTC', 10000);
      expect(memo).toBe('-:BTC/BTC/:10000');
    });

    it('should build partial saver withdraw memo', () => {
      const memo = buildSaverWithdrawMemo('BTC/BTC', 2500);
      expect(memo).toBe('-:BTC/BTC/:2500');
    });
  });

  describe('buildOpenLoanMemo', () => {
    it('should build open loan memo', () => {
      const memo = buildOpenLoanMemo({
        asset: 'BTC.BTC',
        destAddress: 'bc1qtest',
      });
      expect(memo).toBe('LOAN+:BTC.BTC:bc1qtest');
    });

    it('should build open loan memo with min out', () => {
      const memo = buildOpenLoanMemo({
        asset: 'BTC.BTC',
        destAddress: 'bc1qtest',
        minOut: '100000',
      });
      expect(memo).toBe('LOAN+:BTC.BTC:bc1qtest:100000');
    });

    it('should build open loan memo with affiliate', () => {
      const memo = buildOpenLoanMemo({
        asset: 'BTC.BTC',
        destAddress: 'bc1qtest',
        affiliateAddress: 'thor1aff',
        affiliateFee: '50',
      });
      expect(memo).toBe('LOAN+:BTC.BTC:bc1qtest::thor1aff:50');
    });
  });

  describe('buildCloseLoanMemo', () => {
    it('should build close loan memo', () => {
      const memo = buildCloseLoanMemo('BTC.BTC', 'bc1qtest');
      expect(memo).toBe('LOAN-:BTC.BTC:bc1qtest');
    });
  });

  describe('buildDonateMemo', () => {
    it('should build donate memo', () => {
      const memo = buildDonateMemo('BTC.BTC');
      expect(memo).toBe('DONATE:BTC.BTC');
    });
  });

  describe('buildBondMemo', () => {
    it('should build bond memo', () => {
      const memo = buildBondMemo('thor1node');
      expect(memo).toBe('BOND:thor1node');
    });

    it('should build bond memo with provider', () => {
      const memo = buildBondMemo('thor1node', 'thor1provider');
      expect(memo).toBe('BOND:thor1node:thor1provider');
    });
  });

  describe('buildUnbondMemo', () => {
    it('should build unbond memo', () => {
      const memo = buildUnbondMemo('thor1node', '1000000000');
      expect(memo).toBe('UNBOND:thor1node:1000000000');
    });
  });

  describe('buildLeaveMemo', () => {
    it('should build leave memo', () => {
      const memo = buildLeaveMemo('thor1node');
      expect(memo).toBe('LEAVE:thor1node');
    });
  });

  describe('parseMemo', () => {
    it('should parse swap memo', () => {
      const result = parseMemo('SWAP:BTC.BTC:bc1qtest:100000:thor1aff:50');
      expect(result.type).toBe('SWAP');
      expect(result.asset).toBe('BTC.BTC');
      expect(result.destAddress).toBe('bc1qtest');
      expect(result.limit).toBe('100000');
      expect(result.affiliateAddress).toBe('thor1aff');
      expect(result.affiliateFee).toBe('50');
    });

    it('should parse shorthand swap memo', () => {
      const result = parseMemo('=:ETH.ETH:0xtest');
      expect(result.type).toBe('SWAP');
      expect(result.asset).toBe('ETH.ETH');
      expect(result.destAddress).toBe('0xtest');
    });

    it('should parse add liquidity memo', () => {
      const result = parseMemo('+:BTC.BTC:thor1paired');
      expect(result.type).toBe('ADD_LIQUIDITY');
      expect(result.asset).toBe('BTC.BTC');
      expect(result.destAddress).toBe('thor1paired');
    });

    it('should parse saver add memo', () => {
      const result = parseMemo('+:BTC/BTC/:');
      expect(result.type).toBe('ADD_SAVER');
      expect(result.asset).toBe('BTC/BTC');
    });

    it('should parse withdraw memo', () => {
      const result = parseMemo('-:BTC.BTC:5000');
      expect(result.type).toBe('WITHDRAW');
      expect(result.asset).toBe('BTC.BTC');
      expect(result.limit).toBe('5000');
    });

    it('should parse saver withdraw memo', () => {
      const result = parseMemo('-:BTC/BTC/:2500');
      expect(result.type).toBe('WITHDRAW_SAVER');
      expect(result.asset).toBe('BTC/BTC');
      expect(result.limit).toBe('2500');
    });

    it('should parse open loan memo', () => {
      const result = parseMemo('LOAN+:BTC.BTC:bc1qtest:100000');
      expect(result.type).toBe('OPEN_LOAN');
      expect(result.asset).toBe('BTC.BTC');
      expect(result.destAddress).toBe('bc1qtest');
      expect(result.limit).toBe('100000');
    });

    it('should parse close loan memo', () => {
      const result = parseMemo('LOAN-:BTC.BTC:bc1qtest');
      expect(result.type).toBe('CLOSE_LOAN');
      expect(result.asset).toBe('BTC.BTC');
      expect(result.destAddress).toBe('bc1qtest');
    });

    it('should parse donate memo', () => {
      const result = parseMemo('DONATE:BTC.BTC');
      expect(result.type).toBe('DONATE');
      expect(result.asset).toBe('BTC.BTC');
    });

    it('should parse bond memo', () => {
      const result = parseMemo('BOND:thor1node');
      expect(result.type).toBe('BOND');
      expect(result.destAddress).toBe('thor1node');
    });

    it('should parse unbond memo', () => {
      const result = parseMemo('UNBOND:thor1node:1000000000');
      expect(result.type).toBe('UNBOND');
      expect(result.destAddress).toBe('thor1node');
      expect(result.limit).toBe('1000000000');
    });

    it('should parse leave memo', () => {
      const result = parseMemo('LEAVE:thor1node');
      expect(result.type).toBe('LEAVE');
      expect(result.destAddress).toBe('thor1node');
    });

    it('should handle unknown memo type', () => {
      const result = parseMemo('UNKNOWN:test');
      expect(result.type).toBe('UNKNOWN');
      expect(result.raw).toBe('UNKNOWN:test');
    });
  });

  describe('validateAddress', () => {
    it('should validate Bitcoin addresses', () => {
      expect(validateAddress('bc1qtest', 'BTC')).toBe(true);
      expect(validateAddress('1testaddress', 'BTC')).toBe(true);
      expect(validateAddress('3testaddress', 'BTC')).toBe(true);
      expect(validateAddress('invalidaddress', 'BTC')).toBe(false);
    });

    it('should validate Ethereum addresses', () => {
      expect(validateAddress('0xtest', 'ETH')).toBe(true);
      expect(validateAddress('invalidaddress', 'ETH')).toBe(false);
    });

    it('should validate THORChain addresses', () => {
      expect(validateAddress('thor1test', 'THOR')).toBe(true);
      expect(validateAddress('invalidaddress', 'THOR')).toBe(false);
    });

    it('should return false for unknown chains', () => {
      expect(validateAddress('test', 'UNKNOWN')).toBe(false);
    });
  });

  describe('validateAsset', () => {
    it('should validate correct asset format', () => {
      expect(validateAsset('BTC.BTC')).toBe(true);
      expect(validateAsset('ETH.USDC-0XABCD')).toBe(true);
      expect(validateAsset('THOR.RUNE')).toBe(true);
    });

    it('should reject invalid asset format', () => {
      expect(validateAsset('BTC')).toBe(false);
      expect(validateAsset('.BTC')).toBe(false);
      expect(validateAsset('BTC.')).toBe(false);
    });
  });

  describe('extractChainFromAsset', () => {
    it('should extract chain from asset', () => {
      expect(extractChainFromAsset('BTC.BTC')).toBe('BTC');
      expect(extractChainFromAsset('ETH.USDC')).toBe('ETH');
      expect(extractChainFromAsset('THOR.RUNE')).toBe('THOR');
    });

    it('should handle invalid format', () => {
      expect(extractChainFromAsset('INVALID')).toBe('INVALID');
      expect(extractChainFromAsset('')).toBe('');
    });
  });

  describe('extractSymbolFromAsset', () => {
    it('should extract symbol from asset', () => {
      expect(extractSymbolFromAsset('BTC.BTC')).toBe('BTC');
      expect(extractSymbolFromAsset('ETH.USDC')).toBe('USDC');
      expect(extractSymbolFromAsset('THOR.RUNE')).toBe('RUNE');
    });

    it('should handle invalid format', () => {
      expect(extractSymbolFromAsset('INVALID')).toBe('');
      expect(extractSymbolFromAsset('')).toBe('');
    });
  });

  describe('isNativeAsset', () => {
    it('should identify native assets', () => {
      expect(isNativeAsset('BTC.BTC')).toBe(true);
      expect(isNativeAsset('ETH.ETH')).toBe(true);
      expect(isNativeAsset('THOR.RUNE')).toBe(true);
    });

    it('should reject non-native assets', () => {
      expect(isNativeAsset('ETH.USDC')).toBe(false);
      expect(isNativeAsset('INVALID')).toBe(false);
    });
  });

  describe('isSynthAsset', () => {
    it('should identify synth assets', () => {
      expect(isSynthAsset('BTC/BTC')).toBe(true);
      expect(isSynthAsset('ETH/USDC')).toBe(true);
    });

    it('should reject non-synth assets', () => {
      expect(isSynthAsset('BTC.BTC')).toBe(false);
      expect(isSynthAsset('ETH.USDC')).toBe(false);
    });
  });

  describe('toSynthAsset', () => {
    it('should convert to synth asset', () => {
      expect(toSynthAsset('BTC.BTC')).toBe('BTC/BTC');
      expect(toSynthAsset('ETH.USDC')).toBe('ETH/USDC');
    });

    it('should handle invalid format', () => {
      expect(toSynthAsset('INVALID')).toBe('INVALID');
    });
  });

  describe('fromSynthAsset', () => {
    it('should convert from synth asset', () => {
      expect(fromSynthAsset('BTC/BTC')).toBe('BTC.BTC');
      expect(fromSynthAsset('ETH/USDC')).toBe('ETH.USDC');
    });
  });

  describe('formatTxHash', () => {
    it('should format tx hash', () => {
      expect(formatTxHash('0xabcd')).toBe('ABCD');
      expect(formatTxHash('abcd')).toBe('ABCD');
    });

    it('should handle empty hash', () => {
      expect(formatTxHash('')).toBe('');
    });
  });

  describe('shortenAddress', () => {
    it('should shorten address', () => {
      const address = 'thor1abcdefghijklmnopqrstuvwxyz';
      expect(shortenAddress(address)).toBe('thor1a...uvwxyz');
    });

    it('should not shorten short address', () => {
      const address = 'short';
      expect(shortenAddress(address)).toBe('short');
    });

    it('should handle custom chars', () => {
      const address = 'thor1abcdefghijklmnopqrstuvwxyz';
      expect(shortenAddress(address, 4)).toBe('thor...wxyz');
    });
  });
});
