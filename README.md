# n8n-nodes-thorchain

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for THORChain, the decentralized cross-chain liquidity protocol enabling native asset swaps between Bitcoin, Ethereum, BNB Chain, Avalanche, Cosmos, Dogecoin, Litecoin, and Bitcoin Cash.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![THORChain](https://img.shields.io/badge/THORChain-DeFi-00CCFF)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## Features

- **14 Resource Categories** with 80+ operations for complete THORChain integration
- **Cross-Chain Swaps** - Quote and track swaps between 8+ blockchains
- **Liquidity Pools** - Monitor pool depths, APY, and manage LP positions
- **Savers Vaults** - Single-asset yield vaults without impermanent loss
- **Lending** - Collateralized loans without interest or liquidation
- **Real-Time Triggers** - Poll-based events for swaps, pool changes, and more
- **Memo Builder/Parser** - Construct and decode THORChain transaction memos
- **Multi-Network** - Support for mainnet and stagenet

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-thorchain`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-thorchain

# Restart n8n
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-thorchain.git
cd n8n-nodes-thorchain

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n (Linux/macOS)
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-thorchain

# Restart n8n
n8n start
```

## Credentials Setup

| Field | Description | Default |
|-------|-------------|---------|
| Network | Mainnet or Stagenet | Mainnet |
| Midgard URL | Analytics API endpoint | https://midgard.ninerealms.com/v2 |
| THORNode URL | Real-time state API endpoint | https://thornode.ninerealms.com/thorchain |
| Custom Headers | Optional JSON headers | {} |

## Resources & Operations

### Pools
| Operation | Description |
|-----------|-------------|
| Get Pool Info | Get pool details by asset (e.g., BTC.BTC) |
| List Pools | List all available pools with status filter |
| Get Pool Depth | Get liquidity depth history |
| Get Pool Volume | Get trading volume statistics |
| Get Pool APY | Get annual percentage yield |
| Get Pool Stats | Get comprehensive pool metrics |
| Get Pool History | Get historical pool data |

### Swaps
| Operation | Description |
|-----------|-------------|
| Get Swap Quote | Get quote for swap with fees |
| Build Swap Memo | Construct transaction memo |
| Get Inbound Addresses | Get current vault addresses |
| Get Swap Status | Track swap by tx hash |
| Get Streaming Quote | Large swap optimization |
| Get Swap History | Get past swaps |
| Estimate Fees | Get fee breakdown |

### Liquidity Providers
| Operation | Description |
|-----------|-------------|
| Get LP Position | Get position by pool and address |
| Get LP By Address | Get all positions for address |
| List Pool LPs | List all LPs in a pool |
| Get LP History | Get historical LP actions |
| Get LP Earnings | Calculate yield earned |
| Get Add Liquidity Quote | Estimate deposit |
| Get Withdraw Quote | Estimate withdrawal |

### Savers
| Operation | Description |
|-----------|-------------|
| Get Saver Position | Get vault position |
| Get Saver Quote | Get deposit/withdraw quote |
| List Savers | List all saver positions |
| Get Saver Yield | Get current APY |
| Get Saver Caps | Get deposit limits |

### Lending
| Operation | Description |
|-----------|-------------|
| Get Loan Position | Get loan details |
| Get Loan Quote | Get borrow quote |
| Get Collateral Ratio | Get CR percentage |
| List Loans | List all loans |
| Get Lending Stats | Get protocol metrics |
| Get Repay Quote | Get repayment quote |

### Network
| Operation | Description |
|-----------|-------------|
| Get Network Info | Get chain status and version |
| Get Mimir | Get parameter overrides |
| Get Constants | Get protocol constants |
| Get Inbound Addresses | Get all vault addresses |
| Get Queue | Get transaction queue |
| Get Block Height | Get current heights |

### Nodes
| Operation | Description |
|-----------|-------------|
| List Active Nodes | List active validators |
| Get Node Info | Get node details |
| Get Node Rewards | Get node earnings |
| Get Bond Info | Get bond details |
| Get Churning Status | Get rotation status |

### Transactions
| Operation | Description |
|-----------|-------------|
| Get Transaction Status | Track by hash |
| Get Transaction By Hash | Get full details |
| List Actions | List recent actions |
| Get Pending Outbounds | Get pending txs |
| Get Scheduled Outbounds | Get queued txs |

### RUNE Token
| Operation | Description |
|-----------|-------------|
| Get RUNE Price | Get USD price |
| Get RUNE Supply | Get circulating supply |
| Get RUNE Pools | Get distribution |
| Get RUNE Volume | Get trading volume |
| Get RUNE History | Get historical data |

### Members
| Operation | Description |
|-----------|-------------|
| Get Member Info | Get member details |
| Get Member Pools | Get LP positions |
| Get Member History | Get activity history |
| Get Member Summary | Get aggregated stats |
| Get Member Value | Get USD value |

### Protocol Stats
| Operation | Description |
|-----------|-------------|
| Get Protocol Stats | Get overall metrics |
| Get TVL | Get total value locked |
| Get Volume History | Get historical volume |
| Get Earnings History | Get protocol earnings |
| Get Swap History | Get swap statistics |
| Get Depth History | Get liquidity depth |

### Affiliate
| Operation | Description |
|-----------|-------------|
| Get Affiliate Info | Get affiliate details |
| Get Affiliate Earnings | Get fee earnings |
| Register Affiliate | Build registration memo |
| Get Affiliate Swaps | Get swap history |
| Get Affiliate Stats | Get statistics |

### Trade Assets
| Operation | Description |
|-----------|-------------|
| Get Trade Asset Info | Get trade asset details |
| List Trade Assets | List all trade assets |
| Get Trade Asset Holders | Get holder list |
| Get Trade Account Balance | Get balance |
| Get Trade Asset Quote | Get quote |
| Get Synth Stats | Get synth statistics |

### Utility
| Operation | Description |
|-----------|-------------|
| Build Memo | Construct any memo type |
| Parse Memo | Decode transaction memo |
| Validate Address | Validate by chain |
| Get Supported Chains | Get active chains |
| Get API Health | Check service status |
| Validate Asset | Validate format |
| Get Asset Info | Get chain info |
| Convert Amount | Base unit conversion |

## Trigger Node

The THORChain Trigger node supports poll-based events:

| Event | Description |
|-------|-------------|
| Swap Completed | New swap transaction completed |
| Large Swap Detected | Swap above threshold |
| Pool Depth Changed | Significant depth change |
| LP Activity | New liquidity activity |
| Saver Activity | Saver deposit/withdrawal |
| Node Churned | Node rotation event |
| Network Halt/Resume | Chain halted or resumed |
| Price Deviation | Asset price alert |

## Usage Examples

### Get Swap Quote

```javascript
// Get quote for swapping 1 BTC to ETH
{
  "resource": "swaps",
  "operation": "getSwapQuote",
  "fromAsset": "BTC.BTC",
  "toAsset": "ETH.ETH",
  "amount": "100000000",
  "destination": "0x742d35..."
}
```

### Monitor Pool APY

```javascript
// Get APY for BTC pool
{
  "resource": "pools",
  "operation": "getPoolAPY",
  "asset": "BTC.BTC"
}
```

### Track Swap Transaction

```javascript
// Track swap status
{
  "resource": "swaps",
  "operation": "getSwapStatus",
  "txHash": "ABCD1234..."
}
```

### Build LP Deposit Memo

```javascript
// Build memo for adding liquidity
{
  "resource": "utility",
  "operation": "buildMemo",
  "memoType": "addLiquidity",
  "pool": "BTC.BTC"
}
```

## THORChain Concepts

| Concept | Description |
|---------|-------------|
| **Continuous Liquidity Pool** | AMM with RUNE as base pair for all assets |
| **Streaming Swap** | Large swap split over blocks to reduce slippage |
| **Savers** | Single-asset yield vaults (no impermanent loss) |
| **Inbound Address** | Vault address for deposits (changes regularly) |
| **Memo** | Transaction instruction encoding in tx memo field |
| **Mimir** | Network parameter overrides by node operators |
| **Churning** | Node rotation mechanism for security |
| **Affiliate** | Fee-sharing program for integrators |
| **Trade Assets** | Synthetic assets representing L1 tokens |
| **RUNE** | Native settlement and security token |

## Networks

| Network | Midgard URL | THORNode URL |
|---------|-------------|--------------|
| Mainnet | https://midgard.ninerealms.com/v2 | https://thornode.ninerealms.com/thorchain |
| Stagenet | https://stagenet-midgard.ninerealms.com/v2 | https://stagenet-thornode.ninerealms.com/thorchain |

## Error Handling

The node includes comprehensive error handling:

- API rate limiting with automatic retry
- Network timeout handling
- Invalid parameter validation
- Chain-specific error messages
- Graceful degradation for partial data

## Security Best Practices

1. **Never expose private keys** - This node is read-only and memo-building only
2. **Use staging for testing** - Test workflows on stagenet first
3. **Validate addresses** - Use the validateAddress operation
4. **Check inbound addresses** - They change regularly
5. **Monitor network status** - Check for chain halts before transacting

## Development

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the project
npm run build

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:
- Passes all linting rules
- Includes appropriate tests
- Updates documentation as needed

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-thorchain/issues)
- **Documentation**: [THORChain Docs](https://docs.thorchain.org)
- **Community**: [THORChain Discord](https://discord.gg/thorchain)

## Acknowledgments

- [THORChain](https://thorchain.org) - The decentralized liquidity protocol
- [Nine Realms](https://ninerealms.com) - API infrastructure
- [n8n](https://n8n.io) - Workflow automation platform
