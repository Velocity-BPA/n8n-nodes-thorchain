/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { ParsedMemo } from '../constants/types';
import { MEMO_TYPE_PREFIXES, ADDRESS_PREFIXES } from '../constants/chains';

export interface SwapMemoParams {
  asset: string;
  destAddress: string;
  limit?: string;
  affiliateAddress?: string;
  affiliateFee?: string;
  streamingInterval?: number;
  streamingQuantity?: number;
}

export interface LiquidityMemoParams {
  asset: string;
  pairedAddress?: string;
  affiliateAddress?: string;
  affiliateFee?: string;
}

export interface WithdrawMemoParams {
  asset: string;
  basisPoints: number;
  targetAsset?: string;
}

export interface SaverMemoParams {
  asset: string;
  affiliateAddress?: string;
  affiliateFee?: string;
}

export interface LoanMemoParams {
  asset: string;
  destAddress: string;
  minOut?: string;
  affiliateAddress?: string;
  affiliateFee?: string;
}

export function buildSwapMemo(params: SwapMemoParams): string {
  const parts = [
    MEMO_TYPE_PREFIXES.SWAP,
    params.asset,
    params.destAddress,
    params.limit || '',
  ];

  if (params.affiliateAddress) {
    parts.push(params.affiliateAddress);
    parts.push(params.affiliateFee || '0');
  }

  if (params.streamingInterval !== undefined && params.streamingQuantity !== undefined) {
    if (!params.affiliateAddress) {
      parts.push('');
      parts.push('');
    }
    parts.push('');
    parts.push(`${params.streamingInterval}/${params.streamingQuantity}`);
  }

  return parts.join(':').replace(/:+$/, '');
}

export function buildAddLiquidityMemo(params: LiquidityMemoParams): string {
  const parts = [MEMO_TYPE_PREFIXES.ADD_LIQUIDITY, params.asset];

  if (params.pairedAddress) {
    parts.push(params.pairedAddress);
  } else if (params.affiliateAddress) {
    parts.push('');
  }

  if (params.affiliateAddress) {
    parts.push(params.affiliateAddress);
    parts.push(params.affiliateFee || '0');
  }

  return parts.join(':').replace(/:+$/, '');
}

export function buildWithdrawMemo(params: WithdrawMemoParams): string {
  const parts = [
    MEMO_TYPE_PREFIXES.WITHDRAW_LIQUIDITY,
    params.asset,
    params.basisPoints.toString(),
  ];

  if (params.targetAsset) {
    parts.push(params.targetAsset);
  }

  return parts.join(':');
}

export function buildSaverDepositMemo(params: SaverMemoParams): string {
  const parts = ['+', `${params.asset}/`];

  if (params.affiliateAddress) {
    parts[1] = params.asset;
    parts.push('');
    parts.push(params.affiliateAddress);
    parts.push(params.affiliateFee || '0');
    return parts.join(':').replace(/:+$/, '');
  }

  return parts.join('');
}

export function buildSaverWithdrawMemo(asset: string, basisPoints: number): string {
  return `-:${asset}/:${basisPoints}`;
}

export function buildOpenLoanMemo(params: LoanMemoParams): string {
  const parts = [
    MEMO_TYPE_PREFIXES.OPEN_LOAN,
    params.asset,
    params.destAddress,
    params.minOut || '',
  ];

  if (params.affiliateAddress) {
    parts.push(params.affiliateAddress);
    parts.push(params.affiliateFee || '0');
  }

  return parts.join(':').replace(/:+$/, '');
}

export function buildCloseLoanMemo(asset: string, destAddress: string): string {
  return `${MEMO_TYPE_PREFIXES.CLOSE_LOAN}:${asset}:${destAddress}`;
}

export function buildDonateMemo(asset: string): string {
  return `${MEMO_TYPE_PREFIXES.DONATE}:${asset}`;
}

export function buildBondMemo(nodeAddress: string, providerAddress?: string): string {
  if (providerAddress) {
    return `${MEMO_TYPE_PREFIXES.BOND}:${nodeAddress}:${providerAddress}`;
  }
  return `${MEMO_TYPE_PREFIXES.BOND}:${nodeAddress}`;
}

export function buildUnbondMemo(nodeAddress: string, amount: string): string {
  return `${MEMO_TYPE_PREFIXES.UNBOND}:${nodeAddress}:${amount}`;
}

export function buildLeaveMemo(nodeAddress: string): string {
  return `${MEMO_TYPE_PREFIXES.LEAVE}:${nodeAddress}`;
}

export function parseMemo(memo: string): ParsedMemo {
  const parts = memo.split(':');
  const type = parts[0]?.toUpperCase() || '';

  const result: ParsedMemo = {
    type,
    raw: memo,
  };

  switch (type) {
    case 'SWAP':
    case 'S':
    case '=':
      result.type = 'SWAP';
      result.asset = parts[1];
      result.destAddress = parts[2];
      result.limit = parts[3];
      result.affiliateAddress = parts[4];
      result.affiliateFee = parts[5];
      if (parts[7]) {
        const streaming = parts[7].split('/');
        result.interval = streaming[0];
        result.quantity = streaming[1];
      }
      break;

    case '+':
    case 'ADD':
      result.type = 'ADD_LIQUIDITY';
      result.asset = parts[1]?.replace(/\/$/, '');
      if (parts[1]?.endsWith('/')) {
        result.type = 'ADD_SAVER';
      }
      result.destAddress = parts[2];
      result.affiliateAddress = parts[3];
      result.affiliateFee = parts[4];
      break;

    case '-':
    case 'WITHDRAW':
    case 'WD':
      result.type = 'WITHDRAW';
      result.asset = parts[1]?.replace(/\/$/, '');
      if (parts[1]?.endsWith('/')) {
        result.type = 'WITHDRAW_SAVER';
      }
      result.limit = parts[2];
      break;

    case 'LOAN+':
    case '$+':
      result.type = 'OPEN_LOAN';
      result.asset = parts[1];
      result.destAddress = parts[2];
      result.limit = parts[3];
      result.affiliateAddress = parts[4];
      result.affiliateFee = parts[5];
      break;

    case 'LOAN-':
    case '$-':
      result.type = 'CLOSE_LOAN';
      result.asset = parts[1];
      result.destAddress = parts[2];
      break;

    case 'DONATE':
    case 'D':
      result.type = 'DONATE';
      result.asset = parts[1];
      break;

    case 'BOND':
      result.type = 'BOND';
      result.destAddress = parts[1];
      break;

    case 'UNBOND':
      result.type = 'UNBOND';
      result.destAddress = parts[1];
      result.limit = parts[2];
      break;

    case 'LEAVE':
      result.type = 'LEAVE';
      result.destAddress = parts[1];
      break;

    case 'NOOP':
      result.type = 'NOOP';
      break;

    case 'TRADE+':
      result.type = 'TRADE_DEPOSIT';
      result.destAddress = parts[1];
      break;

    case 'TRADE-':
      result.type = 'TRADE_WITHDRAW';
      result.destAddress = parts[1];
      break;

    default:
      result.type = 'UNKNOWN';
  }

  return result;
}

export function validateAddress(address: string, chain: string): boolean {
  const prefixes = ADDRESS_PREFIXES[chain.toUpperCase()];
  if (!prefixes) {
    return false;
  }

  const lowercaseAddress = address.toLowerCase();
  return prefixes.some((prefix) => lowercaseAddress.startsWith(prefix.toLowerCase()));
}

export function validateAsset(asset: string): boolean {
  const parts = asset.split('.');
  if (parts.length !== 2) {
    return false;
  }
  const [chain, symbol] = parts;
  return chain.length > 0 && symbol.length > 0;
}

export function extractChainFromAsset(asset: string): string {
  const parts = asset.split('.');
  return parts[0] || '';
}

export function extractSymbolFromAsset(asset: string): string {
  const parts = asset.split('.');
  return parts[1] || '';
}

export function isNativeAsset(asset: string): boolean {
  const parts = asset.split('.');
  if (parts.length !== 2) return false;
  const [chain, symbol] = parts;
  return chain === symbol || (chain === 'THOR' && symbol === 'RUNE');
}

export function isSynthAsset(asset: string): boolean {
  return asset.includes('/');
}

export function toSynthAsset(asset: string): string {
  const parts = asset.split('.');
  if (parts.length !== 2) return asset;
  return `${parts[0]}/${parts[1]}`;
}

export function fromSynthAsset(synthAsset: string): string {
  return synthAsset.replace('/', '.');
}

export function formatTxHash(hash: string): string {
  if (!hash) return '';
  return hash.toUpperCase().replace(/^0X/, '');
}

export function shortenAddress(address: string, chars = 6): string {
  if (!address || address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
