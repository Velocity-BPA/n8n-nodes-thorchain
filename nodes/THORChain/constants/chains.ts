/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const SUPPORTED_CHAINS = [
  'BTC',
  'ETH',
  'BSC',
  'AVAX',
  'GAIA',
  'DOGE',
  'LTC',
  'BCH',
  'THOR',
] as const;

export const CHAIN_INFO: Record<string, { name: string; gasAsset: string }> = {
  BTC: { name: 'Bitcoin', gasAsset: 'BTC.BTC' },
  ETH: { name: 'Ethereum', gasAsset: 'ETH.ETH' },
  BSC: { name: 'BNB Chain', gasAsset: 'BSC.BNB' },
  AVAX: { name: 'Avalanche', gasAsset: 'AVAX.AVAX' },
  GAIA: { name: 'Cosmos Hub', gasAsset: 'GAIA.ATOM' },
  DOGE: { name: 'Dogecoin', gasAsset: 'DOGE.DOGE' },
  LTC: { name: 'Litecoin', gasAsset: 'LTC.LTC' },
  BCH: { name: 'Bitcoin Cash', gasAsset: 'BCH.BCH' },
  THOR: { name: 'THORChain', gasAsset: 'THOR.RUNE' },
};

export const POOL_STATUS_OPTIONS = [
  { name: 'All', value: '' },
  { name: 'Available', value: 'available' },
  { name: 'Staged', value: 'staged' },
  { name: 'Suspended', value: 'suspended' },
] as const;

export const TIME_INTERVAL_OPTIONS = [
  { name: '5 Minutes', value: '5min' },
  { name: 'Hour', value: 'hour' },
  { name: 'Day', value: 'day' },
  { name: 'Week', value: 'week' },
  { name: 'Month', value: 'month' },
  { name: 'Quarter', value: 'quarter' },
  { name: 'Year', value: 'year' },
] as const;

export const MEMO_TYPE_PREFIXES = {
  SWAP: 'SWAP',
  ADD_LIQUIDITY: '+',
  WITHDRAW_LIQUIDITY: '-',
  DONATE: 'DONATE',
  RESERVE: 'RESERVE',
  BOND: 'BOND',
  UNBOND: 'UNBOND',
  LEAVE: 'LEAVE',
  SWITCH: 'SWITCH',
  NOOP: 'NOOP',
  CONSOLIDATE: 'CONSOLIDATE',
  ADD_SAVER: '+',
  WITHDRAW_SAVER: '-',
  OPEN_LOAN: 'LOAN+',
  CLOSE_LOAN: 'LOAN-',
  TRADE_ACCOUNT_DEPOSIT: 'TRADE+',
  TRADE_ACCOUNT_WITHDRAW: 'TRADE-',
} as const;

export const MEMO_TYPES = [
  { name: 'Swap', value: 'swap' },
  { name: 'Add Liquidity', value: 'addLiquidity' },
  { name: 'Withdraw Liquidity', value: 'withdraw' },
  { name: 'Saver Deposit', value: 'saverDeposit' },
  { name: 'Saver Withdraw', value: 'saverWithdraw' },
  { name: 'Open Loan', value: 'openLoan' },
  { name: 'Close Loan', value: 'closeLoan' },
  { name: 'Donate', value: 'donate' },
  { name: 'Bond', value: 'bond' },
  { name: 'Unbond', value: 'unbond' },
  { name: 'Leave', value: 'leave' },
] as const;

export const BASE_UNIT = 1e8;

export const DEFAULT_MIDGARD_URL = 'https://midgard.ninerealms.com/v2';
export const DEFAULT_THORNODE_URL = 'https://thornode.ninerealms.com/thorchain';

export const STAGENET_MIDGARD_URL = 'https://stagenet-midgard.ninerealms.com/v2';
export const STAGENET_THORNODE_URL = 'https://stagenet-thornode.ninerealms.com/thorchain';

export const NETWORK_ENDPOINTS = {
  mainnet: {
    midgard: DEFAULT_MIDGARD_URL,
    thornode: DEFAULT_THORNODE_URL,
  },
  stagenet: {
    midgard: STAGENET_MIDGARD_URL,
    thornode: STAGENET_THORNODE_URL,
  },
} as const;

export const ASSET_REGEX = /^[A-Z]+\.[A-Z0-9-]+$/;

export const ADDRESS_PREFIXES: Record<string, string[]> = {
  BTC: ['bc1', '1', '3'],
  ETH: ['0x'],
  BSC: ['0x', 'bnb'],
  AVAX: ['0x'],
  GAIA: ['cosmos'],
  DOGE: ['D'],
  LTC: ['ltc1', 'L', 'M', '3'],
  BCH: ['bitcoincash:', 'q', 'p'],
  THOR: ['thor'],
};

export const SWAP_ACTION_TYPES = [
  'swap',
  'addLiquidity',
  'withdraw',
  'donate',
  'refund',
  'switch',
] as const;
