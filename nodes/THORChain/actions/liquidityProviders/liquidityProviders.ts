/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { midgardApiRequest, thornodeApiRequest, toBaseUnits } from '../../transport/apiClient';
import type { LiquidityProvider, MemberPool } from '../../constants/types';

export async function getLPPosition(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;
  const address = this.getNodeParameter('address', index) as string;

  const response = (await thornodeApiRequest(
    this,
    'GET',
    `/pool/${encodeURIComponent(asset)}/liquidity_provider/${address}`,
  )) as LiquidityProvider;

  return [{ json: response }];
}

export async function getLPByAddress(
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

export async function listPoolLPs(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;

  const response = (await thornodeApiRequest(
    this,
    'GET',
    `/pool/${encodeURIComponent(asset)}/liquidity_providers`,
  )) as LiquidityProvider[];

  return response.map((lp) => ({ json: lp }));
}

export async function getLPHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index) as string;
  const pool = this.getNodeParameter('pool', index, '') as string;
  const limit = this.getNodeParameter('limit', index, 50) as number;
  const offset = this.getNodeParameter('offset', index, 0) as number;

  const query: IDataObject = {
    address,
    type: 'addLiquidity,withdraw',
    limit: limit.toString(),
    offset: offset.toString(),
  };

  if (pool) {
    query.asset = pool;
  }

  const response = (await midgardApiRequest(
    this,
    'GET',
    '/actions',
    undefined,
    query,
  )) as { actions: IDataObject[] };

  return (response.actions || []).map((action) => ({ json: action }));
}

export async function getLPEarnings(
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

  const earnings = pools.map((pool) => {
    const assetDeposit = BigInt(pool.assetDeposit || '0');
    const runeDeposit = BigInt(pool.runeDeposit || '0');
    const assetWithdrawn = BigInt(pool.assetWithdrawn || '0');
    const runeWithdrawn = BigInt(pool.runeWithdrawn || '0');

    return {
      pool: pool.asset,
      liquidityUnits: pool.liquidityUnits,
      assetDeposit: pool.assetDeposit,
      runeDeposit: pool.runeDeposit,
      assetWithdrawn: pool.assetWithdrawn,
      runeWithdrawn: pool.runeWithdrawn,
      netAsset: (assetWithdrawn - assetDeposit).toString(),
      netRune: (runeWithdrawn - runeDeposit).toString(),
      dateFirstAdded: pool.dateFirstAdded,
      dateLastAdded: pool.dateLastAdded,
    };
  });

  return earnings.map((e) => ({ json: e }));
}

export async function getAddLiquidityQuote(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;
  const assetAmount = this.getNodeParameter('assetAmount', index, '0') as string;
  const runeAmount = this.getNodeParameter('runeAmount', index, '0') as string;

  const query: IDataObject = {
    asset,
  };

  if (assetAmount && assetAmount !== '0') {
    query.asset_amount = toBaseUnits(assetAmount);
  }

  if (runeAmount && runeAmount !== '0') {
    query.rune_amount = toBaseUnits(runeAmount);
  }

  const response = await thornodeApiRequest(
    this,
    'GET',
    '/quote/deposit',
    undefined,
    query,
  );

  return [{ json: response as IDataObject }];
}

export async function getWithdrawQuote(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;
  const address = this.getNodeParameter('address', index) as string;
  const basisPoints = this.getNodeParameter('basisPoints', index, 10000) as number;
  const withdrawAsset = this.getNodeParameter('withdrawAsset', index, '') as string;

  const query: IDataObject = {
    asset,
    address,
    withdraw_bps: basisPoints.toString(),
  };

  if (withdrawAsset) {
    query.withdraw_asset = withdrawAsset;
  }

  const response = await thornodeApiRequest(
    this,
    'GET',
    '/quote/withdraw',
    undefined,
    query,
  );

  return [{ json: response as IDataObject }];
}
