/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
} from 'n8n-workflow';

import { midgardApiRequest, thornodeApiRequest } from './transport/apiClient';
import type { Action, Pool, Node as ThorNode, InboundAddress } from './constants/types';
import { SUPPORTED_CHAINS } from './constants/chains';

export class THORChainTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'THORChain Trigger',
		name: 'thorchainTrigger',
		icon: 'file:thorchain.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers on THORChain events',
		defaults: {
			name: 'THORChain Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'thorchainApi',
				required: true,
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Large Swap Detected',
						value: 'largeSwapDetected',
						description: 'Swap above a threshold amount',
					},
					{
						name: 'LP Activity',
						value: 'lpActivity',
						description: 'New liquidity provider activity',
					},
					{
						name: 'Network Halt/Resume',
						value: 'networkHaltResume',
						description: 'Network halted or resumed trading',
					},
					{
						name: 'Node Churned',
						value: 'nodeChurned',
						description: 'Node rotation event occurred',
					},
					{
						name: 'Pool Depth Changed',
						value: 'poolDepthChanged',
						description: 'Significant pool depth change',
					},
					{
						name: 'Price Deviation',
						value: 'priceDeviation',
						description: 'Asset price deviation alert',
					},
					{
						name: 'Saver Activity',
						value: 'saverActivity',
						description: 'Saver deposit or withdrawal',
					},
					{
						name: 'Swap Completed',
						value: 'swapCompleted',
						description: 'New swap transaction completed',
					},
				],
				default: 'swapCompleted',
				required: true,
			},

			// Swap Completed filters
			{
				displayName: 'Pool Filter',
				name: 'poolFilter',
				type: 'string',
				default: '',
				placeholder: 'BTC.BTC',
				description: 'Filter by specific pool (leave empty for all)',
				displayOptions: {
					show: {
						event: ['swapCompleted', 'largeSwapDetected', 'lpActivity', 'poolDepthChanged'],
					},
				},
			},
			{
				displayName: 'Address Filter',
				name: 'addressFilter',
				type: 'string',
				default: '',
				placeholder: 'thor1...',
				description: 'Filter by address (leave empty for all)',
				displayOptions: {
					show: {
						event: ['swapCompleted', 'largeSwapDetected', 'lpActivity', 'saverActivity'],
					},
				},
			},
			{
				displayName: 'Minimum Amount (USD)',
				name: 'minAmountUsd',
				type: 'number',
				default: 0,
				description: 'Minimum swap amount in USD',
				displayOptions: {
					show: {
						event: ['swapCompleted', 'largeSwapDetected'],
					},
				},
			},

			// Large Swap threshold
			{
				displayName: 'Threshold Amount (USD)',
				name: 'thresholdUsd',
				type: 'number',
				default: 100000,
				description: 'Alert when swap exceeds this USD amount',
				displayOptions: {
					show: {
						event: ['largeSwapDetected'],
					},
				},
			},

			// Pool depth change threshold
			{
				displayName: 'Depth Change Threshold (%)',
				name: 'depthChangeThreshold',
				type: 'number',
				default: 5,
				description: 'Trigger when pool depth changes by this percentage',
				displayOptions: {
					show: {
						event: ['poolDepthChanged'],
					},
				},
			},

			// Price deviation
			{
				displayName: 'Asset',
				name: 'priceAsset',
				type: 'string',
				default: 'BTC.BTC',
				placeholder: 'BTC.BTC',
				description: 'Asset to monitor for price deviation',
				displayOptions: {
					show: {
						event: ['priceDeviation'],
					},
				},
			},
			{
				displayName: 'Deviation Threshold (%)',
				name: 'deviationThreshold',
				type: 'number',
				default: 2,
				description: 'Trigger when price deviates by this percentage',
				displayOptions: {
					show: {
						event: ['priceDeviation'],
					},
				},
			},

			// Saver activity filters
			{
				displayName: 'Saver Asset',
				name: 'saverAsset',
				type: 'string',
				default: '',
				placeholder: 'BTC.BTC',
				description: 'Filter by saver vault asset (leave empty for all)',
				displayOptions: {
					show: {
						event: ['saverActivity'],
					},
				},
			},

			// Chain filter for network events
			{
				displayName: 'Chain',
				name: 'chainFilter',
				type: 'options',
				options: [
					{ name: 'All Chains', value: '' },
					...SUPPORTED_CHAINS.map(c => ({ name: c, value: c })),
				],
				default: '',
				description: 'Filter by specific chain',
				displayOptions: {
					show: {
						event: ['networkHaltResume'],
					},
				},
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const event = this.getNodeParameter('event') as string;
		const webhookData = this.getWorkflowStaticData('node');
		const now = Math.floor(Date.now() / 1000);

		let returnData: INodeExecutionData[] = [];

		try {
			switch (event) {
				case 'swapCompleted':
					returnData = await pollSwapCompleted.call(this, webhookData, now);
					break;
				case 'largeSwapDetected':
					returnData = await pollLargeSwap.call(this, webhookData, now);
					break;
				case 'poolDepthChanged':
					returnData = await pollPoolDepthChanged.call(this, webhookData, now);
					break;
				case 'lpActivity':
					returnData = await pollLPActivity.call(this, webhookData, now);
					break;
				case 'saverActivity':
					returnData = await pollSaverActivity.call(this, webhookData, now);
					break;
				case 'nodeChurned':
					returnData = await pollNodeChurned.call(this, webhookData, now);
					break;
				case 'networkHaltResume':
					returnData = await pollNetworkHaltResume.call(this, webhookData, now);
					break;
				case 'priceDeviation':
					returnData = await pollPriceDeviation.call(this, webhookData, now);
					break;
			}
		} catch (error) {
			// Log error but don't fail - polling will retry
			console.error(`THORChain Trigger error (${event}):`, error);
			return null;
		}

		if (returnData.length === 0) {
			return null;
		}

		return [returnData];
	}
}

async function pollSwapCompleted(
	this: IPollFunctions,
	webhookData: IDataObject,
	now: number,
): Promise<INodeExecutionData[]> {
	const poolFilter = this.getNodeParameter('poolFilter', '') as string;
	const addressFilter = this.getNodeParameter('addressFilter', '') as string;
	const minAmountUsd = this.getNodeParameter('minAmountUsd', 0) as number;

	const lastTimestamp = (webhookData.lastTimestamp as number) || now - 60;
	webhookData.lastTimestamp = now;

	const query: IDataObject = {
		type: 'swap',
		limit: '50',
	};
	if (poolFilter) query.pool = poolFilter;
	if (addressFilter) query.address = addressFilter;

	const response = await midgardApiRequest(this, 'GET', '/actions', undefined, query) as { actions: Action[] };
	const actions = response.actions || [];

	const newActions = actions.filter((action: Action) => {
		const actionTime = parseInt(action.date, 10) / 1e9;
		if (actionTime <= lastTimestamp) return false;

		if (minAmountUsd > 0) {
			const valueUsd = parseInt(action.metadata?.swap?.netOutputValueUSD || '0', 10) / 100;
			if (valueUsd < minAmountUsd) return false;
		}

		return true;
	});

	return newActions.map((action: Action) => ({
		json: {
			event: 'swapCompleted',
			timestamp: parseInt(action.date, 10) / 1e9,
			txId: action.in?.[0]?.txID || '',
			fromAsset: action.in?.[0]?.coins?.[0]?.asset || '',
			toAsset: action.out?.[0]?.coins?.[0]?.asset || '',
			fromAmount: action.in?.[0]?.coins?.[0]?.amount || '0',
			toAmount: action.out?.[0]?.coins?.[0]?.amount || '0',
			fromAddress: action.in?.[0]?.address || '',
			toAddress: action.out?.[0]?.address || '',
			valueUSD: action.metadata?.swap?.netOutputValueUSD || '0',
			slip: action.metadata?.swap?.swapSlip || '0',
			pools: action.pools || [],
			status: action.status,
		},
	}));
}

async function pollLargeSwap(
	this: IPollFunctions,
	webhookData: IDataObject,
	now: number,
): Promise<INodeExecutionData[]> {
	const poolFilter = this.getNodeParameter('poolFilter', '') as string;
	const addressFilter = this.getNodeParameter('addressFilter', '') as string;
	const thresholdUsd = this.getNodeParameter('thresholdUsd', 100000) as number;

	const lastTimestamp = (webhookData.lastTimestamp as number) || now - 60;
	webhookData.lastTimestamp = now;

	const query: IDataObject = {
		type: 'swap',
		limit: '50',
	};
	if (poolFilter) query.pool = poolFilter;
	if (addressFilter) query.address = addressFilter;

	const response = await midgardApiRequest(this, 'GET', '/actions', undefined, query) as { actions: Action[] };
	const actions = response.actions || [];

	const largeSwaps = actions.filter((action: Action) => {
		const actionTime = parseInt(action.date, 10) / 1e9;
		if (actionTime <= lastTimestamp) return false;

		const valueUsd = parseInt(action.metadata?.swap?.netOutputValueUSD || '0', 10) / 100;
		return valueUsd >= thresholdUsd;
	});

	return largeSwaps.map((action: Action) => ({
		json: {
			event: 'largeSwapDetected',
			timestamp: parseInt(action.date, 10) / 1e9,
			txId: action.in?.[0]?.txID || '',
			fromAsset: action.in?.[0]?.coins?.[0]?.asset || '',
			toAsset: action.out?.[0]?.coins?.[0]?.asset || '',
			fromAmount: action.in?.[0]?.coins?.[0]?.amount || '0',
			toAmount: action.out?.[0]?.coins?.[0]?.amount || '0',
			fromAddress: action.in?.[0]?.address || '',
			toAddress: action.out?.[0]?.address || '',
			valueUSD: action.metadata?.swap?.netOutputValueUSD || '0',
			thresholdUSD: thresholdUsd,
			slip: action.metadata?.swap?.swapSlip || '0',
			pools: action.pools || [],
		},
	}));
}

async function pollPoolDepthChanged(
	this: IPollFunctions,
	webhookData: IDataObject,
	_now: number,
): Promise<INodeExecutionData[]> {
	const poolFilter = this.getNodeParameter('poolFilter', '') as string;
	const depthChangeThreshold = this.getNodeParameter('depthChangeThreshold', 5) as number;

	// Get current pool depths
	const query: IDataObject = { status: 'available' };
	let pools = await midgardApiRequest(this, 'GET', '/pools', undefined, query) as Pool[];

	if (poolFilter) {
		pools = pools.filter((p: Pool) => p.asset === poolFilter);
	}

	const previousDepths = (webhookData.poolDepths as Record<string, string>) || {};
	const currentDepths: Record<string, string> = {};
	const alerts: INodeExecutionData[] = [];

	for (const pool of pools) {
		const asset = pool.asset;
		const currentDepth = pool.assetDepth;
		currentDepths[asset] = currentDepth;

		if (previousDepths[asset]) {
			const prevDepth = BigInt(previousDepths[asset]);
			const currDepth = BigInt(currentDepth);

			if (prevDepth > 0n) {
				const change = Number((currDepth - prevDepth) * 10000n / prevDepth) / 100;
				const absChange = Math.abs(change);

				if (absChange >= depthChangeThreshold) {
					alerts.push({
						json: {
							event: 'poolDepthChanged',
							asset,
							previousDepth: previousDepths[asset],
							currentDepth,
							changePercent: change,
							threshold: depthChangeThreshold,
							direction: change > 0 ? 'increase' : 'decrease',
							runeDepth: pool.runeDepth,
							volume24h: pool.volume24h,
							poolAPY: pool.poolAPY,
						},
					});
				}
			}
		}
	}

	webhookData.poolDepths = currentDepths;
	return alerts;
}

async function pollLPActivity(
	this: IPollFunctions,
	webhookData: IDataObject,
	now: number,
): Promise<INodeExecutionData[]> {
	const poolFilter = this.getNodeParameter('poolFilter', '') as string;
	const addressFilter = this.getNodeParameter('addressFilter', '') as string;

	const lastTimestamp = (webhookData.lastTimestamp as number) || now - 60;
	webhookData.lastTimestamp = now;

	const query: IDataObject = {
		limit: '50',
	};
	if (poolFilter) query.pool = poolFilter;
	if (addressFilter) query.address = addressFilter;

	// Get both add and withdraw actions
	const [addResponse, withdrawResponse] = await Promise.all([
		midgardApiRequest(this, 'GET', '/actions', undefined, { ...query, type: 'addLiquidity' }) as Promise<{ actions: Action[] }>,
		midgardApiRequest(this, 'GET', '/actions', undefined, { ...query, type: 'withdraw' }) as Promise<{ actions: Action[] }>,
	]);

	const allActions = [...(addResponse.actions || []), ...(withdrawResponse.actions || [])];

	const newActions = allActions.filter((action: Action) => {
		const actionTime = parseInt(action.date, 10) / 1e9;
		return actionTime > lastTimestamp;
	});

	return newActions.map((action: Action) => ({
		json: {
			event: 'lpActivity',
			type: action.type,
			timestamp: parseInt(action.date, 10) / 1e9,
			txId: action.in?.[0]?.txID || '',
			pools: action.pools || [],
			address: action.in?.[0]?.address || '',
			coins: action.in?.[0]?.coins || [],
			runeAmount: action.metadata?.addLiquidity?.liquidityUnits ||
				action.metadata?.withdraw?.liquidityUnits || '0',
			status: action.status,
		},
	}));
}

async function pollSaverActivity(
	this: IPollFunctions,
	webhookData: IDataObject,
	now: number,
): Promise<INodeExecutionData[]> {
	const saverAsset = this.getNodeParameter('saverAsset', '') as string;
	const addressFilter = this.getNodeParameter('addressFilter', '') as string;

	const lastTimestamp = (webhookData.lastTimestamp as number) || now - 60;
	webhookData.lastTimestamp = now;

	const query: IDataObject = {
		limit: '50',
	};
	if (addressFilter) query.address = addressFilter;

	// Query for saver add/withdraw which show up as specific action types
	const response = await midgardApiRequest(this, 'GET', '/actions', undefined, query) as { actions: Action[] };

	const saverActions = (response.actions || []).filter((action: Action) => {
		const actionTime = parseInt(action.date, 10) / 1e9;
		if (actionTime <= lastTimestamp) return false;

		// Check if this is a saver action (identified by synth asset or saver memo)
		const isSaver = action.pools?.some((p: string) => p.includes('/')) ||
			action.in?.[0]?.coins?.some((c: { asset: string }) => c.asset.includes('/'));

		if (!isSaver) return false;

		if (saverAsset) {
			return action.pools?.includes(saverAsset) ||
				action.in?.[0]?.coins?.some((c: { asset: string }) => c.asset.includes(saverAsset));
		}

		return true;
	});

	return saverActions.map((action: Action) => ({
		json: {
			event: 'saverActivity',
			type: action.type,
			timestamp: parseInt(action.date, 10) / 1e9,
			txId: action.in?.[0]?.txID || '',
			asset: action.pools?.[0] || '',
			address: action.in?.[0]?.address || '',
			amount: action.in?.[0]?.coins?.[0]?.amount || '0',
			status: action.status,
		},
	}));
}

async function pollNodeChurned(
	this: IPollFunctions,
	webhookData: IDataObject,
	_now: number,
): Promise<INodeExecutionData[]> {
	// Get current node list
	const nodes = await thornodeApiRequest(this, 'GET', '/nodes') as ThorNode[];

	const previousActiveNodes = (webhookData.activeNodes as string[]) || [];
	const currentActiveNodes = nodes
		.filter((n: ThorNode) => n.status === 'Active')
		.map((n: ThorNode) => n.node_address);

	webhookData.activeNodes = currentActiveNodes;

	// Find nodes that joined or left
	const joined = currentActiveNodes.filter((n: string) => !previousActiveNodes.includes(n));
	const left = previousActiveNodes.filter((n: string) => !currentActiveNodes.includes(n));

	if (joined.length === 0 && left.length === 0) {
		return [];
	}

	const events: INodeExecutionData[] = [];

	for (const nodeAddress of joined) {
		const nodeInfo = nodes.find((n: ThorNode) => n.node_address === nodeAddress);
		events.push({
			json: {
				event: 'nodeChurned',
				action: 'joined',
				nodeAddress,
				bond: nodeInfo?.total_bond || '0',
				version: nodeInfo?.version || '',
				ip: nodeInfo?.ip_address || '',
				activeCount: currentActiveNodes.length,
			},
		});
	}

	for (const nodeAddress of left) {
		events.push({
			json: {
				event: 'nodeChurned',
				action: 'left',
				nodeAddress,
				activeCount: currentActiveNodes.length,
			},
		});
	}

	return events;
}

async function pollNetworkHaltResume(
	this: IPollFunctions,
	webhookData: IDataObject,
	_now: number,
): Promise<INodeExecutionData[]> {
	const chainFilter = this.getNodeParameter('chainFilter', '') as string;

	// Get inbound addresses to check chain status
	const inbounds = await thornodeApiRequest(this, 'GET', '/inbound_addresses') as InboundAddress[];

	const previousStatus = (webhookData.chainStatus as Record<string, boolean>) || {};
	const currentStatus: Record<string, boolean> = {};
	const events: INodeExecutionData[] = [];

	for (const inbound of inbounds) {
		const chain = inbound.chain;
		const isHalted = inbound.halted;
		currentStatus[chain] = isHalted;

		if (chainFilter && chain !== chainFilter) continue;

		if (previousStatus[chain] !== undefined && previousStatus[chain] !== isHalted) {
			events.push({
				json: {
					event: 'networkHaltResume',
					chain,
					status: isHalted ? 'halted' : 'resumed',
					previousStatus: previousStatus[chain] ? 'halted' : 'active',
					address: inbound.address,
					gasRate: inbound.gas_rate,
					gasRateUnits: inbound.gas_rate_units,
				},
			});
		}
	}

	webhookData.chainStatus = currentStatus;
	return events;
}

async function pollPriceDeviation(
	this: IPollFunctions,
	webhookData: IDataObject,
	_now: number,
): Promise<INodeExecutionData[]> {
	const priceAsset = this.getNodeParameter('priceAsset', 'BTC.BTC') as string;
	const deviationThreshold = this.getNodeParameter('deviationThreshold', 2) as number;

	// Get current pool price
	const pool = await midgardApiRequest(
		this,
		'GET',
		`/pool/${encodeURIComponent(priceAsset)}`,
	) as Pool;

	const currentPrice = parseFloat(pool.assetPriceUSD || '0');
	const previousPrice = (webhookData[`price_${priceAsset}`] as number) || currentPrice;

	webhookData[`price_${priceAsset}`] = currentPrice;

	if (previousPrice === 0) {
		return [];
	}

	const deviation = ((currentPrice - previousPrice) / previousPrice) * 100;
	const absDeviation = Math.abs(deviation);

	if (absDeviation >= deviationThreshold) {
		return [{
			json: {
				event: 'priceDeviation',
				asset: priceAsset,
				previousPrice,
				currentPrice,
				deviationPercent: deviation,
				threshold: deviationThreshold,
				direction: deviation > 0 ? 'up' : 'down',
				assetDepth: pool.assetDepth,
				runeDepth: pool.runeDepth,
				volume24h: pool.volume24h,
			},
		}];
	}

	return [];
}
