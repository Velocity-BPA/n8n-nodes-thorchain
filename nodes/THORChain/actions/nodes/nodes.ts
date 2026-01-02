/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { thornodeApiRequest, midgardApiRequest } from '../../transport/apiClient';
import type { Node, NetworkInfo } from '../../constants/types';

export async function listActiveNodes(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/nodes',
  )) as Node[];

  const activeNodes = response.filter((node) => node.status === 'Active');

  return activeNodes.map((node) => ({ json: node }));
}

export async function getNodeInfo(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;

  const response = (await thornodeApiRequest(
    this,
    'GET',
    `/node/${nodeAddress}`,
  )) as Node;

  return [{ json: response }];
}

export async function getNodeRewards(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;

  const nodeResponse = (await thornodeApiRequest(
    this,
    'GET',
    `/node/${nodeAddress}`,
  )) as Node;

  const currentAward = nodeResponse.current_award || '0';
  const bond = nodeResponse.bond || '0';
  const slashPoints = nodeResponse.slash_points || '0';

  return [
    {
      json: {
        nodeAddress,
        status: nodeResponse.status,
        currentAward,
        bond,
        slashPoints,
        version: nodeResponse.version,
        ipAddress: nodeResponse.ip_address,
        activeBlockHeight: nodeResponse.active_block_height,
        bondProviders: nodeResponse.bond_providers,
      },
    },
  ];
}

export async function getBondInfo(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;

  const nodeResponse = (await thornodeApiRequest(
    this,
    'GET',
    `/node/${nodeAddress}`,
  )) as Node;

  const bondProviders = nodeResponse.bond_providers || { providers: [] };

  return [
    {
      json: {
        nodeAddress,
        status: nodeResponse.status,
        totalBond: nodeResponse.bond,
        bondAddress: nodeResponse.bond_address,
        nodeOperatorFee: bondProviders.node_operator_fee,
        providers: bondProviders.providers,
        requestedToLeave: nodeResponse.requested_to_leave,
        forcedToLeave: nodeResponse.forced_to_leave,
      },
    },
  ];
}

export async function getChurningStatus(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const networkResponse = (await midgardApiRequest(
    this,
    'GET',
    '/network',
  )) as NetworkInfo;

  const nodesResponse = (await thornodeApiRequest(
    this,
    'GET',
    '/nodes',
  )) as Node[];

  const activeNodes = nodesResponse.filter((n) => n.status === 'Active');
  const standbyNodes = nodesResponse.filter((n) => n.status === 'Standby');
  const leavingNodes = nodesResponse.filter((n) => n.requested_to_leave || n.forced_to_leave);

  return [
    {
      json: {
        nextChurnHeight: networkResponse.next_churn_height || networkResponse.churning_info?.next_churn_height,
        churnInterval: networkResponse.churning_info?.churn_interval,
        activeNodeCount: activeNodes.length,
        standbyNodeCount: standbyNodes.length,
        leavingNodes: leavingNodes.map((n) => ({
          address: n.node_address,
          requested: n.requested_to_leave,
          forced: n.forced_to_leave,
          leaveHeight: n.leave_height,
        })),
        vaultsMigrating: networkResponse.vaults_migrating,
      },
    },
  ];
}

export async function listAllNodes(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const status = this.getNodeParameter('status', index, '') as string;

  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/nodes',
  )) as Node[];

  let filteredNodes = response;
  if (status) {
    filteredNodes = response.filter((node) => node.status.toLowerCase() === status.toLowerCase());
  }

  return filteredNodes.map((node) => ({ json: node }));
}

export async function getNodePubkeys(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;

  const nodeResponse = (await thornodeApiRequest(
    this,
    'GET',
    `/node/${nodeAddress}`,
  )) as Node;

  return [
    {
      json: {
        nodeAddress,
        pubKeySet: nodeResponse.pub_key_set,
        validatorConsPubKey: nodeResponse.validator_cons_pub_key,
        signerMembership: nodeResponse.signer_membership,
      },
    },
  ];
}

export async function getJailedNodes(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = (await thornodeApiRequest(
    this,
    'GET',
    '/nodes',
  )) as Node[];

  const jailedNodes = response.filter((node) => node.jail && node.jail.release_height);

  return jailedNodes.map((node) => ({
    json: {
      nodeAddress: node.node_address,
      status: node.status,
      jail: node.jail,
      slashPoints: node.slash_points,
      version: node.version,
    },
  }));
}
