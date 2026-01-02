/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { midgardApiRequest, thornodeApiRequest } from '../../transport/apiClient';
import type { NetworkInfo, Mimir, Constants, Queue, InboundAddress } from '../../constants/types';

export async function getNetworkInfo(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = (await midgardApiRequest(
    this,
    'GET',
    '/network',
  )) as NetworkInfo;

  return [{ json: response }];
}

export async function getMimir(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/mimir',
  )) as Mimir;

  return [{ json: response }];
}

export async function getConstants(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/constants',
  )) as Constants;

  return [{ json: response }];
}

export async function getInboundAddresses(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/inbound_addresses',
  )) as InboundAddress[];

  return response.map((addr) => ({ json: addr }));
}

export async function getQueue(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/queue',
  )) as Queue;

  return [{ json: response }];
}

export async function getBlockHeight(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/lastblock',
  )) as IDataObject[];

  let thorchainHeight = '0';
  if (Array.isArray(response) && response.length > 0) {
    thorchainHeight = (response[0].thorchain as string) || '0';
  }

  const networkResponse = (await midgardApiRequest(
    this,
    'GET',
    '/health',
  )) as IDataObject;

  return [
    {
      json: {
        thorchainHeight,
        lastBlocks: response,
        scannerHeight: networkResponse.scannerHeight,
        database: networkResponse.database,
        inSync: networkResponse.inSync,
      },
    },
  ];
}

export async function getVersion(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/version',
  )) as IDataObject;

  return [{ json: response }];
}

export async function getNetworkStats(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const networkResponse = (await midgardApiRequest(
    this,
    'GET',
    '/network',
  )) as NetworkInfo;

  const statsResponse = (await midgardApiRequest(
    this,
    'GET',
    '/stats',
  )) as IDataObject;

  return [
    {
      json: {
        network: networkResponse,
        stats: statsResponse,
      },
    },
  ];
}

export async function getBanList(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/ban',
  )) as IDataObject[];

  return (response || []).map((ban) => ({ json: ban }));
}

export async function getRagnarok(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const mimirResponse = (await thornodeApiRequest(
    this,
    'GET',
    '/mimir',
  )) as Mimir;

  const ragnarokEnabled = mimirResponse['RAGNAROK-THOR'] === 1;

  return [
    {
      json: {
        ragnarokEnabled,
        mimirValues: {
          RAGNAROK_THOR: mimirResponse['RAGNAROK-THOR'],
        },
      },
    },
  ];
}
