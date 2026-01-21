import React, { createContext, useContext, useEffect, useState } from 'react';
import walletService, { Wallet, Transaction, ReportPrices } from '../services/walletService';
import { useAuth } from './AuthContext';

interface WalletContextType {
  balance: number;
  loading: boolean;
  prices: ReportPrices | null;
  transactions: Transaction[];
  refreshBalance: () => Promise<void>;
  earnCredits: (adToken: string) => Promise<boolean>;
  spendCredits: (amount: number, reason: string) => Promise<boolean>;
  fetchTransactions: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  balance: 0,
  loading: true,
  prices: null,
  transactions: [],
  refreshBalance: async () => {},
  earnCredits: async () => false,
  spendCredits: async () => false,
  fetchTransactions: async () => {},
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [prices, setPrices] = useState<ReportPrices | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshBalance = async () => {
    if (!user) return;
    try {
      const uid = (user as any).$id || (user as any).uid || (user as any).id;
      if (!uid) return;
      
      const wallet = await walletService.getBalance(uid);
      setBalance(wallet.balance);
    } catch (error) {
      console.error('Failed to fetch balance', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const uid = (user as any).$id || (user as any).uid || (user as any).id;
      if (!uid) return;

      const data = await walletService.getTransactions(uid);
      if (data && data.documents) {
          setTransactions(data.documents);
      }
    } catch (error) {
       console.error('Failed to fetch transactions', error);
    }
  };

  const initData = async () => {
    if (!user) {
        setBalance(0);
        setTransactions([]);
        setLoading(false);
        return;
    }
    
    const uid = (user as any).$id || (user as any).uid || (user as any).id;
    if (!uid) {
        setLoading(false);
        return;
    }

    setLoading(true);
    try {
      const [wallet, priceList] = await Promise.all([
        walletService.getBalance(uid),
        walletService.getPrices()
      ]);
      setBalance(wallet.balance);
      setPrices(priceList);
    } catch (error) {
      console.error('Wallet Init Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, [user]);

  const earnCredits = async (adToken: string) => {
    if (!user) return false;
    const uid = (user as any).$id || (user as any).uid || (user as any).id;
    if (!uid) return false;

    try {
      const res = await walletService.addCredits(uid, adToken);
      if (res.success) {
        setBalance(res.balance);
        fetchTransactions(); // Update history in background
        return true;
      }
      return false;
    } catch (error) {
      console.error('Earn Credits Error:', error);
      return false;
    }
  };

  const spendCredits = async (amount: number, reason: string) => {
    if (!user) return false;
    const uid = (user as any).$id || (user as any).uid || (user as any).id;
    if (!uid) return false;

    try {
      const res = await walletService.deductCredits(uid, amount, reason);
      if (res.success) {
        setBalance(res.balance);
        fetchTransactions(); // Update history in background
        return true;
      }
      return false;
    } catch (error) {
      console.error('Spend Credits Error:', error);
      // Could allow throwing to handle "Insufficient funds" specifically in UI
      return false;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        loading,
        prices,
        transactions,
        refreshBalance,
        earnCredits,
        spendCredits,
        fetchTransactions,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
