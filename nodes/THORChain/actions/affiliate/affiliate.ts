/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { midgardApiRequest, thornodeApiRequest } from '../../transport/apiClient';
import type { Action } from '../../constants/types';

export async function getAffiliateInfo(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index) as string;

  const actionsResponse = (await midgardApiRequest(
    this,
    'GET',
    '/actions',
    undefined,
    {
      affiliate: address,
      limit: '100',
    },
  )) as { actions: Action[]; count: string };

  const actions = actionsResponse.actions || [];
  let totalFees = 0n;
  const assetBreakdown: Record<string, bigint> = {};

  actions.forEach((action) => {
    if (action.metadata?.swap?.affiliateFee) {
      const fee = BigInt(action.metadata.swap.affiliateFee);
      totalFees += fee;

      const asset = action.pools?.[0] || 'UNKNOWN';
      if (!assetBreakdown[asset]) {
        assetBreakdown[asset] = 0n;
      }
      assetBreakdown[asset] += fee;
    }
  });

  return [
    {
      json: {
        address,
        totalTransactions: actionsResponse.count,
        transactionsInSample: actions.length,
        totalFeesEarned: totalFees.toString(),
        feesByPool: Object.fromEntries(
          Object.entries(assetBreakdown).map(([k, v]) => [k, v.toString()]),
        ),
      },
    },
  ];
}

export async function getAffiliateEarnings(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index) as string;
  const limit = this.getNodeParameter('limit', index, 100) as number;
  const offset = this.getNodeParameter('offset', index, 0) as number;

  const actionsResponse = (await midgardApiRequest(
    this,
    'GET',
    '/actions',
    undefined,
    {
      affiliate: address,
      limit: limit.toString(),
      offset: offset.toString(),
    },
  )) as { actions: Action[]; count: string };

  const earnings = (actionsResponse.actions || [])
    .filter((action) => action.metadata?.swap?.affiliateFee)
    .map((action) => ({
      date: action.date,
      height: action.height,
      type: action.type,
      pools: action.pools,
      affiliateFee: action.metadata?.swap?.affiliateFee,
      txIn: action.in?.[0]?.txID,
      txOut: action.out?.[0]?.txID,
    }));

  return [
    {
      json: {
        address,
        totalCount: actionsResponse.count,
        earnings,
      },
    },
  ];
}

export async function registerAffiliate(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const thorAddress = this.getNodeParameter('thorAddress', index) as string;
  const affiliateName = this.getNodeParameter('affiliateName', index, '') as string;
  const defaultFeeBps = this.getNodeParameter('defaultFeeBps', index, 30) as number;

  const memo = affiliateName
    ? `name:${affiliateName}:${thorAddress}`
    : thorAddress;

  const inboundAddresses = (await thornodeApiRequest(
    this,
    'GET',
    '/inbound_addresses',
  )) as IDataObject[];

  const thorchainInbound = inboundAddresses.find(
    (addr) => (addr.chain as string) === 'THOR',
  );

  return [
    {
      json: {
        affiliateAddress: thorAddress,
        affiliateName: affiliateName || null,
        suggestedFeeBps: defaultFeeBps,
        registrationMemo: memo,
        thorchainInbound: thorchainInbound?.address || null,
        notes: [
          'Use your THORChain address as affiliate in swap memos',
          'Fee basis points (bps) are specified per transaction (1 bps = 0.01%)',
          'Maximum affiliate fee is typically 1000 bps (10%)',
          'Fees are taken from the output amount and sent to your address',
        ],
      },
    },
  ];
}

export async function getAffiliateSwaps(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index) as string;
  const limit = this.getNodeParameter('limit', index, 50) as number;
  const offset = this.getNodeParameter('offset', index, 0) as number;

  const actionsResponse = (await midgardApiRequest(
    this,
    'GET',
    '/actions',
    undefined,
    {
      affiliate: address,
      type: 'swap',
      limit: limit.toString(),
      offset: offset.toString(),
    },
  )) as { actions: Action[]; count: string };

  return (actionsResponse.actions || []).map((action) => ({
    json: {
      date: action.date,
      height: action.height,
      status: action.status,
      pools: action.pools,
      inTx: action.in?.[0],
      outTx: action.out?.[0],
      affiliateFee: action.metadata?.swap?.affiliateFee,
      liquidityFee: action.metadata?.swap?.liquidityFee,
      swapSlip: action.metadata?.swap?.swapSlip,
    },
  }));
}

export async function getAffiliateStats(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index) as string;

  const recentResponse = (await midgardApiRequest(
    this,
    'GET',
    '/actions',
    undefined,
    {
      affiliate: address,
      limit: '1000',
    },
  )) as { actions: Action[]; count: string };

  const actions = recentResponse.actions || [];

  const last24h = Date.now() - 24 * 60 * 60 * 1000;
  const last7d = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last30d = Date.now() - 30 * 24 * 60 * 60 * 1000;

  let fees24h = 0n;
  let fees7d = 0n;
  let fees30d = 0n;
  let count24h = 0;
  let count7d = 0;
  let count30d = 0;

  actions.forEach((action) => {
    const timestamp = parseInt(action.date, 10) * 1000000;
    const fee = BigInt(action.metadata?.swap?.affiliateFee || '0');

    if (timestamp >= last24h * 1000) {
      fees24h += fee;
      count24h++;
    }
    if (timestamp >= last7d * 1000) {
      fees7d += fee;
      count7d++;
    }
    if (timestamp >= last30d * 1000) {
      fees30d += fee;
      count30d++;
    }
  });

  return [
    {
      json: {
        address,
        totalSwaps: recentResponse.count,
        last24h: {
          swapCount: count24h,
          feesEarned: fees24h.toString(),
        },
        last7d: {
          swapCount: count7d,
          feesEarned: fees7d.toString(),
        },
        last30d: {
          swapCount: count30d,
          feesEarned: fees30d.toString(),
        },
      },
    },
  ];
}
