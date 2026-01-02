/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { midgardApiRequest, thornodeApiRequest, toBaseUnits } from '../../transport/apiClient';
import type { Saver, SaverQuote, Pool } from '../../constants/types';

export async function getSaverPosition(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;
  const address = this.getNodeParameter('address', index) as string;

  const response = (await thornodeApiRequest(
    this,
    'GET',
    `/pool/${encodeURIComponent(asset)}/saver/${address}`,
  )) as Saver;

  return [{ json: response }];
}

export async function getSaverQuote(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;
  const action = this.getNodeParameter('action', index) as string;
  const amount = this.getNodeParameter('amount', index, '0') as string;
  const address = this.getNodeParameter('address', index, '') as string;
  const affiliateAddress = this.getNodeParameter('affiliateAddress', index, '') as string;
  const affiliateFee = this.getNodeParameter('affiliateFee', index, 0) as number;

  let endpoint = '/quote/saver/deposit';
  const query: IDataObject = {
    asset,
  };

  if (action === 'withdraw') {
    endpoint = '/quote/saver/withdraw';
    query.address = address;
    query.withdraw_bps = Math.floor(parseFloat(amount) * 100).toString();
  } else {
    query.amount = toBaseUnits(amount);
    if (affiliateAddress) {
      query.affiliate = affiliateAddress;
      query.affiliate_bps = affiliateFee.toString();
    }
  }

  const response = (await thornodeApiRequest(
    this,
    'GET',
    endpoint,
    undefined,
    query,
  )) as SaverQuote;

  return [{ json: response }];
}

export async function listSavers(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;

  const response = (await thornodeApiRequest(
    this,
    'GET',
    `/pool/${encodeURIComponent(asset)}/savers`,
  )) as Saver[];

  return response.map((saver) => ({ json: saver }));
}

export async function getSaverYield(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;

  const poolResponse = (await midgardApiRequest(
    this,
    'GET',
    `/pool/${encodeURIComponent(asset)}`,
  )) as Pool;

  const saversDepth = poolResponse.saversDepth || '0';
  const saversUnits = poolResponse.saversUnits || '0';

  const historicalResponse = (await midgardApiRequest(
    this,
    'GET',
    '/history/savers/' + encodeURIComponent(asset),
    undefined,
    { interval: 'day', count: '30' },
  )) as { intervals: IDataObject[] };

  const intervals = historicalResponse.intervals || [];
  let avgAPY = '0';

  if (intervals.length > 0) {
    const apyValues = intervals
      .map((i) => parseFloat(i.saversAPR as string || '0'))
      .filter((v) => !isNaN(v));

    if (apyValues.length > 0) {
      avgAPY = (apyValues.reduce((a, b) => a + b, 0) / apyValues.length).toFixed(4);
    }
  }

  return [
    {
      json: {
        asset,
        saversDepth,
        saversUnits,
        poolAPY: poolResponse.poolAPY,
        averageAPY30d: avgAPY,
        assetDepth: poolResponse.assetDepth,
        runeDepth: poolResponse.runeDepth,
      },
    },
  ];
}

export async function getSaverCaps(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;

  const poolResponse = (await midgardApiRequest(
    this,
    'GET',
    `/pool/${encodeURIComponent(asset)}`,
  )) as Pool;

  const saversResponse = (await thornodeApiRequest(
    this,
    'GET',
    '/pools',
  )) as Pool[];

  const poolData = saversResponse.find((p) => p.asset === asset);

  const saversDepth = BigInt(poolResponse.saversDepth || '0');
  const assetDepth = BigInt(poolResponse.assetDepth || '0');

  const maxSaversDepth = assetDepth;
  const available = maxSaversDepth > saversDepth ? (maxSaversDepth - saversDepth).toString() : '0';
  const utilization =
    maxSaversDepth > 0n
      ? ((Number(saversDepth) / Number(maxSaversDepth)) * 100).toFixed(2)
      : '0';

  return [
    {
      json: {
        asset,
        saversDepth: saversDepth.toString(),
        maxSaversDepth: maxSaversDepth.toString(),
        availableCapacity: available,
        utilizationPercent: utilization,
        saversUnits: poolResponse.saversUnits || '0',
        status: poolData?.status || poolResponse.status,
      },
    },
  ];
}
