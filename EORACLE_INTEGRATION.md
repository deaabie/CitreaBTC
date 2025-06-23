# eOracle Integration Guide

## Overview

This Bitcoin Price Prediction app integrates with eOracle's decentralized price feeds on Plume Testnet for reliable, on-chain BTC/USD price data.

## eOracle Configuration

### BTC/USD Price Feed Details
- **Address**: `0x1E89dA0C147C317f762A39B12808Db1CE42133E2`
- **Decimals**: 8
- **Network**: Plume Testnet (Chain ID: 98867)
- **Interface**: AggregatorV3Interface compatible

## Smart Contract Integration

The `BitcoinPricePrediction.sol` contract uses eOracle's AggregatorV3Interface:

```solidity
interface AggregatorV3Interface {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

// Initialize price feed
priceFeed = AggregatorV3Interface(0x1E89dA0C147C317f762A39B12808Db1CE42133E2);

// Get latest price
function getLatestPrice() public view returns (uint256) {
    (, int256 price, , uint256 timeStamp, ) = priceFeed.latestRoundData();
    require(timeStamp > 0, "Round not complete");
    require(price > 0, "Invalid price");
    return uint256(price); // Returns price with 8 decimals
}
```

## Round Management

Instead of manual price submissions, the system now uses automated round management:

### Round Manager Script
```bash
# Start the round manager
node scripts/roundManager.js <CONTRACT_ADDRESS>
```

The round manager:
- Monitors round completion every 30 seconds
- Automatically starts new rounds when current rounds end
- Fetches real-time prices from eOracle
- Handles reward distribution

### Manual Round Control
Contract owner can manually start new rounds:
```bash
# Using the contract directly
await contract.startNewRound();
```

## Price Data Format

eOracle returns BTC prices with 8 decimal places:
- Raw value: `6543210000000` (represents $65,432.10)
- Formatted: `65432.10` USD

## Benefits of eOracle Integration

1. **Decentralized**: No single point of failure
2. **Reliable**: Multiple data sources aggregated
3. **Real-time**: Continuous price updates
4. **Tamper-proof**: On-chain price verification
5. **Cost-effective**: No external API calls needed

## Testing Price Feed

Test eOracle connection:
```bash
# Debug contract and price feed
npm run debug-contract <CONTRACT_ADDRESS>
```

## Error Handling

Common issues and solutions:

### Price Feed Errors
- **"Round not complete"**: Wait for eOracle to update
- **"Invalid price"**: Check network connection
- **"Revert"**: Verify contract address and network

### Network Issues
- Ensure you're connected to Plume Testnet
- Check RPC endpoint: `https://testnet-rpc.plume.org`
- Verify chain ID: `98867`

## Monitoring

Monitor price feed health:
```javascript
// Check latest update timestamp
const { updatedAt } = await priceFeed.latestRoundData();
const age = Date.now() / 1000 - updatedAt;
console.log(`Price age: ${age} seconds`);
```

## Production Considerations

For mainnet deployment:
1. Verify eOracle feed addresses for mainnet
2. Implement additional price validation
3. Add emergency pause functionality
4. Consider multiple price feed sources
5. Implement governance for feed address updates

## Resources

- [eOracle Documentation](https://eoracle.io/docs)
- [Plume Testnet Explorer](https://testnet-explorer.plume.org/)
- [AggregatorV3Interface Reference](https://docs.chain.link/data-feeds/api-reference)
