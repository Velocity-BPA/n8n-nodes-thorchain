/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { midgardApiRequest, thornodeApiRequest, toBaseUnits } from '../../transport/apiClient';
import { buildSwapMemo } from '../../utils/memoUtils';
import type { SwapQuote, InboundAddress, Action } from '../../constants/types';

export async function getSwapQuote(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const fromAsset = this.getNodeParameter('fromAsset', index) as string;
  const toAsset = this.getNodeParameter('toAsset', index) as string;
  const amount = this.getNodeParameter('amount', index) as string;
  const destination = this.getNodeParameter('destination', index) as string;
  const affiliateAddress = this.getNodeParameter('affiliateAddress', index, '') as string;
  const affiliateFee = this.getNodeParameter('affiliateFee', index, 0) as number;
  const streamingInterval = this.getNodeParameter('streamingInterval', index, 0) as number;
  const streamingQuantity = this.getNodeParameter('streamingQuantity', index, 0) as number;

  const amountInBase = toBaseUnits(amount);

  const query: IDataObject = {
    from_asset: fromAsset,
    to_asset: toAsset,
    amount: amountInBase,
    destination,
  };

  if (affiliateAddress) {
    query.affiliate = affiliateAddress;
    query.affiliate_bps = affiliateFee.toString();
  }

  if (streamingInterval > 0) {
    query.streaming_interval = streamingInterval.toString();
    if (streamingQuantity > 0) {
      query.streaming_quantity = streamingQuantity.toString();
    }
  }

  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/quote/swap',
    undefined,
    query,
  )) as SwapQuote;

  return [{ json: response }];
}

export async function buildSwapMemoAction(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('toAsset', index) as string;
  const destAddress = this.getNodeParameter('destination', index) as string;
  const limit = this.getNodeParameter('limit', index, '') as string;
  const affiliateAddress = this.getNodeParameter('affiliateAddress', index, '') as string;
  const affiliateFee = this.getNodeParameter('affiliateFee', index, '') as string;
  const streamingInterval = this.getNodeParameter('streamingInterval', index, 0) as number;
  const streamingQuantity = this.getNodeParameter('streamingQuantity', index, 0) as number;

  const memo = buildSwapMemo({
    asset,
    destAddress,
    limit: limit || undefined,
    affiliateAddress: affiliateAddress || undefined,
    affiliateFee: affiliateFee || undefined,
    streamingInterval: streamingInterval || undefined,
    streamingQuantity: streamingQuantity || undefined,
  });

  return [
    {
      json: {
        memo,
        asset,
        destination: destAddress,
        limit,
        affiliate: affiliateAddress,
        affiliateFee,
        streaming: {
          interval: streamingInterval,
          quantity: streamingQuantity,
        },
      },
    },
  ];
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

export async function getSwapStatus(
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

export async function getStreamingQuote(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const fromAsset = this.getNodeParameter('fromAsset', index) as string;
  const toAsset = this.getNodeParameter('toAsset', index) as string;
  const amount = this.getNodeParameter('amount', index) as string;
  const destination = this.getNodeParameter('destination', index) as string;
  const affiliateAddress = this.getNodeParameter('affiliateAddress', index, '') as string;
  const affiliateFee = this.getNodeParameter('affiliateFee', index, 0) as number;

  const amountInBase = toBaseUnits(amount);

  const query: IDataObject = {
    from_asset: fromAsset,
    to_asset: toAsset,
    amount: amountInBase,
    destination,
    streaming_interval: '1',
  };

  if (affiliateAddress) {
    query.affiliate = affiliateAddress;
    query.affiliate_bps = affiliateFee.toString();
  }

  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/quote/swap',
    undefined,
    query,
  )) as SwapQuote;

  return [{ json: response }];
}

export async function getSwapHistory(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index, '') as string;
  const txid = this.getNodeParameter('txid', index, '') as string;
  const asset = this.getNodeParameter('asset', index, '') as string;
  const limit = this.getNodeParameter('limit', index, 50) as number;
  const offset = this.getNodeParameter('offset', index, 0) as number;

  const query: IDataObject = {
    type: 'swap',
    limit: limit.toString(),
    offset: offset.toString(),
  };

  if (address) query.address = address;
  if (txid) query.txid = txid;
  if (asset) query.asset = asset;

  const response = (await midgardApiRequest(
    this,
    'GET',
    '/actions',
    undefined,
    query,
  )) as { actions: Action[] };

  return (response.actions || []).map((action) => ({ json: action as unknown as IDataObject }));
}

export async function estimateFees(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const fromAsset = this.getNodeParameter('fromAsset', index) as string;
  const toAsset = this.getNodeParameter('toAsset', index) as string;
  const amount = this.getNodeParameter('amount', index) as string;
  const destination = this.getNodeParameter('destination', index) as string;
  const affiliateAddress = this.getNodeParameter('affiliateAddress', index, '') as string;
  const affiliateFee = this.getNodeParameter('affiliateFee', index, 0) as number;

  const amountInBase = toBaseUnits(amount);

  const query: IDataObject = {
    from_asset: fromAsset,
    to_asset: toAsset,
    amount: amountInBase,
    destination,
  };

  if (affiliateAddress) {
    query.affiliate = affiliateAddress;
    query.affiliate_bps = affiliateFee.toString();
  }

  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/quote/swap',
    undefined,
    query,
  )) as SwapQuote;

  return [
    {
      json: {
        fromAsset,
        toAsset,
        inputAmount: amount,
        fees: response.fees,
        expectedOutput: response.expected_amount_out,
        outboundDelaySeconds: response.outbound_delay_seconds,
        totalSwapSeconds: response.total_swap_seconds,
      },
    },
  ];
}
