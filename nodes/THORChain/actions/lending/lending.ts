/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { midgardApiRequest, thornodeApiRequest, toBaseUnits } from '../../transport/apiClient';
import type { Loan, LoanQuote } from '../../constants/types';

export async function getLoanPosition(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;
  const address = this.getNodeParameter('address', index) as string;

  const response = (await thornodeApiRequest(
    this,
    'GET',
    `/pool/${encodeURIComponent(asset)}/borrower/${address}`,
  )) as Loan;

  return [{ json: response }];
}

export async function getLoanQuote(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const fromAsset = this.getNodeParameter('fromAsset', index) as string;
  const toAsset = this.getNodeParameter('toAsset', index) as string;
  const amount = this.getNodeParameter('amount', index) as string;
  const destination = this.getNodeParameter('destination', index) as string;
  const affiliateAddress = this.getNodeParameter('affiliateAddress', index, '') as string;
  const affiliateFee = this.getNodeParameter('affiliateFee', index, 0) as number;
  const minOut = this.getNodeParameter('minOut', index, '') as string;

  const query: IDataObject = {
    from_asset: fromAsset,
    to_asset: toAsset,
    amount: toBaseUnits(amount),
    destination,
  };

  if (affiliateAddress) {
    query.affiliate = affiliateAddress;
    query.affiliate_bps = affiliateFee.toString();
  }

  if (minOut) {
    query.min_out = toBaseUnits(minOut);
  }

  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/quote/loan/open',
    undefined,
    query,
  )) as LoanQuote;

  return [{ json: response }];
}

export async function getCollateralRatio(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;
  const address = this.getNodeParameter('address', index) as string;

  const loanResponse = (await thornodeApiRequest(
    this,
    'GET',
    `/pool/${encodeURIComponent(asset)}/borrower/${address}`,
  )) as Loan;

  const collateralCurrent = BigInt(loanResponse.collateral_current || '0');
  const debtCurrent = BigInt(loanResponse.debt_current || '0');

  let collateralRatio = '0';
  if (debtCurrent > 0n) {
    collateralRatio = ((Number(collateralCurrent) / Number(debtCurrent)) * 100).toFixed(2);
  }

  return [
    {
      json: {
        asset,
        owner: loanResponse.owner,
        collateralCurrent: collateralCurrent.toString(),
        debtCurrent: debtCurrent.toString(),
        collateralRatioPercent: collateralRatio,
        lastOpenHeight: loanResponse.last_open_height,
        lastRepayHeight: loanResponse.last_repay_height,
      },
    },
  ];
}

export async function listLoans(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const asset = this.getNodeParameter('asset', index) as string;

  const response = (await thornodeApiRequest(
    this,
    'GET',
    `/pool/${encodeURIComponent(asset)}/borrowers`,
  )) as Loan[];

  return response.map((loan) => ({ json: loan }));
}

export async function getLendingStats(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const mimirResponse = (await thornodeApiRequest(
    this,
    'GET',
    '/mimir',
  )) as Record<string, number>;

  const poolsResponse = (await midgardApiRequest(
    this,
    'GET',
    '/pools',
  )) as IDataObject[];

  const lendingEnabled = mimirResponse['LENDING-ENABLED'] === 1;
  const loanRepaymentMaturity = mimirResponse['LOANREPAYMENTMATURITY'] || 0;
  const maxCR = mimirResponse['MAXCR'] || 0;
  const minCR = mimirResponse['MINCR'] || 0;

  const poolsWithLending = poolsResponse.filter((p) => {
    const asset = p.asset as string;
    return asset && (asset.startsWith('BTC.') || asset.startsWith('ETH.'));
  });

  return [
    {
      json: {
        lendingEnabled,
        loanRepaymentMaturity,
        maxCollateralRatio: maxCR,
        minCollateralRatio: minCR,
        supportedPools: poolsWithLending.map((p) => p.asset),
        totalPools: poolsWithLending.length,
      },
    },
  ];
}

export async function getRepayQuote(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const fromAsset = this.getNodeParameter('fromAsset', index) as string;
  const toAsset = this.getNodeParameter('toAsset', index) as string;
  const amount = this.getNodeParameter('amount', index) as string;
  const loanOwner = this.getNodeParameter('loanOwner', index) as string;

  const query: IDataObject = {
    from_asset: fromAsset,
    to_asset: toAsset,
    amount: toBaseUnits(amount),
    loan_owner: loanOwner,
  };

  const response = await thornodeApiRequest(
    this,
    'GET',
    '/quote/loan/close',
    undefined,
    query,
  );

  return [{ json: response as IDataObject }];
}
