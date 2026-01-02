/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// Pools
import * as pools from './actions/pools/pools';
// Swaps
import * as swaps from './actions/swaps/swaps';
// Liquidity Providers
import * as liquidityProviders from './actions/liquidityProviders/liquidityProviders';
// Savers
import * as savers from './actions/savers/savers';
// Lending
import * as lending from './actions/lending/lending';
// Network
import * as network from './actions/network/network';
// Nodes
import * as nodes from './actions/nodes/nodes';
// Transactions
import * as transactions from './actions/transactions/transactions';
// RUNE Token
import * as runeToken from './actions/runeToken/runeToken';
// Members
import * as members from './actions/members/members';
// Protocol Stats
import * as protocolStats from './actions/protocolStats/protocolStats';
// Affiliate
import * as affiliate from './actions/affiliate/affiliate';
// Trade Assets
import * as tradeAssets from './actions/tradeAssets/tradeAssets';
// Utility
import * as utility from './actions/utility/utility';

// Constants
import { POOL_STATUS_OPTIONS, TIME_INTERVAL_OPTIONS, MEMO_TYPES, SUPPORTED_CHAINS } from './constants/chains';

// Emit licensing notice once at load time
const LICENSING_NOTICE_EMITTED = Symbol.for('thorchain.licensing.notice');
if (!(globalThis as Record<symbol, boolean>)[LICENSING_NOTICE_EMITTED]) {
	console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
	(globalThis as Record<symbol, boolean>)[LICENSING_NOTICE_EMITTED] = true;
}

export class THORChain implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'THORChain',
		name: 'thorchain',
		icon: 'file:thorchain.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with THORChain decentralized liquidity protocol',
		defaults: {
			name: 'THORChain',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'thorchainApi',
				required: true,
			},
		],
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Affiliate', value: 'affiliate' },
					{ name: 'Lending', value: 'lending' },
					{ name: 'Liquidity Providers', value: 'liquidityProviders' },
					{ name: 'Members', value: 'members' },
					{ name: 'Network', value: 'network' },
					{ name: 'Nodes', value: 'nodes' },
					{ name: 'Pools', value: 'pools' },
					{ name: 'Protocol Stats', value: 'protocolStats' },
					{ name: 'RUNE Token', value: 'runeToken' },
					{ name: 'Savers', value: 'savers' },
					{ name: 'Swaps', value: 'swaps' },
					{ name: 'Trade Assets', value: 'tradeAssets' },
					{ name: 'Transactions', value: 'transactions' },
					{ name: 'Utility', value: 'utility' },
				],
				default: 'pools',
			},

			// ============ POOLS OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['pools'],
					},
				},
				options: [
					{ name: 'Get Pool APY', value: 'getPoolAPY', description: 'Get annual percentage yield for a pool', action: 'Get pool apy' },
					{ name: 'Get Pool Depth', value: 'getPoolDepth', description: 'Get liquidity depth history for a pool', action: 'Get pool depth' },
					{ name: 'Get Pool History', value: 'getPoolHistory', description: 'Get historical pool data', action: 'Get pool history' },
					{ name: 'Get Pool Info', value: 'getPoolInfo', description: 'Get pool details by asset', action: 'Get pool info' },
					{ name: 'Get Pool Stats', value: 'getPoolStats', description: 'Get comprehensive pool metrics', action: 'Get pool stats' },
					{ name: 'Get Pool Volume', value: 'getPoolVolume', description: 'Get trading volume for a pool', action: 'Get pool volume' },
					{ name: 'List Pools', value: 'listPools', description: 'List all available pools', action: 'List pools' },
				],
				default: 'listPools',
			},

			// ============ SWAPS OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['swaps'],
					},
				},
				options: [
					{ name: 'Build Swap Memo', value: 'buildSwapMemo', description: 'Construct transaction memo for swap', action: 'Build swap memo' },
					{ name: 'Estimate Fees', value: 'estimateFees', description: 'Get fee breakdown for swap', action: 'Estimate fees' },
					{ name: 'Get Inbound Addresses', value: 'getInboundAddresses', description: 'Get current vault addresses for deposits', action: 'Get inbound addresses' },
					{ name: 'Get Streaming Quote', value: 'getStreamingQuote', description: 'Get streaming swap quote for large swaps', action: 'Get streaming quote' },
					{ name: 'Get Swap History', value: 'getSwapHistory', description: 'Get past swaps by address', action: 'Get swap history' },
					{ name: 'Get Swap Quote', value: 'getSwapQuote', description: 'Get quote for swap', action: 'Get swap quote' },
					{ name: 'Get Swap Status', value: 'getSwapStatus', description: 'Track swap by transaction hash', action: 'Get swap status' },
				],
				default: 'getSwapQuote',
			},

			// ============ LIQUIDITY PROVIDERS OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['liquidityProviders'],
					},
				},
				options: [
					{ name: 'Get Add Liquidity Quote', value: 'getAddLiquidityQuote', description: 'Estimate LP tokens for deposit', action: 'Get add liquidity quote' },
					{ name: 'Get LP By Address', value: 'getLPByAddress', description: 'Get all LP positions for an address', action: 'Get lp by address' },
					{ name: 'Get LP Earnings', value: 'getLPEarnings', description: 'Calculate yield earned', action: 'Get lp earnings' },
					{ name: 'Get LP History', value: 'getLPHistory', description: 'Get historical LP data', action: 'Get lp history' },
					{ name: 'Get LP Position', value: 'getLPPosition', description: 'Get LP position by pool and address', action: 'Get lp position' },
					{ name: 'Get Withdraw Quote', value: 'getWithdrawQuote', description: 'Estimate withdrawal amounts', action: 'Get withdraw quote' },
					{ name: 'List Pool LPs', value: 'listPoolLPs', description: 'List all LPs in a specific pool', action: 'List pool lps' },
				],
				default: 'getLPPosition',
			},

			// ============ SAVERS OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['savers'],
					},
				},
				options: [
					{ name: 'Get Saver Caps', value: 'getSaverCaps', description: 'Get deposit limits and utilization', action: 'Get saver caps' },
					{ name: 'Get Saver Position', value: 'getSaverPosition', description: 'Get saver vault position by asset and address', action: 'Get saver position' },
					{ name: 'Get Saver Quote', value: 'getSaverQuote', description: 'Get deposit/withdraw quote for savers', action: 'Get saver quote' },
					{ name: 'Get Saver Yield', value: 'getSaverYield', description: 'Get current saver APY by asset', action: 'Get saver yield' },
					{ name: 'List Savers', value: 'listSavers', description: 'List all saver positions', action: 'List savers' },
				],
				default: 'getSaverPosition',
			},

			// ============ LENDING OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['lending'],
					},
				},
				options: [
					{ name: 'Get Collateral Ratio', value: 'getCollateralRatio', description: 'Get current CR percentage', action: 'Get collateral ratio' },
					{ name: 'Get Lending Stats', value: 'getLendingStats', description: 'Get protocol lending metrics', action: 'Get lending stats' },
					{ name: 'Get Loan Position', value: 'getLoanPosition', description: 'Get loan details by asset and address', action: 'Get loan position' },
					{ name: 'Get Loan Quote', value: 'getLoanQuote', description: 'Get borrow quote', action: 'Get loan quote' },
					{ name: 'Get Repay Quote', value: 'getRepayQuote', description: 'Get repayment quote', action: 'Get repay quote' },
					{ name: 'List Loans', value: 'listLoans', description: 'List all loans', action: 'List loans' },
				],
				default: 'getLoanPosition',
			},

			// ============ NETWORK OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['network'],
					},
				},
				options: [
					{ name: 'Get Ban List', value: 'getBanList', description: 'Get banned node addresses', action: 'Get ban list' },
					{ name: 'Get Block Height', value: 'getBlockHeight', description: 'Get current block heights', action: 'Get block height' },
					{ name: 'Get Constants', value: 'getConstants', description: 'Get protocol constants', action: 'Get constants' },
					{ name: 'Get Inbound Addresses', value: 'getInboundAddresses', description: 'Get all vault addresses', action: 'Get inbound addresses' },
					{ name: 'Get Mimir', value: 'getMimir', description: 'Get network parameter overrides', action: 'Get mimir' },
					{ name: 'Get Network Info', value: 'getNetworkInfo', description: 'Get chain status and version', action: 'Get network info' },
					{ name: 'Get Network Stats', value: 'getNetworkStats', description: 'Get network statistics', action: 'Get network stats' },
					{ name: 'Get Queue', value: 'getQueue', description: 'Get transaction queue status', action: 'Get queue' },
					{ name: 'Get Ragnarok Status', value: 'getRagnarok', description: 'Get Ragnarok (shutdown) status', action: 'Get ragnarok status' },
					{ name: 'Get Version', value: 'getVersion', description: 'Get THORNode version', action: 'Get version' },
				],
				default: 'getNetworkInfo',
			},

			// ============ NODES OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['nodes'],
					},
				},
				options: [
					{ name: 'Get Bond Info', value: 'getBondInfo', description: 'Get node bond information', action: 'Get bond info' },
					{ name: 'Get Churning Status', value: 'getChurningStatus', description: 'Get node rotation status', action: 'Get churning status' },
					{ name: 'Get Jailed Nodes', value: 'getJailedNodes', description: 'Get jailed node list', action: 'Get jailed nodes' },
					{ name: 'Get Node Info', value: 'getNodeInfo', description: 'Get node details by address', action: 'Get node info' },
					{ name: 'Get Node Pubkeys', value: 'getNodePubkeys', description: 'Get node public keys', action: 'Get node pubkeys' },
					{ name: 'Get Node Rewards', value: 'getNodeRewards', description: 'Get node earnings', action: 'Get node rewards' },
					{ name: 'List Active Nodes', value: 'listActiveNodes', description: 'List all active THORNodes', action: 'List active nodes' },
					{ name: 'List All Nodes', value: 'listAllNodes', description: 'List all THORNodes with status filter', action: 'List all nodes' },
				],
				default: 'listActiveNodes',
			},

			// ============ TRANSACTIONS OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['transactions'],
					},
				},
				options: [
					{ name: 'Get Pending Outbounds', value: 'getPendingOutbounds', description: 'Get pending outbound transactions', action: 'Get pending outbounds' },
					{ name: 'Get Scheduled Outbounds', value: 'getScheduledOutbounds', description: 'Get queued outbound transactions', action: 'Get scheduled outbounds' },
					{ name: 'Get Signers', value: 'getSigners', description: 'Get transaction signers', action: 'Get signers' },
					{ name: 'Get Stages', value: 'getStages', description: 'Get transaction stages', action: 'Get stages' },
					{ name: 'Get Transaction By Hash', value: 'getTransactionByHash', description: 'Get full transaction details', action: 'Get transaction by hash' },
					{ name: 'Get Transaction Count', value: 'getTxCount', description: 'Get total transaction count', action: 'Get transaction count' },
					{ name: 'Get Transaction Details', value: 'getTxDetails', description: 'Get combined transaction details', action: 'Get transaction details' },
					{ name: 'Get Transaction Status', value: 'getTransactionStatus', description: 'Track transaction by hash', action: 'Get transaction status' },
					{ name: 'List Actions', value: 'listActions', description: 'List recent protocol actions', action: 'List actions' },
				],
				default: 'getTransactionStatus',
			},

			// ============ RUNE TOKEN OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['runeToken'],
					},
				},
				options: [
					{ name: 'Get RUNE History', value: 'getRUNEHistory', description: 'Get Runepool historical data', action: 'Get rune history' },
					{ name: 'Get RUNE Pools', value: 'getRUNEPools', description: 'Get RUNE distribution across pools', action: 'Get rune pools' },
					{ name: 'Get RUNE Price', value: 'getRUNEPrice', description: 'Get current RUNE price in USD', action: 'Get rune price' },
					{ name: 'Get RUNE Supply', value: 'getRUNESupply', description: 'Get circulating and total supply', action: 'Get rune supply' },
					{ name: 'Get RUNE Volume', value: 'getRUNEVolume', description: 'Get RUNE trading volume', action: 'Get rune volume' },
				],
				default: 'getRUNEPrice',
			},

			// ============ MEMBERS OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['members'],
					},
				},
				options: [
					{ name: 'Get Member History', value: 'getMemberHistory', description: 'Get activity history', action: 'Get member history' },
					{ name: 'Get Member Info', value: 'getMemberInfo', description: 'Get member details by address', action: 'Get member info' },
					{ name: 'Get Member Pools', value: 'getMemberPools', description: 'Get all LP positions for member', action: 'Get member pools' },
					{ name: 'Get Member Summary', value: 'getMemberSummary', description: 'Get aggregated member stats', action: 'Get member summary' },
					{ name: 'Get Member Value', value: 'getMemberValue', description: 'Get USD value of positions', action: 'Get member value' },
				],
				default: 'getMemberInfo',
			},

			// ============ PROTOCOL STATS OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['protocolStats'],
					},
				},
				options: [
					{ name: 'Get Depth History', value: 'getDepthHistory', description: 'Get historical liquidity data', action: 'Get depth history' },
					{ name: 'Get Earnings History', value: 'getEarningsHistory', description: 'Get protocol earnings over time', action: 'Get earnings history' },
					{ name: 'Get Liquidity History', value: 'getLiquidityHistory', description: 'Get historical liquidity actions', action: 'Get liquidity history' },
					{ name: 'Get Protocol Stats', value: 'getProtocolStats', description: 'Get overall protocol metrics', action: 'Get protocol stats' },
					{ name: 'Get Savers History', value: 'getSaversHistory', description: 'Get savers vault history', action: 'Get savers history' },
					{ name: 'Get Swap History', value: 'getSwapHistory', description: 'Get aggregate swap statistics', action: 'Get swap history' },
					{ name: 'Get TVL', value: 'getTVL', description: 'Get total value locked history', action: 'Get tvl' },
					{ name: 'Get Volume History', value: 'getVolumeHistory', description: 'Get historical volume data', action: 'Get volume history' },
				],
				default: 'getProtocolStats',
			},

			// ============ AFFILIATE OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['affiliate'],
					},
				},
				options: [
					{ name: 'Get Affiliate Earnings', value: 'getAffiliateEarnings', description: 'Get fee earnings', action: 'Get affiliate earnings' },
					{ name: 'Get Affiliate Info', value: 'getAffiliateInfo', description: 'Get affiliate details by address', action: 'Get affiliate info' },
					{ name: 'Get Affiliate Stats', value: 'getAffiliateStats', description: 'Get affiliate statistics', action: 'Get affiliate stats' },
					{ name: 'Get Affiliate Swaps', value: 'getAffiliateSwaps', description: 'Get affiliate swap history', action: 'Get affiliate swaps' },
					{ name: 'Register Affiliate', value: 'registerAffiliate', description: 'Build affiliate registration memo', action: 'Register affiliate' },
				],
				default: 'getAffiliateInfo',
			},

			// ============ TRADE ASSETS OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['tradeAssets'],
					},
				},
				options: [
					{ name: 'Get Synth Stats', value: 'getSynthStats', description: 'Get protocol-wide synth statistics', action: 'Get synth stats' },
					{ name: 'Get Trade Account Balance', value: 'getTradeAccountBalance', description: 'Get trade account balance', action: 'Get trade account balance' },
					{ name: 'Get Trade Asset Holders', value: 'getTradeAssetHolders', description: 'Get holder list for trade asset', action: 'Get trade asset holders' },
					{ name: 'Get Trade Asset Info', value: 'getTradeAssetInfo', description: 'Get trade asset details', action: 'Get trade asset info' },
					{ name: 'Get Trade Asset Quote', value: 'getTradeAssetQuote', description: 'Get trade asset quote', action: 'Get trade asset quote' },
					{ name: 'List Trade Assets', value: 'listTradeAssets', description: 'List all available trade assets', action: 'List trade assets' },
				],
				default: 'listTradeAssets',
			},

			// ============ UTILITY OPERATIONS ============
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['utility'],
					},
				},
				options: [
					{ name: 'Build Memo', value: 'buildMemo', description: 'Construct transaction memo for any action', action: 'Build memo' },
					{ name: 'Convert Amount', value: 'convertAmount', description: 'Convert between base units and human-readable', action: 'Convert amount' },
					{ name: 'Get API Health', value: 'getAPIHealth', description: 'Check service status', action: 'Get api health' },
					{ name: 'Get Asset Info', value: 'getAssetInfo', description: 'Get asset chain info', action: 'Get asset info' },
					{ name: 'Get Supported Chains', value: 'getSupportedChains', description: 'Get list of connected chains', action: 'Get supported chains' },
					{ name: 'Parse Memo', value: 'parseMemo', description: 'Decode and parse transaction memo', action: 'Parse memo' },
					{ name: 'Validate Address', value: 'validateAddress', description: 'Validate address for specific chain', action: 'Validate address' },
					{ name: 'Validate Asset', value: 'validateAsset', description: 'Validate asset format', action: 'Validate asset' },
				],
				default: 'buildMemo',
			},

			// ============ COMMON PARAMETERS ============

			// Asset parameter (used by many operations)
			{
				displayName: 'Asset',
				name: 'asset',
				type: 'string',
				default: '',
				placeholder: 'BTC.BTC',
				description: 'Asset identifier (e.g., BTC.BTC, ETH.ETH, GAIA.ATOM)',
				displayOptions: {
					show: {
						resource: ['pools', 'savers', 'lending', 'tradeAssets'],
						operation: ['getPoolInfo', 'getPoolDepth', 'getPoolVolume', 'getPoolAPY', 'getPoolStats', 'getPoolHistory', 'getSaverPosition', 'getSaverQuote', 'listSavers', 'getSaverYield', 'getSaverCaps', 'getLoanPosition', 'getLoanQuote', 'getCollateralRatio', 'listLoans', 'getTradeAssetInfo', 'getTradeAssetHolders', 'getTradeAccountBalance', 'getTradeAssetQuote'],
					},
				},
			},

			// Address parameter
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				default: '',
				placeholder: 'thor1...',
				description: 'Wallet or node address',
				displayOptions: {
					show: {
						resource: ['liquidityProviders', 'savers', 'lending', 'members', 'affiliate', 'tradeAssets'],
						operation: ['getLPPosition', 'getLPByAddress', 'getLPHistory', 'getLPEarnings', 'getWithdrawQuote', 'getSaverPosition', 'getLoanPosition', 'getCollateralRatio', 'getMemberInfo', 'getMemberPools', 'getMemberHistory', 'getMemberSummary', 'getMemberValue', 'getAffiliateInfo', 'getAffiliateEarnings', 'getAffiliateSwaps', 'getAffiliateStats', 'getTradeAccountBalance'],
					},
				},
			},

			// Node address parameter
			{
				displayName: 'Node Address',
				name: 'nodeAddress',
				type: 'string',
				default: '',
				placeholder: 'thor1...',
				description: 'THORNode address',
				displayOptions: {
					show: {
						resource: ['nodes'],
						operation: ['getNodeInfo', 'getNodeRewards', 'getBondInfo', 'getNodePubkeys'],
					},
				},
			},

			// Transaction hash parameter
			{
				displayName: 'Transaction Hash',
				name: 'txHash',
				type: 'string',
				default: '',
				placeholder: '0x...',
				description: 'Transaction hash',
				displayOptions: {
					show: {
						resource: ['swaps', 'transactions'],
						operation: ['getSwapStatus', 'getTransactionStatus', 'getTransactionByHash', 'getTxDetails', 'getStages', 'getSigners'],
					},
				},
			},

			// Period parameter
			{
				displayName: 'Period',
				name: 'period',
				type: 'options',
				options: [
					{ name: '1 Hour', value: '1h' },
					{ name: '24 Hours', value: '24h' },
					{ name: '7 Days', value: '7d' },
					{ name: '30 Days', value: '30d' },
					{ name: '90 Days', value: '90d' },
					{ name: '365 Days', value: '365d' },
					{ name: 'All Time', value: 'all' },
				],
				default: '24h',
				description: 'Time period for statistics',
				displayOptions: {
					show: {
						resource: ['pools'],
						operation: ['getPoolInfo', 'listPools', 'getPoolStats'],
					},
				},
			},

			// Interval parameter
			{
				displayName: 'Interval',
				name: 'interval',
				type: 'options',
				options: [...TIME_INTERVAL_OPTIONS],
				default: 'day',
				description: 'Time interval for historical data',
				displayOptions: {
					show: {
						resource: ['pools', 'runeToken', 'protocolStats'],
						operation: ['getPoolDepth', 'getPoolVolume', 'getPoolHistory', 'getRUNEVolume', 'getRUNEHistory', 'getTVL', 'getVolumeHistory', 'getEarningsHistory', 'getSwapHistory', 'getDepthHistory', 'getLiquidityHistory', 'getSaversHistory'],
					},
				},
			},

			// Count parameter
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 400,
				},
				default: 30,
				description: 'Number of data points to return',
				displayOptions: {
					show: {
						resource: ['pools', 'runeToken', 'protocolStats'],
						operation: ['getPoolDepth', 'getPoolVolume', 'getPoolHistory', 'getRUNEVolume', 'getRUNEHistory', 'getTVL', 'getVolumeHistory', 'getEarningsHistory', 'getSwapHistory', 'getDepthHistory', 'getLiquidityHistory', 'getSaversHistory'],
					},
				},
			},

			// Limit parameter
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 50,
				description: 'Maximum number of results to return',
				displayOptions: {
					show: {
						resource: ['liquidityProviders', 'swaps', 'transactions', 'members', 'affiliate'],
						operation: ['getLPHistory', 'getSwapHistory', 'listActions', 'getMemberHistory', 'getAffiliateEarnings', 'getAffiliateSwaps'],
					},
				},
			},

			// Pool status filter
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [...POOL_STATUS_OPTIONS],
				default: '',
				description: 'Filter pools by status',
				displayOptions: {
					show: {
						resource: ['pools'],
						operation: ['listPools'],
					},
				},
			},

			// Node status filter
			{
				displayName: 'Node Status',
				name: 'nodeStatus',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Active', value: 'Active' },
					{ name: 'Standby', value: 'Standby' },
					{ name: 'Disabled', value: 'Disabled' },
					{ name: 'Whitelisted', value: 'Whitelisted' },
				],
				default: '',
				description: 'Filter nodes by status',
				displayOptions: {
					show: {
						resource: ['nodes'],
						operation: ['listAllNodes'],
					},
				},
			},

			// From asset (swaps)
			{
				displayName: 'From Asset',
				name: 'fromAsset',
				type: 'string',
				default: '',
				placeholder: 'BTC.BTC',
				description: 'Source asset for swap',
				displayOptions: {
					show: {
						resource: ['swaps', 'lending', 'tradeAssets'],
						operation: ['getSwapQuote', 'getStreamingQuote', 'buildSwapMemo', 'estimateFees', 'getLoanQuote', 'getRepayQuote', 'getTradeAssetQuote'],
					},
				},
			},

			// To asset (swaps)
			{
				displayName: 'To Asset',
				name: 'toAsset',
				type: 'string',
				default: '',
				placeholder: 'ETH.ETH',
				description: 'Destination asset for swap',
				displayOptions: {
					show: {
						resource: ['swaps', 'lending', 'tradeAssets'],
						operation: ['getSwapQuote', 'getStreamingQuote', 'buildSwapMemo', 'estimateFees', 'getLoanQuote', 'getRepayQuote', 'getTradeAssetQuote'],
					},
				},
			},

			// Amount
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'string',
				default: '',
				placeholder: '10000000',
				description: 'Amount in base units (1e8)',
				displayOptions: {
					show: {
						resource: ['swaps', 'savers', 'lending', 'tradeAssets', 'utility'],
						operation: ['getSwapQuote', 'getStreamingQuote', 'estimateFees', 'getSaverQuote', 'getLoanQuote', 'getRepayQuote', 'getTradeAssetQuote', 'convertAmount'],
					},
				},
			},

			// Destination address
			{
				displayName: 'Destination Address',
				name: 'destination',
				type: 'string',
				default: '',
				placeholder: 'bc1...',
				description: 'Destination address for output',
				displayOptions: {
					show: {
						resource: ['swaps', 'lending', 'tradeAssets'],
						operation: ['getSwapQuote', 'getStreamingQuote', 'buildSwapMemo', 'getLoanQuote', 'getTradeAssetQuote'],
					},
				},
			},

			// Streaming swap parameters
			{
				displayName: 'Streaming Interval',
				name: 'streamingInterval',
				type: 'number',
				default: 0,
				description: 'Blocks between sub-swaps (0 for single swap)',
				displayOptions: {
					show: {
						resource: ['swaps'],
						operation: ['getSwapQuote', 'getStreamingQuote'],
					},
				},
			},

			{
				displayName: 'Streaming Quantity',
				name: 'streamingQuantity',
				type: 'number',
				default: 0,
				description: 'Number of sub-swaps (0 for optimal)',
				displayOptions: {
					show: {
						resource: ['swaps'],
						operation: ['getSwapQuote', 'getStreamingQuote'],
					},
				},
			},

			// Affiliate parameters
			{
				displayName: 'Affiliate Address',
				name: 'affiliateAddress',
				type: 'string',
				default: '',
				placeholder: 'thor1...',
				description: 'Affiliate THORChain address',
				displayOptions: {
					show: {
						resource: ['swaps', 'savers', 'lending'],
						operation: ['getSwapQuote', 'getStreamingQuote', 'buildSwapMemo', 'getSaverQuote', 'getLoanQuote'],
					},
				},
			},

			{
				displayName: 'Affiliate Fee Bps',
				name: 'affiliateFeeBps',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 1000,
				},
				default: 0,
				description: 'Affiliate fee in basis points (0-1000)',
				displayOptions: {
					show: {
						resource: ['swaps', 'savers', 'affiliate'],
						operation: ['getSwapQuote', 'getStreamingQuote', 'buildSwapMemo', 'getSaverQuote', 'registerAffiliate'],
					},
				},
			},

			// LP specific parameters
			{
				displayName: 'Pool Asset',
				name: 'poolAsset',
				type: 'string',
				default: '',
				placeholder: 'BTC.BTC',
				description: 'Pool asset identifier',
				displayOptions: {
					show: {
						resource: ['liquidityProviders'],
						operation: ['getLPPosition', 'listPoolLPs', 'getLPHistory', 'getAddLiquidityQuote', 'getWithdrawQuote'],
					},
				},
			},

			{
				displayName: 'Asset Amount',
				name: 'assetAmount',
				type: 'string',
				default: '',
				placeholder: '10000000',
				description: 'Asset amount in base units',
				displayOptions: {
					show: {
						resource: ['liquidityProviders'],
						operation: ['getAddLiquidityQuote'],
					},
				},
			},

			{
				displayName: 'RUNE Amount',
				name: 'runeAmount',
				type: 'string',
				default: '',
				placeholder: '10000000',
				description: 'RUNE amount in base units',
				displayOptions: {
					show: {
						resource: ['liquidityProviders'],
						operation: ['getAddLiquidityQuote'],
					},
				},
			},

			{
				displayName: 'Withdraw Basis Points',
				name: 'withdrawBps',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 10000,
				},
				default: 10000,
				description: 'Percentage to withdraw in basis points (10000 = 100%)',
				displayOptions: {
					show: {
						resource: ['liquidityProviders'],
						operation: ['getWithdrawQuote'],
					},
				},
			},

			{
				displayName: 'Withdraw Asset',
				name: 'withdrawAsset',
				type: 'string',
				default: '',
				placeholder: 'BTC.BTC',
				description: 'Asset to withdraw to (leave empty for symmetrical)',
				displayOptions: {
					show: {
						resource: ['liquidityProviders'],
						operation: ['getWithdrawQuote'],
					},
				},
			},

			// Saver action type
			{
				displayName: 'Saver Action',
				name: 'saverAction',
				type: 'options',
				options: [
					{ name: 'Deposit', value: 'deposit' },
					{ name: 'Withdraw', value: 'withdraw' },
				],
				default: 'deposit',
				description: 'Type of saver action',
				displayOptions: {
					show: {
						resource: ['savers'],
						operation: ['getSaverQuote'],
					},
				},
			},

			// Trade asset action
			{
				displayName: 'Trade Action',
				name: 'tradeAction',
				type: 'options',
				options: [
					{ name: 'Deposit', value: 'deposit' },
					{ name: 'Withdraw', value: 'withdraw' },
				],
				default: 'deposit',
				description: 'Type of trade asset action',
				displayOptions: {
					show: {
						resource: ['tradeAssets'],
						operation: ['getTradeAssetQuote'],
					},
				},
			},

			// Lending parameters
			{
				displayName: 'Loan Owner',
				name: 'loanOwner',
				type: 'string',
				default: '',
				placeholder: 'thor1...',
				description: 'Address of the loan owner',
				displayOptions: {
					show: {
						resource: ['lending'],
						operation: ['getRepayQuote'],
					},
				},
			},

			{
				displayName: 'Min Out',
				name: 'minOut',
				type: 'string',
				default: '0',
				description: 'Minimum output amount',
				displayOptions: {
					show: {
						resource: ['swaps', 'lending'],
						operation: ['buildSwapMemo', 'getLoanQuote'],
					},
				},
			},

			// Transaction action type filter
			{
				displayName: 'Action Type',
				name: 'actionType',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Swap', value: 'swap' },
					{ name: 'Add Liquidity', value: 'addLiquidity' },
					{ name: 'Withdraw', value: 'withdraw' },
					{ name: 'Donate', value: 'donate' },
					{ name: 'Refund', value: 'refund' },
					{ name: 'Switch', value: 'switch' },
				],
				default: '',
				description: 'Filter actions by type',
				displayOptions: {
					show: {
						resource: ['transactions', 'members'],
						operation: ['listActions', 'getMemberHistory'],
					},
				},
			},

			// Memo builder parameters
			{
				displayName: 'Memo Type',
				name: 'memoType',
				type: 'options',
				options: [...MEMO_TYPES],
				default: 'swap',
				description: 'Type of memo to build',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['buildMemo'],
					},
				},
			},

			// Memo to parse
			{
				displayName: 'Memo',
				name: 'memo',
				type: 'string',
				default: '',
				placeholder: '=:BTC.BTC:bc1...',
				description: 'Transaction memo to parse',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['parseMemo'],
					},
				},
			},

			// Chain for validation
			{
				displayName: 'Chain',
				name: 'chain',
				type: 'options',
				options: SUPPORTED_CHAINS.map(c => ({ name: c, value: c })),
				default: 'THOR',
				description: 'Blockchain network',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['validateAddress'],
					},
				},
			},

			// Address to validate
			{
				displayName: 'Address to Validate',
				name: 'addressToValidate',
				type: 'string',
				default: '',
				placeholder: 'thor1...',
				description: 'Address to validate',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['validateAddress'],
					},
				},
			},

			// Asset to validate
			{
				displayName: 'Asset to Validate',
				name: 'assetToValidate',
				type: 'string',
				default: '',
				placeholder: 'BTC.BTC',
				description: 'Asset identifier to validate',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['validateAsset', 'getAssetInfo'],
					},
				},
			},

			// Convert direction
			{
				displayName: 'Conversion Direction',
				name: 'conversionDirection',
				type: 'options',
				options: [
					{ name: 'To Base Units', value: 'toBase' },
					{ name: 'From Base Units', value: 'fromBase' },
				],
				default: 'toBase',
				description: 'Direction of conversion',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['convertAmount'],
					},
				},
			},

			{
				displayName: 'Decimals',
				name: 'decimals',
				type: 'number',
				default: 8,
				description: 'Number of decimals for the asset',
				displayOptions: {
					show: {
						resource: ['utility'],
						operation: ['convertAmount'],
					},
				},
			},

			// Affiliate registration parameters
			{
				displayName: 'THOR Address',
				name: 'thorAddress',
				type: 'string',
				default: '',
				placeholder: 'thor1...',
				description: 'THORChain address for affiliate',
				displayOptions: {
					show: {
						resource: ['affiliate'],
						operation: ['registerAffiliate'],
					},
				},
			},

			{
				displayName: 'Affiliate Name',
				name: 'affiliateName',
				type: 'string',
				default: '',
				placeholder: 'myaffiliate',
				description: 'Short name for affiliate (alphanumeric)',
				displayOptions: {
					show: {
						resource: ['affiliate'],
						operation: ['registerAffiliate'],
					},
				},
			},

			// Date range parameters
			{
				displayName: 'From',
				name: 'from',
				type: 'string',
				default: '',
				placeholder: '1609459200',
				description: 'Start timestamp (Unix seconds)',
				displayOptions: {
					show: {
						resource: ['pools', 'runeToken', 'protocolStats'],
						operation: ['getPoolHistory', 'getRUNEHistory', 'getTVL', 'getVolumeHistory', 'getEarningsHistory', 'getSwapHistory', 'getDepthHistory', 'getLiquidityHistory', 'getSaversHistory'],
					},
				},
			},

			{
				displayName: 'To',
				name: 'to',
				type: 'string',
				default: '',
				placeholder: '1640995200',
				description: 'End timestamp (Unix seconds)',
				displayOptions: {
					show: {
						resource: ['pools', 'runeToken', 'protocolStats'],
						operation: ['getPoolHistory', 'getRUNEHistory', 'getTVL', 'getVolumeHistory', 'getEarningsHistory', 'getSwapHistory', 'getDepthHistory', 'getLiquidityHistory', 'getSaversHistory'],
					},
				},
			},

			// Pool filter for history operations
			{
				displayName: 'Pool Filter',
				name: 'poolFilter',
				type: 'string',
				default: '',
				placeholder: 'BTC.BTC',
				description: 'Filter by specific pool (optional)',
				displayOptions: {
					show: {
						resource: ['protocolStats'],
						operation: ['getSwapHistory', 'getDepthHistory'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[] = [];

				// Route to appropriate handler
				switch (resource) {
					case 'pools':
						result = await executePoolsOperation.call(this, operation, i);
						break;
					case 'swaps':
						result = await executeSwapsOperation.call(this, operation, i);
						break;
					case 'liquidityProviders':
						result = await executeLiquidityProvidersOperation.call(this, operation, i);
						break;
					case 'savers':
						result = await executeSaversOperation.call(this, operation, i);
						break;
					case 'lending':
						result = await executeLendingOperation.call(this, operation, i);
						break;
					case 'network':
						result = await executeNetworkOperation.call(this, operation, i);
						break;
					case 'nodes':
						result = await executeNodesOperation.call(this, operation, i);
						break;
					case 'transactions':
						result = await executeTransactionsOperation.call(this, operation, i);
						break;
					case 'runeToken':
						result = await executeRuneTokenOperation.call(this, operation, i);
						break;
					case 'members':
						result = await executeMembersOperation.call(this, operation, i);
						break;
					case 'protocolStats':
						result = await executeProtocolStatsOperation.call(this, operation, i);
						break;
					case 'affiliate':
						result = await executeAffiliateOperation.call(this, operation, i);
						break;
					case 'tradeAssets':
						result = await executeTradeAssetsOperation.call(this, operation, i);
						break;
					case 'utility':
						result = await executeUtilityOperation.call(this, operation, i);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

// Handler functions for each resource

async function executePoolsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getPoolInfo':
			return pools.getPoolInfo.call(this, index);
		case 'listPools':
			return pools.listPools.call(this, index);
		case 'getPoolDepth':
			return pools.getPoolDepth.call(this, index);
		case 'getPoolVolume':
			return pools.getPoolVolume.call(this, index);
		case 'getPoolAPY':
			return pools.getPoolAPY.call(this, index);
		case 'getPoolStats':
			return pools.getPoolStats.call(this, index);
		case 'getPoolHistory':
			return pools.getPoolHistory.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown pools operation: ${operation}`);
	}
}

async function executeSwapsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getSwapQuote':
			return swaps.getSwapQuote.call(this, index);
		case 'buildSwapMemo':
			return swaps.buildSwapMemoAction.call(this, index);
		case 'getInboundAddresses':
			return swaps.getInboundAddresses.call(this, index);
		case 'getSwapStatus':
			return swaps.getSwapStatus.call(this, index);
		case 'getStreamingQuote':
			return swaps.getStreamingQuote.call(this, index);
		case 'getSwapHistory':
			return swaps.getSwapHistory.call(this, index);
		case 'estimateFees':
			return swaps.estimateFees.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown swaps operation: ${operation}`);
	}
}

async function executeLiquidityProvidersOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getLPPosition':
			return liquidityProviders.getLPPosition.call(this, index);
		case 'getLPByAddress':
			return liquidityProviders.getLPByAddress.call(this, index);
		case 'listPoolLPs':
			return liquidityProviders.listPoolLPs.call(this, index);
		case 'getLPHistory':
			return liquidityProviders.getLPHistory.call(this, index);
		case 'getLPEarnings':
			return liquidityProviders.getLPEarnings.call(this, index);
		case 'getAddLiquidityQuote':
			return liquidityProviders.getAddLiquidityQuote.call(this, index);
		case 'getWithdrawQuote':
			return liquidityProviders.getWithdrawQuote.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown liquidityProviders operation: ${operation}`);
	}
}

async function executeSaversOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getSaverPosition':
			return savers.getSaverPosition.call(this, index);
		case 'getSaverQuote':
			return savers.getSaverQuote.call(this, index);
		case 'listSavers':
			return savers.listSavers.call(this, index);
		case 'getSaverYield':
			return savers.getSaverYield.call(this, index);
		case 'getSaverCaps':
			return savers.getSaverCaps.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown savers operation: ${operation}`);
	}
}

async function executeLendingOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getLoanPosition':
			return lending.getLoanPosition.call(this, index);
		case 'getLoanQuote':
			return lending.getLoanQuote.call(this, index);
		case 'getCollateralRatio':
			return lending.getCollateralRatio.call(this, index);
		case 'listLoans':
			return lending.listLoans.call(this, index);
		case 'getLendingStats':
			return lending.getLendingStats.call(this, index);
		case 'getRepayQuote':
			return lending.getRepayQuote.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown lending operation: ${operation}`);
	}
}

async function executeNetworkOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getNetworkInfo':
			return network.getNetworkInfo.call(this, index);
		case 'getMimir':
			return network.getMimir.call(this, index);
		case 'getConstants':
			return network.getConstants.call(this, index);
		case 'getInboundAddresses':
			return network.getInboundAddresses.call(this, index);
		case 'getQueue':
			return network.getQueue.call(this, index);
		case 'getBlockHeight':
			return network.getBlockHeight.call(this, index);
		case 'getVersion':
			return network.getVersion.call(this, index);
		case 'getNetworkStats':
			return network.getNetworkStats.call(this, index);
		case 'getBanList':
			return network.getBanList.call(this, index);
		case 'getRagnarok':
			return network.getRagnarok.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown network operation: ${operation}`);
	}
}

async function executeNodesOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'listActiveNodes':
			return nodes.listActiveNodes.call(this, index);
		case 'getNodeInfo':
			return nodes.getNodeInfo.call(this, index);
		case 'getNodeRewards':
			return nodes.getNodeRewards.call(this, index);
		case 'getBondInfo':
			return nodes.getBondInfo.call(this, index);
		case 'getChurningStatus':
			return nodes.getChurningStatus.call(this, index);
		case 'listAllNodes':
			return nodes.listAllNodes.call(this, index);
		case 'getNodePubkeys':
			return nodes.getNodePubkeys.call(this, index);
		case 'getJailedNodes':
			return nodes.getJailedNodes.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown nodes operation: ${operation}`);
	}
}

async function executeTransactionsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getTransactionStatus':
			return transactions.getTransactionStatus.call(this, index);
		case 'getTransactionByHash':
			return transactions.getTransactionByHash.call(this, index);
		case 'listActions':
			return transactions.listActions.call(this, index);
		case 'getPendingOutbounds':
			return transactions.getPendingOutbounds.call(this, index);
		case 'getScheduledOutbounds':
			return transactions.getScheduledOutbounds.call(this, index);
		case 'getTxDetails':
			return transactions.getTxDetails.call(this, index);
		case 'getStages':
			return transactions.getStages.call(this, index);
		case 'getSigners':
			return transactions.getSigners.call(this, index);
		case 'getTxCount':
			return transactions.getTxCount.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown transactions operation: ${operation}`);
	}
}

async function executeRuneTokenOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getRUNEPrice':
			return runeToken.getRUNEPrice.call(this, index);
		case 'getRUNESupply':
			return runeToken.getRUNESupply.call(this, index);
		case 'getRUNEPools':
			return runeToken.getRUNEPools.call(this, index);
		case 'getRUNEVolume':
			return runeToken.getRUNEVolume.call(this, index);
		case 'getRUNEHistory':
			return runeToken.getRUNEHistory.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown runeToken operation: ${operation}`);
	}
}

async function executeMembersOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getMemberInfo':
			return members.getMemberInfo.call(this, index);
		case 'getMemberPools':
			return members.getMemberPools.call(this, index);
		case 'getMemberHistory':
			return members.getMemberHistory.call(this, index);
		case 'getMemberSummary':
			return members.getMemberSummary.call(this, index);
		case 'getMemberValue':
			return members.getMemberValue.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown members operation: ${operation}`);
	}
}

async function executeProtocolStatsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getProtocolStats':
			return protocolStats.getProtocolStats.call(this, index);
		case 'getTVL':
			return protocolStats.getTVL.call(this, index);
		case 'getVolumeHistory':
			return protocolStats.getVolumeHistory.call(this, index);
		case 'getEarningsHistory':
			return protocolStats.getEarningsHistory.call(this, index);
		case 'getSwapHistory':
			return protocolStats.getSwapHistory.call(this, index);
		case 'getDepthHistory':
			return protocolStats.getDepthHistory.call(this, index);
		case 'getLiquidityHistory':
			return protocolStats.getLiquidityHistory.call(this, index);
		case 'getSaversHistory':
			return protocolStats.getSaversHistory.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown protocolStats operation: ${operation}`);
	}
}

async function executeAffiliateOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getAffiliateInfo':
			return affiliate.getAffiliateInfo.call(this, index);
		case 'getAffiliateEarnings':
			return affiliate.getAffiliateEarnings.call(this, index);
		case 'registerAffiliate':
			return affiliate.registerAffiliate.call(this, index);
		case 'getAffiliateSwaps':
			return affiliate.getAffiliateSwaps.call(this, index);
		case 'getAffiliateStats':
			return affiliate.getAffiliateStats.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown affiliate operation: ${operation}`);
	}
}

async function executeTradeAssetsOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getTradeAssetInfo':
			return tradeAssets.getTradeAssetInfo.call(this, index);
		case 'listTradeAssets':
			return tradeAssets.listTradeAssets.call(this, index);
		case 'getTradeAssetHolders':
			return tradeAssets.getTradeAssetHolders.call(this, index);
		case 'getTradeAccountBalance':
			return tradeAssets.getTradeAccountBalance.call(this, index);
		case 'getTradeAssetQuote':
			return tradeAssets.getTradeAssetQuote.call(this, index);
		case 'getSynthStats':
			return tradeAssets.getSynthStats.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown tradeAssets operation: ${operation}`);
	}
}

async function executeUtilityOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'buildMemo':
			return utility.buildMemo.call(this, index);
		case 'parseMemo':
			return utility.parseMemoAction.call(this, index);
		case 'validateAddress':
			return utility.validateAddressAction.call(this, index);
		case 'getSupportedChains':
			return utility.getSupportedChains.call(this, index);
		case 'getAPIHealth':
			return utility.getAPIHealth.call(this, index);
		case 'validateAsset':
			return utility.validateAssetAction.call(this, index);
		case 'getAssetInfo':
			return utility.getAssetInfo.call(this, index);
		case 'convertAmount':
			return utility.convertAmount.call(this, index);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown utility operation: ${operation}`);
	}
}
