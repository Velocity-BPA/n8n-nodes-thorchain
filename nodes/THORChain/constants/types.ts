/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

export interface ThorchainCredentials {
  network: 'mainnet' | 'stagenet';
  midgardUrl: string;
  thornodeUrl: string;
  customHeaders?: string;
}

export interface Pool {
  asset: string;
  shortCode?: string;
  status: 'available' | 'staged' | 'suspended';
  decimals?: string;
  pendingInboundAsset: string;
  pendingInboundRune: string;
  balance_asset: string;
  balance_rune: string;
  poolAPY: string;
  assetDepth: string;
  runeDepth: string;
  assetPrice?: string;
  assetPriceUSD?: string;
  synthSupply: string;
  synthUnits: string;
  units: string;
  volume24h: string;
  lpCount?: string;
  saversDepth?: string;
  saversUnits?: string;
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface PoolStats {
  asset: string;
  status: string;
  assetDepth: string;
  runeDepth: string;
  assetPrice: string;
  assetPriceUSD: string;
  poolAPY: string;
  volume24h: string;
  liquidityUnits: string;
  synthSupply: string;
  synthUnits: string;
  toAssetVolume: string;
  toRuneVolume: string;
  toAssetCount: string;
  toRuneCount: string;
  toAssetFees: string;
  toRuneFees: string;
  swapVolume: string;
  swapCount: string;
  toAssetAverageSlip: string;
  toRuneAverageSlip: string;
  uniqueMemberCount: string;
  uniqueSwapperCount: string;
  addAssetLiquidityVolume: string;
  addRuneLiquidityVolume: string;
  addLiquidityVolume: string;
  addLiquidityCount: string;
  withdrawAssetVolume: string;
  withdrawRuneVolume: string;
  withdrawVolume: string;
  withdrawCount: string;
  impermanentLossProtectionPaid: string;
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface SwapQuote {
  expected_amount_out: string;
  fees: {
    affiliate: string;
    asset: string;
    outbound: string;
    liquidity: string;
    total: string;
    slippage_bps: number;
    total_bps: number;
  };
  inbound_address: string;
  inbound_confirmation_blocks?: number;
  inbound_confirmation_seconds?: number;
  memo: string;
  notes: string;
  outbound_delay_blocks: number;
  outbound_delay_seconds: number;
  recommended_min_amount_in?: string;
  router?: string;
  expiry: number;
  warning: string;
  dust_threshold?: string;
  streaming_swap_blocks?: number;
  streaming_swap_seconds?: number;
  total_swap_seconds?: number;
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface InboundAddress {
  chain: string;
  pub_key: string;
  address: string;
  router?: string;
  halted: boolean;
  global_trading_paused: boolean;
  chain_trading_paused: boolean;
  chain_lp_actions_paused: boolean;
  gas_rate: string;
  gas_rate_units: string;
  outbound_tx_size: string;
  outbound_fee: string;
  dust_threshold: string;
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface LiquidityProvider {
  asset: string;
  rune_address?: string;
  asset_address?: string;
  last_add_height: number;
  last_withdraw_height: number;
  units: string;
  pending_rune: string;
  pending_asset: string;
  pending_tx_id?: string;
  rune_deposit_value: string;
  asset_deposit_value: string;
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface Saver {
  asset: string;
  asset_address: string;
  last_add_height: number;
  last_withdraw_height?: number;
  units: string;
  asset_deposit_value: string;
  asset_redeem_value: string;
  growth_pct: string;
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface SaverQuote {
  expected_amount_out?: string;
  expected_amount_deposit?: string;
  fees: {
    affiliate: string;
    asset: string;
    liquidity: string;
    outbound: string;
    slippage_bps: number;
  };
  inbound_address: string;
  memo: string;
  notes?: string;
  expiry: number;
  warning: string;
  dust_threshold?: string;
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface Loan {
  asset: string;
  owner: string;
  collateral_current: string;
  collateral_deposited: string;
  collateral_withdrawn: string;
  debt_current: string;
  debt_issued: string;
  debt_repaid: string;
  last_open_height: number;
  last_repay_height: number;
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface LoanQuote {
  expected_amount_out: string;
  expected_collateral_deposited: string;
  expected_collateralization_ratio: string;
  expected_debt_issued: string;
  fees: {
    affiliate: string;
    asset: string;
    liquidity: string;
    outbound: string;
    slippage_bps: number;
    total_bps: number;
  };
  inbound_address: string;
  memo: string;
  notes?: string;
  expiry: number;
  warning: string;
  recommended_min_amount_in?: string;
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface NetworkInfo {
  active_bond_median?: string;
  active_node_count: string;
  block_rewards?: {
    block_reward: string;
    bond_reward: string;
    pool_reward: string;
  };
  bond_metrics?: {
    average_active_bond: string;
    average_standby_bond: string;
    maximum_active_bond: string;
    maximum_standby_bond: string;
    median_active_bond: string;
    median_standby_bond: string;
    minimum_active_bond: string;
    minimum_standby_bond: string;
    total_active_bond: string;
    total_standby_bond: string;
  };
  churning_info?: {
    churn_interval: string;
    churn_retry_interval?: string;
    next_churn_height: string;
  };
  effective_security_bond: string;
  gas_held_in_vaults?: string;
  gas_spent_in_vaults?: string;
  native_outbound_fee_rune?: string;
  native_tx_fee_rune?: string;
  next_churn_height?: string;
  node_count: string;
  outbound_fee_multiplier?: string;
  pool_activation_countdown?: string;
  pool_share_factor?: string;
  rune_price_in_tor?: string;
  standby_bond_median?: string;
  standby_node_count: string;
  tns_fee_per_block_rune?: string;
  tns_register_fee_rune?: string;
  tor_price_in_rune?: string;
  total_bond_units?: string;
  total_pool_units_lp?: string;
  total_reserve?: string;
  validator_requirements?: {
    minimum_bond_in_rune: string;
    minimum_version: string;
  };
  vaults_migrating?: boolean;
  version?: string;
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface Node {
  node_address: string;
  status: string;
  pub_key_set: {
    secp256k1: string;
    ed25519: string;
  };
  validator_cons_pub_key?: string;
  bond: string;
  total_bond?: string;
  active_block_height: string;
  bond_address: string;
  status_since: string;
  signer_membership: string[];
  requested_to_leave: boolean;
  forced_to_leave: boolean;
  leave_height: string;
  ip_address: string;
  version: string;
  slash_points: string;
  jail?: {
    node_address: string;
    release_height: string;
    reason: string;
  };
  current_award: string;
  observe_chains?: {
    chain: string;
    height: number;
  }[];
  preflight_status?: {
    status: string;
    reason: string;
    code: number;
  };
  bond_providers: {
    node_address?: string;
    node_operator_fee?: string;
    providers: {
      bond_address: string;
      bond: string;
    }[];
  };
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface Transaction {
  tx: {
    id: string;
    chain: string;
    from_address: string;
    to_address: string;
    coins: {
      asset: string;
      amount: string;
      decimals?: number;
    }[];
    gas: {
      asset: string;
      amount: string;
      decimals?: number;
    }[];
    memo: string;
  };
  height?: string;
  observed_tx?: {
    tx: {
      id: string;
      chain: string;
      from_address: string;
      to_address: string;
      coins: {
        asset: string;
        amount: string;
      }[];
      gas: {
        asset: string;
        amount: string;
      }[];
      memo: string;
    };
    status: string;
    signers?: string[];
    block_height?: number;
    finalise_height?: number;
  };
  keysign_metric?: {
    tx_id: string;
    node_tss_times?: {
      address: string;
      tss_time: number;
    }[];
  };
  out_hashes?: string[];
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface Action {
  date: string;
  height: string;
  in: ActionTx[];
  out: ActionTx[];
  pools: string[];
  status: string;
  type: string;
  metadata?: {
    swap?: {
      affiliateAddress?: string;
      affiliateFee?: string;
      isStreamingSwap?: boolean;
      liquidityFee?: string;
      memo?: string;
      networkFees?: {
        asset: string;
        amount: string;
      }[];
      swapSlip?: string;
      swapTarget?: string;
      netOutputValueUSD?: string;
    };
    addLiquidity?: {
      liquidityUnits?: string;
    };
    withdraw?: {
      asymmetry?: string;
      basisPoints?: string;
      liquidityUnits?: string;
      networkFees?: {
        asset: string;
        amount: string;
      }[];
    };
    refund?: {
      affiliateAddress?: string;
      affiliateFee?: string;
      memo?: string;
      networkFees?: {
        asset: string;
        amount: string;
      }[];
      reason?: string;
    };
  };
  totalCount?: number;
}

export interface ActionTx {
  address: string;
  coins: {
    asset: string;
    amount: string;
  }[];
  txID: string;
}

export interface Member {
  pools: string[];
  rune_address?: string;
  asset_address?: string;
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface MemberPool {
  asset: string;
  assetAddress?: string;
  runeAddress?: string;
  liquidityUnits: string;
  assetDeposit: string;
  runeDeposit: string;
  assetWithdrawn: string;
  runeWithdrawn: string;
  dateFirstAdded: string;
  dateLastAdded: string;
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface HistoryStats {
  startTime: string;
  endTime: string;
  swapVolume?: string;
  swapCount?: string;
  runeVolume?: string;
  toAssetVolume?: string;
  toRuneVolume?: string;
  synthMintVolume?: string;
  synthRedeemVolume?: string;
  totalFees?: string;
  toAssetFees?: string;
  toRuneFees?: string;
  totalVolume?: string;
  addLiquidityVolume?: string;
  addLiquidityCount?: string;
  withdrawVolume?: string;
  withdrawCount?: string;
  runePriceUSD?: string;
}

export interface TVLHistory {
  startTime: string;
  endTime: string;
  totalValuePooled: string;
  totalValueBonded?: string;
  totalValueLocked?: string;
  runePriceUSD?: string;
}

export interface EarningsHistory {
  startTime: string;
  endTime: string;
  liquidityEarnings: string;
  blockRewards: string;
  earnings: string;
  bondingEarnings: string;
  liquidityFees: string;
  avgNodeCount?: string;
  runePriceUSD?: string;
  pools?: {
    pool: string;
    earnings: string;
    assetLiquidityFees: string;
    runeLiquidityFees: string;
    rewards: string;
    saverEarning?: string;
  }[];
}

export interface Mimir {
  [key: string]: number;
}

export interface Constants {
  int_64_values: {
    [key: string]: number;
  };
  bool_values: {
    [key: string]: boolean;
  };
  string_values: {
    [key: string]: string;
  };
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface Queue {
  swap: number;
  outbound: number;
  scheduled_outbound_value: string;
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface Affiliate {
  affiliate_address?: string;
  affiliate_fee_basis_points?: string;
}

export interface TradeAsset {
  asset: string;
  units: string;
  depth: string;
  owner?: string;
}

export interface ParsedMemo {
  type: string;
  asset?: string;
  destAddress?: string;
  limit?: string;
  affiliateAddress?: string;
  affiliateFee?: string;
  interval?: string;
  quantity?: string;
  raw: string;
  [key: string]: IDataObject | string | number | boolean | null | undefined | string[] | number[] | IDataObject[];
}

export interface TriggerEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  count?: number;
  nextPageToken?: string;
}
