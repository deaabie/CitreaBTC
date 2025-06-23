
# Frontend Integration Guide

## Overview

This guide covers integrating the Bitcoin Price Prediction smart contract with the React frontend using native cBTC (Citrea's native currency).

## Key Components

### 1. Wallet Integration

The `WalletContext` handles:
- MetaMask connection
- Citrea testnet switching
- Native cBTC balance checking
- Transaction signing

```typescript
// Native cBTC balance is automatically handled
const { balance, account, provider } = useWallet();
```

### 2. Contract Interaction

All contract interactions use native cBTC:

```typescript
// Place bet with native cBTC
const placeBet = async (isUp: boolean, amount: string) => {
  const tx = await contract.placeBet(isUp, {
    value: ethers.parseEther(amount) // Native cBTC sent as msg.value
  });
  return tx.wait();
};

// Claim rewards in native cBTC
const claimRewards = async () => {
  const tx = await contract.claimRewards();
  return tx.wait();
};
```

### 3. Balance Management

No token approvals needed - everything uses native cBTC:

```typescript
// Check user's native cBTC balance
const balance = await provider.getBalance(account);
const formattedBalance = ethers.formatEther(balance);

// Check pending rewards (also in native cBTC)
const pendingRewards = await contract.pendingRewards(account);
const formattedRewards = ethers.formatEther(pendingRewards);
```

## Component Architecture

### BetForm Component
- Accepts bet amount in cBTC
- Validates user has sufficient native cBTC balance
- Sends native cBTC with transaction

### RewardsClaim Component
- Shows pending native cBTC rewards
- Claims rewards directly to user's wallet
- No token transfers required

### RoundTimer Component
- Displays current round information
- Shows start/end prices in USD
- Manages round transitions

## State Management

### Round State
```typescript
interface Round {
  startTime: number;
  endTime: number;
  startPrice: number;
  endPrice: number;
  isUp: boolean;
  finalized: boolean;
}
```

### User State
```typescript
interface UserState {
  account: string;
  balance: string; // Native cBTC balance
  pendingRewards: string; // Native cBTC rewards
  currentBets: Bet[];
}
```

## Error Handling

### Common Errors
1. **Insufficient Balance**: User doesn't have enough native cBTC
2. **Network Issues**: Connection to Citrea testnet fails
3. **Transaction Reverted**: Contract conditions not met
4. **Gas Estimation**: Transaction gas calculation fails

### Error Messages
```typescript
const errorMessages = {
  INSUFFICIENT_BALANCE: 'Insufficient cBTC balance for this bet',
  NETWORK_ERROR: 'Please connect to Citrea Testnet',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  CONTRACT_ERROR: 'Smart contract error. Check round status.'
};
```

## Real-time Updates

### Event Listeners
```typescript
// Listen for bet placement events
contract.on('BetPlaced', (user, roundId, amount, isUp) => {
  if (user === account) {
    // Update user's bet history
    updateUserBets();
  }
});

// Listen for round finalization
contract.on('RoundFinalized', (roundId, endTime, endPrice, isUp) => {
  // Update round display and check for rewards
  updateCurrentRound();
  checkPendingRewards();
});

// Listen for reward claims
contract.on('RewardClaimed', (user, amount) => {
  if (user === account) {
    // Update user's balance and rewards
    updateBalance();
  }
});
```

## UI Components Integration

### Betting Interface
```tsx
const BetForm = () => {
  const { balance } = useWallet();
  const { placeBet } = useContract();
  
  const handleBet = async (amount: string, isUp: boolean) => {
    // Validate native cBTC balance
    if (parseFloat(amount) > parseFloat(balance)) {
      throw new Error('Insufficient cBTC balance');
    }
    
    // Place bet with native cBTC
    await placeBet(isUp, amount);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="number" 
        placeholder="Amount in cBTC"
        max={balance}
      />
      <button type="submit">Place Bet</button>
    </form>
  );
};
```

### Rewards Display
```tsx
const RewardsDisplay = () => {
  const { account } = useWallet();
  const { getPendingRewards, claimRewards } = useContract();
  const [rewards, setRewards] = useState('0');
  
  useEffect(() => {
    if (account) {
      getPendingRewards(account).then(setRewards);
    }
  }, [account]);
  
  return (
    <div>
      <p>Pending Rewards: {rewards} cBTC</p>
      <button onClick={claimRewards}>
        Claim Rewards
      </button>
    </div>
  );
};
```

## Testing Integration

### Frontend Tests
```typescript
describe('Contract Integration', () => {
  it('should place bet with native cBTC', async () => {
    const amount = '1.0';
    const initialBalance = await provider.getBalance(account);
    
    await placeBet(true, amount);
    
    const finalBalance = await provider.getBalance(account);
    expect(finalBalance.lt(initialBalance)).toBe(true);
  });
  
  it('should claim rewards in native cBTC', async () => {
    const initialBalance = await provider.getBalance(account);
    
    await claimRewards();
    
    const finalBalance = await provider.getBalance(account);
    expect(finalBalance.gt(initialBalance)).toBe(true);
  });
});
```

## Performance Optimization

### Efficient Updates
- Use React Query for caching contract calls
- Batch multiple contract reads
- Optimize re-renders with useMemo/useCallback

### Gas Optimization
- Estimate gas before transactions
- Handle gas price fluctuations
- Provide gas estimation to users

## Security Considerations

### Frontend Security
- Validate all user inputs
- Check contract state before transactions
- Handle edge cases gracefully
- Never store private keys in frontend

### Transaction Safety
- Always check transaction receipts
- Handle pending states properly
- Provide clear feedback to users
- Implement retry mechanisms

## Native cBTC Best Practices

1. **Always use msg.value** for sending cBTC to contracts
2. **Check balances** before attempting transactions
3. **Handle gas costs** in balance calculations
4. **Use proper error handling** for failed transfers
5. **Display amounts clearly** in cBTC units
6. **No token approvals** required or needed

## Deployment Checklist

- [ ] Contract deployed with correct address in config
- [ ] Frontend connects to Citrea testnet
- [ ] Native cBTC transactions working
- [ ] Event listeners properly configured
- [ ] Error handling implemented
- [ ] UI displays cBTC amounts correctly
- [ ] Gas estimation working
- [ ] Rewards claiming functional
