/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { thornodeApiRequest, midgardApiRequest } from '../../transport/apiClient';
import type { TradeAsset, Pool } from '../../constants/types';

export async function getTradeAssetInfo(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;

  const tradeUnitsResponse = (await thornodeApiRequest(
    this,
    'GET',
    `/trade/unit/${encodeURIComponent(asset)}`,
  )) as TradeAsset;

  const poolResponse = (await midgardApiRequest(
    this,
    'GET',
    `/pool/${encodeURIComponent(asset)}`,
  )) as Pool;

  return [
    {
      json: {
        asset,
        tradeUnits: tradeUnitsResponse?.units || '0',
        tradeDepth: tradeUnitsResponse?.depth || '0',
        poolSynthSupply: poolResponse?.synthSupply || '0',
        poolSynthUnits: poolResponse?.synthUnits || '0',
        assetDepth: poolResponse?.assetDepth || '0',
        runeDepth: poolResponse?.runeDepth || '0',
        poolStatus: poolResponse?.status,
      },
    },
  ];
}

export async function listTradeAssets(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const tradeUnitsResponse = (await thornodeApiRequest(
    this,
    'GET',
    '/trade/units',
  )) as TradeAsset[];

  const poolsResponse = (await midgardApiRequest(
    this,
    'GET',
    '/pools',
  )) as Pool[];

  const tradeAssets = (tradeUnitsResponse || []).map((ta) => {
    const pool = poolsResponse.find((p) => p.asset === ta.asset);
    return {
      asset: ta.asset,
      tradeUnits: ta.units,
      tradeDepth: ta.depth,
      synthSupply: pool?.synthSupply || '0',
      synthUnits: pool?.synthUnits || '0',
      poolStatus: pool?.status || 'unknown',
    };
  });

  return tradeAssets.map((ta) => ({ json: ta }));
}

export async function getTradeAssetHolders(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;

  const response = (await thornodeApiRequest(
    this,
    'GET',
    `/trade/accounts/${encodeURIComponent(asset)}`,
  )) as IDataObject[];

  return (response || []).map((holder) => ({
    json: {
      asset,
      ...holder,
    },
  }));
}

export async function getTradeAccountBalance(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index) as string;
  const asset = this.getNodeParameter('asset', index, '') as string;

  let endpoint = `/trade/account/${address}`;
  if (asset) {
    endpoint = `/trade/account/${address}/${encodeURIComponent(asset)}`;
  }

  const response = (await thornodeApiRequest(
    this,
    'GET',
    endpoint,
  )) as IDataObject | IDataObject[];

  if (Array.isArray(response)) {
    return response.map((balance) => ({ json: balance }));
  }

  return [{ json: response }];
}

export async function getTradeAssetQuote(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const fromAsset = this.getNodeParameter('fromAsset', index) as string;
  const toAsset = this.getNodeParameter('toAsset', index) as string;
  const amount = this.getNodeParameter('amount', index) as string;
  const destination = this.getNodeParameter('destination', index) as string;
  const action = this.getNodeParameter('action', index) as string;

  const amountInBase = Math.floor(parseFloat(amount) * 1e8).toString();

  const endpoint = '/quote/swap';
  const query: IDataObject = {
    amount: amountInBase,
    destination,
  };

  if (action === 'deposit') {
    query.from_asset = fromAsset;
    query.to_asset = `${toAsset}~${toAsset}`;
  } else if (action === 'withdraw') {
    query.from_asset = `${fromAsset}~${fromAsset}`;
    query.to_asset = toAsset;
  } else {
    query.from_asset = fromAsset;
    query.to_asset = toAsset;
  }

  const response = await thornodeApiRequest(this, 'GET', endpoint, undefined, query);

  return [{ json: response as IDataObject }];
}

export async function getSynthStats(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const poolsResponse = (await midgardApiRequest(
    this,
    'GET',
    '/pools',
  )) as Pool[];

  const synthStats = poolsResponse
    .filter((pool) => BigInt(pool.synthSupply || '0') > 0n)
    .map((pool) => {
      const synthSupply = BigInt(pool.synthSupply || '0');
      const assetDepth = BigInt(pool.assetDepth || '0');
      const utilizationPercent =
        assetDepth > 0n
          ? ((Number(synthSupply) / Number(assetDepth)) * 100).toFixed(2)
          : '0';

      return {
        asset: pool.asset,
        synthSupply: pool.synthSupply,
        synthUnits: pool.synthUnits,
        assetDepth: pool.assetDepth,
        utilizationPercent,
        status: pool.status,
      };
    });

  const totalSynthValue = synthStats.reduce((acc, s) => acc + BigInt(s.synthSupply), 0n);

  return [
    {
      json: {
        totalSynthValue: totalSynthValue.toString(),
        poolCount: synthStats.length,
        pools: synthStats,
      },
    },
  ];
}
