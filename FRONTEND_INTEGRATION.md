
# Frontend Integration Guide

## Overview

This guide covers integrating the Bitcoin Price Prediction smart contract with the React frontend using native PLUME tokens and eOracle price feeds on Plume Testnet.

## Key Components

### 1. Wallet Integration

The `WalletContext` handles:
- MetaMask connection
- Plume testnet switching
- Native PLUME balance checking
- Transaction signing

```typescript
// Native PLUME balance is automatically handled
const { balance, account, provider } = useWallet();
```

### 2. Contract Interaction with eOracle

All contract interactions use native PLUME and eOracle price feeds:

```typescript
// Place bet with native PLUME
const placeBet = async (isUp: boolean, amount: string) => {
  const tx = await contract.placeBet(isUp, {
    value: ethers.parseEther(amount) // Native PLUME sent as msg.value
  });
  return tx.wait();
};

// Get real-time price from eOracle
const getLatestPrice = async () => {
  const price = await contract.getLatestPrice();
  return Number(price) / 100000000; // Convert from 8 decimals
};

// Claim rewards in native PLUME
const claimRewards = async () => {
  const tx = await contract.claimRewards();
  return tx.wait();
};
```

### 3. Real-time Price Updates

Integration with eOracle for live Bitcoin price data:

```typescript
useEffect(() => {
  const fetchPrice = async () => {
    try {
      const price = await getLatestPrice();
      setCurrentPrice(price);
    } catch (error) {
      console.error('Failed to fetch price from eOracle:', error);
    }
  };

  // Update every 10 seconds
  const interval = setInterval(fetchPrice, 10000);
  return () => clearInterval(interval);
}, []);
```

## Component Architecture

### PredictionInterface Component
- Shows real-time Bitcoin price from eOracle
- Displays current round information
- Handles both connected and demo states
- Updates price every 10 seconds
- Updates round data every 30 seconds

### BetForm Component
- Accepts bet amount in PLUME
- Validates user has sufficient native PLUME balance
- Sends native PLUME with transaction

### RewardsClaim Component
- Shows pending native PLUME rewards
- Claims rewards directly to user's wallet
- No token transfers required

### RoundTimer Component
- Displays current round information from contract
- Shows start/end prices in USD from eOracle
- Manages round transitions

## State Management

### Price State
```typescript
const [currentPrice, setCurrentPrice] = useState(0);
const [previousPrice, setPreviousPrice] = useState(0);
const [isLoading, setIsLoading] = useState(true);
```

### Round State
```typescript
interface Round {
  id: number;
  startTime: number;
  endTime: number;
  startPrice: number; // From eOracle (converted from 8 decimals)
  isActive: boolean;
  finalized: boolean;
}
```

### User State
```typescript
interface UserState {
  account: string;
  balance: string; // Native PLUME balance
  pendingRewards: string; // Native PLUME rewards
  currentBets: Bet[];
}
```

## eOracle Integration

### Price Feed Configuration
- **Feed**: BTC/USD
- **Address**: `0x1E89dA0C147C317f762A39B12808Db1CE42133E2`
- **Decimals**: 8
- **Interface**: AggregatorV3Interface compatible

### Price Data Handling
```typescript
// eOracle returns price with 8 decimals
const formatPrice = (rawPrice: bigint) => {
  return Number(rawPrice) / 100000000;
};

// Display formatted price
const displayPrice = formatPrice(rawPrice).toLocaleString();
```

## Error Handling

### Common Errors with Solutions
1. **eOracle Connection Failed**: Fallback to demo data
2. **Insufficient Balance**: Clear error message to user
3. **Network Issues**: Check Plume testnet connection
4. **Contract Errors**: Validate round status before transactions

### Error Messages
```typescript
const errorMessages = {
  EORACLE_FAILED: 'Unable to fetch live price data. Using demo mode.',
  INSUFFICIENT_BALANCE: 'Insufficient PLUME balance for this bet',
  NETWORK_ERROR: 'Please connect to Plume Testnet',
  ROUND_ENDED: 'Current round has ended. Wait for new round.',
  CONTRACT_ERROR: 'Smart contract error. Check round status.'
};
```

## Real-time Updates

### Event Listeners
```typescript
// Listen for bet placement events
contract.on('BetPlaced', (user, roundId, amount, isUp) => {
  if (user === account) {
    updateUserBets();
  }
});

// Listen for round finalization
contract.on('RoundFinalized', (roundId, endTime, endPrice, isUp) => {
  updateCurrentRound();
  checkPendingRewards();
});

// Listen for reward claims
contract.on('RewardClaimed', (user, amount) => {
  if (user === account) {
    updateBalance();
  }
});
```

### Automatic Updates
- **Price Updates**: Every 10 seconds from eOracle
- **Round Updates**: Every 30 seconds from contract
- **Balance Updates**: After each transaction

## UI Components Integration

### Real-time Price Display
```tsx
const PriceDisplay = () => {
  const { getLatestPrice } = useContract();
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const updatePrice = async () => {
      try {
        const latestPrice = await getLatestPrice();
        setPrice(latestPrice);
        setLoading(false);
      } catch (error) {
        console.error('Price fetch failed:', error);
      }
    };
    
    updatePrice();
    const interval = setInterval(updatePrice, 10000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <h2>Bitcoin Price (eOracle)</h2>
      <span>${loading ? 'Loading...' : price.toLocaleString()}</span>
      <small>Live data from eOracle on Plume Testnet</small>
    </div>
  );
};
```

### Connected vs Demo States
```tsx
const Interface = () => {
  const { isConnected } = useWallet();
  
  if (!isConnected) {
    return <DemoInterface />; // Shows demo data and connection prompt
  }
  
  return <LiveInterface />; // Shows real eOracle data and functionality
};
```

## Performance Optimization

### Efficient Price Updates
- Cache previous price for change calculation
- Use React Query for contract call optimization
- Debounce rapid updates
- Handle loading states gracefully

### Gas Optimization
- Estimate gas before transactions
- Batch multiple contract reads when possible
- Handle gas price fluctuations
- Provide clear gas cost estimates

## Security Considerations

### eOracle Security
- Price feed tamper-proof and decentralized
- Multiple data sources aggregated
- On-chain verification of price data
- No external API dependencies

### Frontend Security
- Validate all user inputs
- Check contract state before transactions
- Handle edge cases gracefully
- Never store private keys

### Transaction Safety
- Always check transaction receipts
- Handle pending states properly
- Implement retry mechanisms
- Clear user feedback

## Native PLUME Best Practices

1. **Use msg.value** for sending PLUME to contracts
2. **Check balances** before attempting transactions
3. **Handle gas costs** in balance calculations
4. **Display amounts clearly** in PLUME units
5. **No token approvals** required
6. **Real-time price updates** from eOracle

## Testing Integration

### Price Feed Tests
```typescript
describe('eOracle Integration', () => {
  it('should fetch real-time BTC price', async () => {
    const price = await getLatestPrice();
    expect(price).toBeGreaterThan(0);
    expect(typeof price).toBe('number');
  });
  
  it('should handle eOracle connection failure', async () => {
    // Mock eOracle failure
    const fallbackPrice = await getPriceWithFallback();
    expect(fallbackPrice).toBeGreaterThan(0);
  });
});
```

### Contract Integration Tests
```typescript
describe('Contract Integration', () => {
  it('should place bet with native PLUME', async () => {
    const amount = '1.0';
    const initialBalance = await provider.getBalance(account);
    
    await placeBet(true, amount);
    
    const finalBalance = await provider.getBalance(account);
    expect(finalBalance.lt(initialBalance)).toBe(true);
  });
});
```

## Deployment Checklist

- [ ] Contract deployed with eOracle integration
- [ ] Frontend connects to Plume testnet
- [ ] eOracle price feed working
- [ ] Real-time price updates functional
- [ ] Native PLUME transactions working
- [ ] Event listeners configured
- [ ] Error handling implemented
- [ ] Demo mode for non-connected users
- [ ] Round management system active
- [ ] Gas estimation working

## Troubleshooting

### eOracle Issues
- **Price not updating**: Check network connection and feed address
- **Invalid price data**: Verify eOracle feed is active
- **Connection timeout**: Implement fallback mechanisms

### Common Solutions
- Refresh MetaMask connection
- Switch to Plume testnet manually
- Check contract deployment status
- Verify eOracle feed health

---

The frontend now fully integrates with eOracle for real-time Bitcoin price data on Plume testnet, providing users with accurate, tamper-proof price feeds for their predictions.
