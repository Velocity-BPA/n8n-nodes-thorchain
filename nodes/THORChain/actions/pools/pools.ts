/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { midgardApiRequest } from '../../transport/apiClient';
import type { Pool, PoolStats } from '../../constants/types';

export async function getPoolInfo(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;
  const period = this.getNodeParameter('period', index, '24h') as string;

  const response = (await midgardApiRequest(
    this,
    'GET',
    `/pool/${encodeURIComponent(asset)}`,
    undefined,
    { period },
  )) as Pool;

  return [{ json: response }];
}

export async function listPools(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const status = this.getNodeParameter('status', index, '') as string;
  const period = this.getNodeParameter('period', index, '24h') as string;

  const query: IDataObject = { period };
  if (status) {
    query.status = status;
  }

  const response = (await midgardApiRequest(this, 'GET', '/pools', undefined, query)) as Pool[];

  return response.map((pool) => ({ json: pool }));
}

export async function getPoolDepth(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;
  const interval = this.getNodeParameter('interval', index, 'day') as string;
  const count = this.getNodeParameter('count', index, 30) as number;

  const response = await midgardApiRequest(
    this,
    'GET',
    `/history/depths/${encodeURIComponent(asset)}`,
    undefined,
    { interval, count: count.toString() },
  );

  return [{ json: response as IDataObject }];
}

export async function getPoolVolume(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;
  const interval = this.getNodeParameter('interval', index, 'day') as string;
  const count = this.getNodeParameter('count', index, 30) as number;

  const response = await midgardApiRequest(
    this,
    'GET',
    `/history/swaps`,
    undefined,
    {
      pool: asset,
      interval,
      count: count.toString(),
    },
  );

  return [{ json: response as IDataObject }];
}

export async function getPoolAPY(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;

  const response = (await midgardApiRequest(
    this,
    'GET',
    `/pool/${encodeURIComponent(asset)}/stats`,
  )) as PoolStats;

  return [
    {
      json: {
        asset,
        poolAPY: response.poolAPY,
        assetPrice: response.assetPrice,
        assetPriceUSD: response.assetPriceUSD,
        volume24h: response.volume24h,
      },
    },
  ];
}

export async function getPoolStats(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;
  const period = this.getNodeParameter('period', index, '24h') as string;

  const response = (await midgardApiRequest(
    this,
    'GET',
    `/pool/${encodeURIComponent(asset)}/stats`,
    undefined,
    { period },
  )) as PoolStats;

  return [{ json: response }];
}

export async function getPoolHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;
  const interval = this.getNodeParameter('interval', index, 'day') as string;
  const count = this.getNodeParameter('count', index, 30) as number;
  const from = this.getNodeParameter('from', index, '') as string;
  const to = this.getNodeParameter('to', index, '') as string;

  const query: IDataObject = {
    pool: asset,
    interval,
    count: count.toString(),
  };

  if (from) query.from = from;
  if (to) query.to = to;

  const response = await midgardApiRequest(this, 'GET', '/history/depths/' + encodeURIComponent(asset), undefined, query);

  return [{ json: response as IDataObject }];
}
