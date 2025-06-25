
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useContract } from '@/hooks/useContract';
import { useWallet } from '@/contexts/WalletContext';
import { ethers } from 'ethers';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface UserBetsTableProps {
  currentRoundId: number;
}

const UserBetsTable: React.FC<UserBetsTableProps> = ({ currentRoundId }) => {
  const { account } = useWallet();
  const { getUserBets } = useContract();
  const [userBets, setUserBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserBets = async () => {
      if (!account || !currentRoundId) return;
      
      setLoading(true);
      try {
        const bets = await getUserBets(currentRoundId, account);
        setUserBets(bets);
      } catch (error) {
        console.error('Error fetching user bets:', error);
        setUserBets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBets();
  }, [account, currentRoundId, getUserBets]);

  if (!account) return null;

  return (
    <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Your Bets (Round #{currentRoundId})</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-gray-400">Loading your bets...</p>
        ) : userBets.length === 0 ? (
          <p className="text-gray-400">No bets placed in current round</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-orange-300">Direction</TableHead>
                <TableHead className="text-orange-300">Amount</TableHead>
                <TableHead className="text-orange-300">Round</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userBets.map((bet, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className={`flex items-center gap-2 ${bet.isUp ? 'text-green-400' : 'text-red-400'}`}>
                      {bet.isUp ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      {bet.isUp ? 'UP' : 'DOWN'}
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    {ethers.formatEther(bet.amount)} cBTC
                  </TableCell>
                  <TableCell className="text-gray-400">
                    #{bet.round.toString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UserBetsTable;
