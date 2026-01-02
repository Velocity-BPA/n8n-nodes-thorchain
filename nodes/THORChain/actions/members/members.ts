/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { midgardApiRequest } from '../../transport/apiClient';
import type { Member, MemberPool, Action } from '../../constants/types';

export async function getMemberInfo(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index) as string;

  const response = (await midgardApiRequest(
    this,
    'GET',
    `/member/${address}`,
  )) as Member & { pools: MemberPool[] };

  return [{ json: response }];
}

export async function getMemberPools(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index) as string;

  const response = (await midgardApiRequest(
    this,
    'GET',
    `/member/${address}`,
  )) as { pools: MemberPool[] };

  return (response.pools || []).map((pool) => ({ json: pool }));
}

export async function getMemberHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index) as string;
  const limit = this.getNodeParameter('limit', index, 50) as number;
  const offset = this.getNodeParameter('offset', index, 0) as number;
  const actionType = this.getNodeParameter('actionType', index, '') as string;

  const query: IDataObject = {
    address,
    limit: limit.toString(),
    offset: offset.toString(),
  };

  if (actionType) {
    query.type = actionType;
  }

  const response = (await midgardApiRequest(
    this,
    'GET',
    '/actions',
    undefined,
    query,
  )) as { actions: Action[]; count: string };

  const items = (response.actions || []).map((action) => ({ json: action as unknown as IDataObject }));

  if (items.length > 0) {
    (items[0].json as IDataObject).totalCount = parseInt(response.count, 10);
  }

  return items;
}

export async function getMemberSummary(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index) as string;

  const memberResponse = (await midgardApiRequest(
    this,
    'GET',
    `/member/${address}`,
  )) as { pools: MemberPool[] };

  const pools = memberResponse.pools || [];

  let totalAssetDeposit = 0n;
  let totalRuneDeposit = 0n;
  let totalLiquidityUnits = 0n;

  pools.forEach((pool) => {
    totalAssetDeposit += BigInt(pool.assetDeposit || '0');
    totalRuneDeposit += BigInt(pool.runeDeposit || '0');
    totalLiquidityUnits += BigInt(pool.liquidityUnits || '0');
  });

  const oldestDate = pools.reduce((oldest, pool) => {
    const date = pool.dateFirstAdded;
    if (!oldest || (date && date < oldest)) return date;
    return oldest;
  }, '');

  const newestDate = pools.reduce((newest, pool) => {
    const date = pool.dateLastAdded;
    if (!newest || (date && date > newest)) return date;
    return newest;
  }, '');

  return [
    {
      json: {
        address,
        poolCount: pools.length,
        pools: pools.map((p) => p.asset),
        totalAssetDeposit: totalAssetDeposit.toString(),
        totalRuneDeposit: totalRuneDeposit.toString(),
        totalLiquidityUnits: totalLiquidityUnits.toString(),
        firstActivity: oldestDate,
        lastActivity: newestDate,
      },
    },
  ];
}

export async function getMemberValue(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index) as string;

  const memberResponse = (await midgardApiRequest(
    this,
    'GET',
    `/member/${address}`,
  )) as { pools: MemberPool[] };

  const pools = memberResponse.pools || [];

  const poolValues = await Promise.all(
    pools.map(async (pool) => {
      try {
        const poolInfo = (await midgardApiRequest(
          this,
          'GET',
          `/pool/${encodeURIComponent(pool.asset)}`,
        )) as IDataObject;

        const assetPriceUSD = parseFloat(poolInfo.assetPriceUSD as string || '0');
        const assetDeposit = parseFloat(pool.assetDeposit || '0') / 1e8;
        const runeDeposit = parseFloat(pool.runeDeposit || '0') / 1e8;

        const statsResponse = (await midgardApiRequest(
          this,
          'GET',
          '/stats',
        )) as IDataObject;
        const runePriceUSD = parseFloat(statsResponse.runePriceUSD as string || '0');

        const assetValueUSD = assetDeposit * assetPriceUSD;
        const runeValueUSD = runeDeposit * runePriceUSD;

        return {
          pool: pool.asset,
          liquidityUnits: pool.liquidityUnits,
          assetDeposit: pool.assetDeposit,
          runeDeposit: pool.runeDeposit,
          assetValueUSD: assetValueUSD.toFixed(2),
          runeValueUSD: runeValueUSD.toFixed(2),
          totalValueUSD: (assetValueUSD + runeValueUSD).toFixed(2),
        };
      } catch {
        return {
          pool: pool.asset,
          liquidityUnits: pool.liquidityUnits,
          assetDeposit: pool.assetDeposit,
          runeDeposit: pool.runeDeposit,
          error: 'Failed to fetch pool data',
        };
      }
    }),
  );

  const totalUSD = poolValues.reduce((sum, pv) => {
    const val = parseFloat(pv.totalValueUSD || '0');
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return [
    {
      json: {
        address,
        totalValueUSD: totalUSD.toFixed(2),
        pools: poolValues,
      },
    },
  ];
}
