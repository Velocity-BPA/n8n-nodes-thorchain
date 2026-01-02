/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { midgardApiRequest, thornodeApiRequest } from '../../transport/apiClient';
import type { Transaction, Action } from '../../constants/types';

export async function getTransactionStatus(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const txHash = this.getNodeParameter('txHash', index) as string;

  const response = await thornodeApiRequest(
    this,
    'GET',
    `/tx/status/${txHash.toUpperCase()}`,
  );

  return [{ json: response as IDataObject }];
}

export async function getTransactionByHash(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const txHash = this.getNodeParameter('txHash', index) as string;

  const response = (await thornodeApiRequest(
    this,
    'GET',
    `/tx/${txHash.toUpperCase()}`,
  )) as Transaction;

  return [{ json: response }];
}

export async function listActions(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index, '') as string;
  const txid = this.getNodeParameter('txid', index, '') as string;
  const asset = this.getNodeParameter('asset', index, '') as string;
  const actionType = this.getNodeParameter('actionType', index, '') as string;
  const limit = this.getNodeParameter('limit', index, 50) as number;
  const offset = this.getNodeParameter('offset', index, 0) as number;

  const query: IDataObject = {
    limit: limit.toString(),
    offset: offset.toString(),
  };

  if (address) query.address = address;
  if (txid) query.txid = txid;
  if (asset) query.asset = asset;
  if (actionType) query.type = actionType;

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

export async function getPendingOutbounds(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/queue/outbound',
  )) as IDataObject[];

  return (response || []).map((tx) => ({ json: tx }));
}

export async function getScheduledOutbounds(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/queue/scheduled',
  )) as IDataObject[];

  return (response || []).map((tx) => ({ json: tx }));
}

export async function getTxDetails(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const txHash = this.getNodeParameter('txHash', index) as string;

  const midgardResponse = (await midgardApiRequest(
    this,
    'GET',
    '/actions',
    undefined,
    { txid: txHash, limit: '1' },
  )) as { actions: Action[] };

  const thornodeResponse = await thornodeApiRequest(
    this,
    'GET',
    `/tx/${txHash.toUpperCase()}`,
  ).catch(() => null);

  return [
    {
      json: {
        txHash,
        midgardAction: midgardResponse.actions?.[0] || null,
        thornodeData: thornodeResponse as IDataObject | null,
      },
    },
  ];
}

export async function getStages(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const txHash = this.getNodeParameter('txHash', index) as string;

  const response = await thornodeApiRequest(
    this,
    'GET',
    `/tx/stages/${txHash.toUpperCase()}`,
  );

  return [{ json: response as IDataObject }];
}

export async function getSigners(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const txHash = this.getNodeParameter('txHash', index) as string;

  const response = await thornodeApiRequest(
    this,
    'GET',
    `/tx/details/${txHash.toUpperCase()}`,
  );

  return [{ json: response as IDataObject }];
}

export async function getTxCount(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index, '') as string;
  const actionType = this.getNodeParameter('actionType', index, '') as string;

  const query: IDataObject = {
    limit: '1',
    offset: '0',
  };

  if (address) query.address = address;
  if (actionType) query.type = actionType;

  const response = (await midgardApiRequest(
    this,
    'GET',
    '/actions',
    undefined,
    query,
  )) as { count: string };

  return [
    {
      json: {
        count: response.count,
        address: address || 'all',
        actionType: actionType || 'all',
      },
    },
  ];
}
