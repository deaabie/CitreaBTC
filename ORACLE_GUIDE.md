
# Bitcoin Price Oracle Guide

## Overview

The Bitcoin Price Oracle is a critical component that fetches real Bitcoin prices and submits them to the smart contract every 5 minutes to start new prediction rounds.

## Features

- **Multi-API Support**: Uses CoinDesk, CoinGecko, and Coinbase APIs for redundancy
- **Automatic Failover**: If one API fails, it tries the next one
- **5-minute Intervals**: Submits prices exactly every 5 minutes
- **Error Handling**: Robust error handling and logging
- **Graceful Shutdown**: Handles SIGINT for clean shutdown

## Setup Instructions

### 1. Install Dependencies

```bash
npm install axios dotenv
```

### 2. Configure Environment

Create `.env` file with your private key:

```bash
PRIVATE_KEY=your_private_key_here
```

### 3. Deploy Contracts First

```bash
npm run deploy
```

Note the deployed contract addresses from the output.

### 4. Start Oracle

```bash
npm run oracle <PREDICTION_CONTRACT_ADDRESS>
```

Example:
```bash
npm run oracle 0x1234567890abcdef1234567890abcdef12345678
```

## Oracle Architecture

### Price Fetching Strategy

1. **Primary**: CoinDesk API (reliable, free)
2. **Secondary**: CoinGecko API (backup)
3. **Tertiary**: Coinbase API (final fallback)

### Price Submission Process

1. Fetch current Bitcoin price from APIs
2. Round price to nearest dollar
3. Submit to smart contract
4. Contract finalizes previous round and starts new one
5. Wait 5 minutes and repeat

### Error Handling

- **API Failures**: Try next API in sequence
- **Network Issues**: Log error and continue with next cycle
- **Gas Issues**: Log error and retry next cycle
- **Contract Errors**: Log detailed error information

## Manual Operation

### Start Oracle
```bash
node scripts/priceOracle.js <CONTRACT_ADDRESS>
```

### Stop Oracle
Press `Ctrl+C` for graceful shutdown

## Monitoring

The oracle logs important events:
- Price fetches and submissions
- Round transitions
- Error conditions
- Startup and shutdown

## Production Considerations

### Security
- Use secure key management (AWS KMS, Azure Key Vault)
- Run oracle on secure, monitored infrastructure
- Implement alerting for failures

### Reliability
- Set up multiple oracle instances for redundancy
- Monitor oracle health and uptime
- Implement automatic restart mechanisms

### Gas Management
- Monitor gas prices and adjust accordingly
- Set appropriate gas limits for transactions
- Maintain sufficient ETH balance for operations

## Troubleshooting

### Common Issues

1. **"All price APIs failed"**
   - Check internet connectivity
   - Verify API endpoints are accessible
   - Check for rate limiting

2. **"Transaction failed"**
   - Ensure sufficient gas
   - Check private key has ETH balance
   - Verify contract address is correct

3. **"Contract call failed"**
   - Ensure contract is deployed correctly
   - Check if oracle address is contract owner
   - Verify network configuration

### Debug Mode

Add debug logging by modifying the oracle script:

```javascript
console.log('Debug: Price fetched:', price);
console.log('Debug: Transaction hash:', tx.hash);
```

## API Rate Limits

- **CoinDesk**: No official limit (reasonable use)
- **CoinGecko**: 10-30 calls/minute (free tier)
- **Coinbase**: 10,000 calls/hour (free tier)

Current 5-minute interval is well within all limits.

## Integration with Frontend

The oracle operates independently but frontend can:
- Display oracle status
- Show last price update time
- Monitor round transitions
- Alert users of oracle issues

## Future Enhancements

- **Decentralized Oracles**: Integrate with Chainlink or similar
- **Price Aggregation**: Average multiple sources
- **Historical Data**: Store price history on-chain
- **Dynamic Intervals**: Adjust timing based on volatility
