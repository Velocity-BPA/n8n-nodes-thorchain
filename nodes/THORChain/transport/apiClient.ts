/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IHookFunctions,
  IPollFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  IDataObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import type { ThorchainCredentials } from '../constants/types';
import { NETWORK_ENDPOINTS } from '../constants/chains';

export type ThorchainContext =
  | IExecuteFunctions
  | ILoadOptionsFunctions
  | IHookFunctions
  | IPollFunctions;

export interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

function getCredentials(context: ThorchainContext): ThorchainCredentials {
  const credentials = context.getCredentials('thorchainApi') as unknown as ThorchainCredentials;
  return credentials;
}

function getEndpoints(credentials: ThorchainCredentials): { midgard: string; thornode: string } {
  const network = credentials.network || 'mainnet';
  const defaults = NETWORK_ENDPOINTS[network];

  return {
    midgard: credentials.midgardUrl || defaults.midgard,
    thornode: credentials.thornodeUrl || defaults.thornode,
  };
}

function parseCustomHeaders(customHeaders: string | undefined): Record<string, string> {
  if (!customHeaders) return {};
  try {
    return JSON.parse(customHeaders);
  } catch {
    return {};
  }
}

export async function midgardApiRequest(
  context: ThorchainContext,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  query?: IDataObject,
): Promise<unknown> {
  const credentials = await getCredentials(context);
  const { midgard } = getEndpoints(credentials);
  const customHeaders = parseCustomHeaders(credentials.customHeaders);

  const options: IHttpRequestOptions = {
    method,
    url: `${midgard}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customHeaders,
    },
    json: true,
  };

  if (body && Object.keys(body).length > 0) {
    options.body = body;
  }

  if (query && Object.keys(query).length > 0) {
    options.qs = query;
  }

  try {
    const response = await context.helpers.httpRequest(options);
    return response;
  } catch (error) {
    const err = error as Error;
    throw new NodeApiError(context.getNode(), { message: err.message, name: err.name }, {
      message: `Midgard API Error: ${err.message}`,
    });
  }
}

export async function thornodeApiRequest(
  context: ThorchainContext,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  query?: IDataObject,
): Promise<unknown> {
  const credentials = await getCredentials(context);
  const { thornode } = getEndpoints(credentials);
  const customHeaders = parseCustomHeaders(credentials.customHeaders);

  const options: IHttpRequestOptions = {
    method,
    url: `${thornode}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customHeaders,
    },
    json: true,
  };

  if (body && Object.keys(body).length > 0) {
    options.body = body;
  }

  if (query && Object.keys(query).length > 0) {
    options.qs = query;
  }

  try {
    const response = await context.helpers.httpRequest(options);
    return response;
  } catch (error) {
    const err = error as Error;
    throw new NodeApiError(context.getNode(), { message: err.message, name: err.name }, {
      message: `THORNode API Error: ${err.message}`,
    });
  }
}

export async function midgardApiRequestAllItems(
  context: ThorchainContext,
  method: IHttpRequestMethods,
  endpoint: string,
  query?: IDataObject,
  limit = 400,
): Promise<unknown[]> {
  const results: unknown[] = [];
  let offset = 0;
  const pageSize = Math.min(limit, 100);

  while (results.length < limit) {
    const queryWithPagination = {
      ...query,
      offset: offset.toString(),
      limit: pageSize.toString(),
    };

    const response = (await midgardApiRequest(
      context,
      method,
      endpoint,
      undefined,
      queryWithPagination,
    )) as unknown[];

    if (!Array.isArray(response) || response.length === 0) {
      break;
    }

    results.push(...response);
    offset += response.length;

    if (response.length < pageSize) {
      break;
    }
  }

  return results.slice(0, limit);
}

export function formatAsset(asset: string): string {
  const normalized = asset.toUpperCase().trim();
  if (normalized.includes('.')) {
    return normalized;
  }
  return `${normalized}.${normalized}`;
}

export function formatAmount(amount: string | number, decimals = 8): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (value / Math.pow(10, decimals)).toFixed(decimals);
}

export function toBaseUnits(amount: string | number, decimals = 8): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.floor(value * Math.pow(10, decimals)).toString();
}
