/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { midgardApiRequest, thornodeApiRequest } from '../../transport/apiClient';
import type { Pool, NetworkInfo } from '../../constants/types';

export async function getRUNEPrice(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const statsResponse = (await midgardApiRequest(
    this,
    'GET',
    '/stats',
  )) as IDataObject;

  const networkResponse = (await midgardApiRequest(
    this,
    'GET',
    '/network',
  )) as NetworkInfo;

  return [
    {
      json: {
        priceUSD: statsResponse.runePriceUSD,
        runeDepth: statsResponse.runeDepth,
        runePriceInTor: networkResponse.rune_price_in_tor,
        torPriceInRune: networkResponse.tor_price_in_rune,
      },
    },
  ];
}

export async function getRUNESupply(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const statsResponse = (await midgardApiRequest(
    this,
    'GET',
    '/stats',
  )) as IDataObject;

  const networkResponse = (await midgardApiRequest(
    this,
    'GET',
    '/network',
  )) as NetworkInfo;

  const supplyResponse = await thornodeApiRequest(
    this,
    'GET',
    '/cosmos/bank/v1beta1/supply',
  ).catch(() => null) as IDataObject | null;

  let totalSupply = '0';
  let runeSupplyFromBank = '0';

  if (supplyResponse && Array.isArray(supplyResponse.supply)) {
    const runeEntry = (supplyResponse.supply as IDataObject[]).find(
      (s) => s.denom === 'rune',
    );
    if (runeEntry) {
      runeSupplyFromBank = runeEntry.amount as string;
    }
  }

  totalSupply = runeSupplyFromBank || (statsResponse.runeDepth as string) || '0';

  return [
    {
      json: {
        totalSupply,
        runeDepthInPools: statsResponse.runeDepth,
        totalReserve: networkResponse.total_reserve,
        totalBondUnits: networkResponse.total_bond_units,
        effectiveSecurityBond: networkResponse.effective_security_bond,
        priceUSD: statsResponse.runePriceUSD,
      },
    },
  ];
}

export async function getRUNEPools(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const poolsResponse = (await midgardApiRequest(
    this,
    'GET',
    '/pools',
  )) as Pool[];

  const poolsWithRune = poolsResponse.map((pool) => ({
    asset: pool.asset,
    runeDepth: pool.runeDepth,
    assetDepth: pool.assetDepth,
    status: pool.status,
    poolAPY: pool.poolAPY,
    volume24h: pool.volume24h,
  }));

  const totalRuneInPools = poolsWithRune.reduce((acc, p) => {
    return acc + BigInt(p.runeDepth || '0');
  }, 0n);

  return [
    {
      json: {
        totalRuneInPools: totalRuneInPools.toString(),
        poolCount: poolsWithRune.length,
        pools: poolsWithRune,
      },
    },
  ];
}

export async function getRUNEVolume(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const interval = this.getNodeParameter('interval', index, 'day') as string;
  const count = this.getNodeParameter('count', index, 30) as number;

  const swapHistoryResponse = (await midgardApiRequest(
    this,
    'GET',
    '/history/swaps',
    undefined,
    { interval, count: count.toString() },
  )) as { intervals: IDataObject[]; meta: IDataObject };

  const intervals = swapHistoryResponse.intervals || [];

  const formattedIntervals = intervals.map((i) => ({
    startTime: i.startTime,
    endTime: i.endTime,
    toRuneVolume: i.toRuneVolume,
    toAssetVolume: i.toAssetVolume,
    totalVolume: i.totalVolume,
    toRuneCount: i.toRuneCount,
    toAssetCount: i.toAssetCount,
    totalCount: i.totalCount,
    runePriceUSD: i.runePriceUSD,
  }));

  return [
    {
      json: {
        meta: swapHistoryResponse.meta,
        intervals: formattedIntervals,
        totalIntervals: formattedIntervals.length,
      },
    },
  ];
}

export async function getRUNEHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const interval = this.getNodeParameter('interval', index, 'day') as string;
  const count = this.getNodeParameter('count', index, 30) as number;
  const from = this.getNodeParameter('from', index, '') as string;
  const to = this.getNodeParameter('to', index, '') as string;

  const query: IDataObject = {
    interval,
    count: count.toString(),
  };

  if (from) query.from = from;
  if (to) query.to = to;

  const runePoolResponse = (await midgardApiRequest(
    this,
    'GET',
    '/history/runepool',
    undefined,
    query,
  )) as { intervals: IDataObject[]; meta: IDataObject };

  return [
    {
      json: {
        meta: runePoolResponse.meta,
        intervals: runePoolResponse.intervals,
      },
    },
  ];
}
