/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ThorchainApi implements ICredentialType {
  name = 'thorchainApi';
  displayName = 'THORChain API';
  documentationUrl = 'https://docs.thorchain.org/';
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Mainnet',
          value: 'mainnet',
        },
        {
          name: 'Stagenet',
          value: 'stagenet',
        },
      ],
      default: 'mainnet',
      description: 'The THORChain network to connect to',
    },
    {
      displayName: 'Midgard API Endpoint',
      name: 'midgardUrl',
      type: 'string',
      default: 'https://midgard.ninerealms.com/v2',
      placeholder: 'https://midgard.ninerealms.com/v2',
      description: 'The Midgard API endpoint for analytics and historical data',
    },
    {
      displayName: 'THORNode API Endpoint',
      name: 'thornodeUrl',
      type: 'string',
      default: 'https://thornode.ninerealms.com/thorchain',
      placeholder: 'https://thornode.ninerealms.com/thorchain',
      description: 'The THORNode API endpoint for real-time state queries',
    },
    {
      displayName: 'Custom Headers (Optional)',
      name: 'customHeaders',
      type: 'json',
      default: '{}',
      description: 'Additional headers to include in API requests (JSON format)',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.midgardUrl}}',
      url: '/health',
      method: 'GET',
    },
  };
}
