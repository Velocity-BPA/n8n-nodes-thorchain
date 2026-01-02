/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { midgardApiRequest } from '../../transport/apiClient';
import type { HistoryStats, TVLHistory, EarningsHistory } from '../../constants/types';

export async function getProtocolStats(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = (await midgardApiRequest(
    this,
    'GET',
    '/stats',
  )) as IDataObject;

  return [{ json: response }];
}

export async function getTVL(
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

  const response = (await midgardApiRequest(
    this,
    'GET',
    '/history/tvl',
    undefined,
    query,
  )) as { intervals: TVLHistory[]; meta: IDataObject };

  return [{ json: response }];
}

export async function getVolumeHistory(
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

  const response = (await midgardApiRequest(
    this,
    'GET',
    '/history/swaps',
    undefined,
    query,
  )) as { intervals: HistoryStats[]; meta: IDataObject };

  return [{ json: response }];
}

export async function getEarningsHistory(
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

  const response = (await midgardApiRequest(
    this,
    'GET',
    '/history/earnings',
    undefined,
    query,
  )) as { intervals: EarningsHistory[]; meta: IDataObject };

  return [{ json: response }];
}

export async function getSwapHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const interval = this.getNodeParameter('interval', index, 'day') as string;
  const count = this.getNodeParameter('count', index, 30) as number;
  const pool = this.getNodeParameter('pool', index, '') as string;
  const from = this.getNodeParameter('from', index, '') as string;
  const to = this.getNodeParameter('to', index, '') as string;

  const query: IDataObject = {
    interval,
    count: count.toString(),
  };

  if (pool) query.pool = pool;
  if (from) query.from = from;
  if (to) query.to = to;

  const response = (await midgardApiRequest(
    this,
    'GET',
    '/history/swaps',
    undefined,
    query,
  )) as { intervals: HistoryStats[]; meta: IDataObject };

  return [{ json: response }];
}

export async function getDepthHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const pool = this.getNodeParameter('pool', index) as string;
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

  const response = (await midgardApiRequest(
    this,
    'GET',
    `/history/depths/${encodeURIComponent(pool)}`,
    undefined,
    query,
  )) as { intervals: IDataObject[]; meta: IDataObject };

  return [{ json: response }];
}

export async function getLiquidityHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const pool = this.getNodeParameter('pool', index, '') as string;
  const interval = this.getNodeParameter('interval', index, 'day') as string;
  const count = this.getNodeParameter('count', index, 30) as number;
  const from = this.getNodeParameter('from', index, '') as string;
  const to = this.getNodeParameter('to', index, '') as string;

  const query: IDataObject = {
    interval,
    count: count.toString(),
  };

  if (pool) query.pool = pool;
  if (from) query.from = from;
  if (to) query.to = to;

  const response = (await midgardApiRequest(
    this,
    'GET',
    '/history/liquidity_changes',
    undefined,
    query,
  )) as { intervals: IDataObject[]; meta: IDataObject };

  return [{ json: response }];
}

export async function getSaversHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const pool = this.getNodeParameter('pool', index) as string;
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

  const response = (await midgardApiRequest(
    this,
    'GET',
    `/history/savers/${encodeURIComponent(pool)}`,
    undefined,
    query,
  )) as { intervals: IDataObject[]; meta: IDataObject };

  return [{ json: response }];
}
