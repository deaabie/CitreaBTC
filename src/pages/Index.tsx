
import React from 'react';
import Header from '@/components/Header';
import PredictionInterface from '@/components/PredictionInterface';
import { WalletProvider } from '@/contexts/WalletContext';

const Index = () => {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <PredictionInterface />
        </main>
      </div>
    </WalletProvider>
  );
};

export default Index;
