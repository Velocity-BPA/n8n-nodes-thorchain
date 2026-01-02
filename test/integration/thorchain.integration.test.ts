/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Integration tests for THORChain node
 *
 * These tests require a running n8n instance and valid API endpoints.
 * Set THORCHAIN_INTEGRATION_TESTS=true to run these tests.
 *
 * Note: These tests use mainnet public endpoints. For production testing,
 * consider using stagenet endpoints.
 */

interface Pool {
  asset: string;
  assetDepth: string;
  runeDepth: string;
  status?: string;
  poolAPY?: string;
  balance_asset?: string;
}

interface InboundAddress {
  chain: string;
  address: string;
  halted: boolean;
}

interface ThorNode {
  node_address: string;
  status: string;
  bond: string;
}

interface ActionsResponse {
  actions: unknown[];
}

interface HistoryResponse {
  intervals: unknown[];
}

const SKIP_INTEGRATION = process.env.THORCHAIN_INTEGRATION_TESTS !== 'true';

// Skip all integration tests by default
const describeIntegration = SKIP_INTEGRATION ? describe.skip : describe;

describeIntegration('THORChain Integration Tests', () => {
  const MIDGARD_URL = 'https://midgard.ninerealms.com/v2';
  const THORNODE_URL = 'https://thornode.ninerealms.com/thorchain';

  describe('Midgard API', () => {
    it('should fetch pools', async () => {
      const response = await fetch(`${MIDGARD_URL}/pools`);
      expect(response.ok).toBe(true);

      const pools = (await response.json()) as Pool[];
      expect(Array.isArray(pools)).toBe(true);
      expect(pools.length).toBeGreaterThan(0);

      const pool = pools[0];
      expect(pool).toHaveProperty('asset');
      expect(pool).toHaveProperty('assetDepth');
      expect(pool).toHaveProperty('runeDepth');
    });

    it('should fetch pool details', async () => {
      const response = await fetch(`${MIDGARD_URL}/pool/BTC.BTC`);
      expect(response.ok).toBe(true);

      const pool = (await response.json()) as Pool;
      expect(pool.asset).toBe('BTC.BTC');
      expect(pool).toHaveProperty('status');
      expect(pool).toHaveProperty('poolAPY');
    });

    it('should fetch actions', async () => {
      const response = await fetch(`${MIDGARD_URL}/actions?limit=10`);
      expect(response.ok).toBe(true);

      const data = (await response.json()) as ActionsResponse;
      expect(data).toHaveProperty('actions');
      expect(Array.isArray(data.actions)).toBe(true);
    });

    it('should fetch network stats', async () => {
      const response = await fetch(`${MIDGARD_URL}/network`);
      expect(response.ok).toBe(true);

      const network = await response.json();
      expect(network).toHaveProperty('activeNodeCount');
      expect(network).toHaveProperty('bondMetrics');
    });

    it('should fetch swap history', async () => {
      const response = await fetch(`${MIDGARD_URL}/history/swaps?interval=day&count=7`);
      expect(response.ok).toBe(true);

      const history = (await response.json()) as HistoryResponse;
      expect(history).toHaveProperty('intervals');
      expect(Array.isArray(history.intervals)).toBe(true);
    });
  });

  describe('THORNode API', () => {
    it('should fetch inbound addresses', async () => {
      const response = await fetch(`${THORNODE_URL}/inbound_addresses`);
      expect(response.ok).toBe(true);

      const addresses = (await response.json()) as InboundAddress[];
      expect(addresses.length).toBeGreaterThan(0);

      const address = addresses[0];
      expect(address).toHaveProperty('chain');
      expect(address).toHaveProperty('address');
      expect(address).toHaveProperty('halted');
    });

    it('should fetch nodes', async () => {
      const response = await fetch(`${THORNODE_URL}/nodes`);
      expect(response.ok).toBe(true);

      const nodes = (await response.json()) as ThorNode[];
      const activeNodes = nodes.filter((n) => n.status === 'Active');
      expect(activeNodes.length).toBeGreaterThan(0);
    });

    it('should fetch mimir', async () => {
      const response = await fetch(`${THORNODE_URL}/mimir`);
      expect(response.ok).toBe(true);

      const mimir = await response.json();
      expect(typeof mimir).toBe('object');
    });

    it('should fetch constants', async () => {
      const response = await fetch(`${THORNODE_URL}/constants`);
      expect(response.ok).toBe(true);

      const constants = await response.json();
      expect(constants).toHaveProperty('int_64_values');
      expect(constants).toHaveProperty('bool_values');
      expect(constants).toHaveProperty('string_values');
    });

    it('should fetch queue', async () => {
      const response = await fetch(`${THORNODE_URL}/queue`);
      expect(response.ok).toBe(true);

      const queue = await response.json();
      expect(queue).toHaveProperty('swap');
      expect(queue).toHaveProperty('outbound');
    });
  });

  describe('Swap Quote API', () => {
    it('should get swap quote', async () => {
      const params = new URLSearchParams({
        from_asset: 'BTC.BTC',
        to_asset: 'ETH.ETH',
        amount: '10000000', // 0.1 BTC
      });

      const response = await fetch(`${THORNODE_URL}/quote/swap?${params}`);
      expect(response.ok).toBe(true);

      const quote = await response.json();
      expect(quote).toHaveProperty('expected_amount_out');
      expect(quote).toHaveProperty('fees');
      expect(quote).toHaveProperty('inbound_address');
      expect(quote).toHaveProperty('memo');
    });
  });

  describe('Cross-API Consistency', () => {
    it('should have consistent pool data between Midgard and THORNode', async () => {
      const [midgardResponse, thornodeResponse] = await Promise.all([
        fetch(`${MIDGARD_URL}/pool/BTC.BTC`),
        fetch(`${THORNODE_URL}/pool/BTC.BTC`),
      ]);

      expect(midgardResponse.ok).toBe(true);
      expect(thornodeResponse.ok).toBe(true);

      const midgardPool = (await midgardResponse.json()) as Pool;
      const thornodePool = (await thornodeResponse.json()) as Pool;

      const midgardAssetDepth = BigInt(midgardPool.assetDepth);
      const thornodeAssetDepth = BigInt(thornodePool.balance_asset || '0');

      const diff = midgardAssetDepth > thornodeAssetDepth
        ? midgardAssetDepth - thornodeAssetDepth
        : thornodeAssetDepth - midgardAssetDepth;

      // Allow 1% variance between APIs
      const tolerance = midgardAssetDepth / BigInt(100);
      expect(diff <= tolerance).toBe(true);
    });
  });
});
