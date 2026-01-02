/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { midgardApiRequest, thornodeApiRequest } from '../../transport/apiClient';
import {
  buildSwapMemo,
  buildAddLiquidityMemo,
  buildWithdrawMemo,
  buildSaverDepositMemo,
  buildSaverWithdrawMemo,
  buildOpenLoanMemo,
  buildCloseLoanMemo,
  buildDonateMemo,
  buildBondMemo,
  buildUnbondMemo,
  buildLeaveMemo,
  parseMemo,
  validateAddress,
  validateAsset,
} from '../../utils/memoUtils';
import { SUPPORTED_CHAINS, ADDRESS_PREFIXES, CHAIN_INFO } from '../../constants/chains';
import type { InboundAddress } from '../../constants/types';

export async function buildMemo(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const memoType = this.getNodeParameter('memoType', index) as string;
  let memo = '';

  switch (memoType) {
    case 'swap': {
      const asset = this.getNodeParameter('asset', index) as string;
      const destAddress = this.getNodeParameter('destAddress', index) as string;
      const limit = this.getNodeParameter('limit', index, '') as string;
      const affiliate = this.getNodeParameter('affiliate', index, '') as string;
      const affiliateFee = this.getNodeParameter('affiliateFee', index, '') as string;
      const streamingInterval = this.getNodeParameter('streamingInterval', index, 0) as number;
      const streamingQuantity = this.getNodeParameter('streamingQuantity', index, 0) as number;
      memo = buildSwapMemo({
        asset,
        destAddress,
        limit: limit || undefined,
        affiliateAddress: affiliate || undefined,
        affiliateFee: affiliateFee || undefined,
        streamingInterval: streamingInterval || undefined,
        streamingQuantity: streamingQuantity || undefined,
      });
      break;
    }
    case 'addLiquidity': {
      const asset = this.getNodeParameter('asset', index) as string;
      const pairedAddress = this.getNodeParameter('pairedAddress', index, '') as string;
      const affiliate = this.getNodeParameter('affiliate', index, '') as string;
      const affiliateFee = this.getNodeParameter('affiliateFee', index, '') as string;
      memo = buildAddLiquidityMemo({
        asset,
        pairedAddress: pairedAddress || undefined,
        affiliateAddress: affiliate || undefined,
        affiliateFee: affiliateFee || undefined,
      });
      break;
    }
    case 'withdraw': {
      const asset = this.getNodeParameter('asset', index) as string;
      const basisPoints = this.getNodeParameter('basisPoints', index, 10000) as number;
      const targetAsset = this.getNodeParameter('targetAsset', index, '') as string;
      memo = buildWithdrawMemo({
        asset,
        basisPoints,
        targetAsset: targetAsset || undefined,
      });
      break;
    }
    case 'saverDeposit': {
      const asset = this.getNodeParameter('asset', index) as string;
      const affiliate = this.getNodeParameter('affiliate', index, '') as string;
      const affiliateFee = this.getNodeParameter('affiliateFee', index, '') as string;
      memo = buildSaverDepositMemo({
        asset,
        affiliateAddress: affiliate || undefined,
        affiliateFee: affiliateFee || undefined,
      });
      break;
    }
    case 'saverWithdraw': {
      const asset = this.getNodeParameter('asset', index) as string;
      const basisPoints = this.getNodeParameter('basisPoints', index, 10000) as number;
      memo = buildSaverWithdrawMemo(asset, basisPoints);
      break;
    }
    case 'openLoan': {
      const asset = this.getNodeParameter('asset', index) as string;
      const destAddress = this.getNodeParameter('destAddress', index) as string;
      const minOut = this.getNodeParameter('minOut', index, '') as string;
      const affiliate = this.getNodeParameter('affiliate', index, '') as string;
      const affiliateFee = this.getNodeParameter('affiliateFee', index, '') as string;
      memo = buildOpenLoanMemo({
        asset,
        destAddress,
        minOut: minOut || undefined,
        affiliateAddress: affiliate || undefined,
        affiliateFee: affiliateFee || undefined,
      });
      break;
    }
    case 'closeLoan': {
      const asset = this.getNodeParameter('asset', index) as string;
      const destAddress = this.getNodeParameter('destAddress', index) as string;
      memo = buildCloseLoanMemo(asset, destAddress);
      break;
    }
    case 'donate': {
      const asset = this.getNodeParameter('asset', index) as string;
      memo = buildDonateMemo(asset);
      break;
    }
    case 'bond': {
      const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
      const providerAddress = this.getNodeParameter('providerAddress', index, '') as string;
      memo = buildBondMemo(nodeAddress, providerAddress || undefined);
      break;
    }
    case 'unbond': {
      const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
      const amount = this.getNodeParameter('amount', index) as string;
      memo = buildUnbondMemo(nodeAddress, amount);
      break;
    }
    case 'leave': {
      const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
      memo = buildLeaveMemo(nodeAddress);
      break;
    }
    default:
      memo = this.getNodeParameter('customMemo', index, '') as string;
  }

  return [
    {
      json: {
        memoType,
        memo,
      },
    },
  ];
}

export async function parseMemoAction(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const memo = this.getNodeParameter('memo', index) as string;
  const parsed = parseMemo(memo);

  return [{ json: parsed }];
}

export async function validateAddressAction(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index) as string;
  const chain = this.getNodeParameter('chain', index) as string;

  const isValid = validateAddress(address, chain);
  const expectedPrefixes = ADDRESS_PREFIXES[chain.toUpperCase()] || [];

  return [
    {
      json: {
        address,
        chain,
        isValid,
        expectedPrefixes,
      },
    },
  ];
}

export async function getSupportedChains(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const inboundAddresses = (await thornodeApiRequest(
    this,
    'GET',
    '/inbound_addresses',
  )) as InboundAddress[];

  const activeChains = inboundAddresses
    .filter((addr) => !addr.halted)
    .map((addr) => ({
      chain: addr.chain,
      address: addr.address,
      router: addr.router,
      halted: addr.halted,
      gasRate: addr.gas_rate,
      outboundFee: addr.outbound_fee,
    }));

  const haltedChains = inboundAddresses
    .filter((addr) => addr.halted)
    .map((addr) => addr.chain);

  return [
    {
      json: {
        supportedChains: SUPPORTED_CHAINS,
        activeChains,
        haltedChains,
        totalActive: activeChains.length,
        totalHalted: haltedChains.length,
      },
    },
  ];
}

export async function getAPIHealth(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const midgardHealth = (await midgardApiRequest(this, 'GET', '/health')) as IDataObject;

  let thornodeHealth: IDataObject = {};
  try {
    thornodeHealth = (await thornodeApiRequest(this, 'GET', '/ping')) as IDataObject;
  } catch {
    thornodeHealth = { error: 'THORNode ping failed' };
  }

  return [
    {
      json: {
        midgard: {
          ...midgardHealth,
          status: midgardHealth.inSync ? 'healthy' : 'syncing',
        },
        thornode: thornodeHealth,
        timestamp: new Date().toISOString(),
      },
    },
  ];
}

export async function validateAssetAction(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;
  const isValid = validateAsset(asset);

  let poolExists = false;
  let poolStatus = 'unknown';

  if (isValid) {
    try {
      const poolResponse = (await midgardApiRequest(
        this,
        'GET',
        `/pool/${encodeURIComponent(asset)}`,
      )) as IDataObject;
      poolExists = true;
      poolStatus = poolResponse.status as string;
    } catch {
      poolExists = false;
    }
  }

  return [
    {
      json: {
        asset,
        isValidFormat: isValid,
        poolExists,
        poolStatus,
      },
    },
  ];
}

export async function getAssetInfo(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;

  const [chain, symbol] = asset.split('.');

  const chainInfo = CHAIN_INFO[chain];

  let poolInfo: IDataObject = {};
  try {
    poolInfo = (await midgardApiRequest(
      this,
      'GET',
      `/pool/${encodeURIComponent(asset)}`,
    )) as IDataObject;
  } catch {
    poolInfo = { error: 'Pool not found' };
  }

  return [
    {
      json: {
        asset,
        chain,
        symbol,
        chainName: chainInfo?.name || 'Unknown',
        isNativeGasAsset: chainInfo?.gasAsset === asset,
        pool: poolInfo,
      },
    },
  ];
}

export async function convertAmount(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const amount = this.getNodeParameter('amount', index) as string;
  const direction = this.getNodeParameter('direction', index) as string;
  const decimals = this.getNodeParameter('decimals', index, 8) as number;

  let result: string;
  let fromUnit: string;
  let toUnit: string;

  if (direction === 'toBase') {
    result = Math.floor(parseFloat(amount) * Math.pow(10, decimals)).toString();
    fromUnit = 'human';
    toUnit = 'base';
  } else {
    result = (parseFloat(amount) / Math.pow(10, decimals)).toString();
    fromUnit = 'base';
    toUnit = 'human';
  }

  return [
    {
      json: {
        input: amount,
        output: result,
        direction,
        decimals,
        fromUnit,
        toUnit,
      },
    },
  ];
}
