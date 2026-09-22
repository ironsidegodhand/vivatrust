'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { FiClock, FiDollarSign, FiUser, FiRefreshCw, FiArrowDown, FiArrowUp } from 'react-icons/fi';

interface Transaction {
  _id: string;
  clerkId: string;
  amount: string;
  createdAt: string;
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userId } = useAuth();

  const fetchTransactionHistory = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/history?clerkId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }
      
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError('Error loading transaction history');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, [userId]);

  const formatCurrency = (amount: string): string => {
    const numericAmount = Math.abs(parseFloat(amount));
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numericAmount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDebit = (amount: string): boolean => {
    return parseFloat(amount) < 0;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <FiClock className="text-xl text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Transaction History</h2>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 w-full rounded-lg shadow-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FiClock className="text-xl text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Transaction History</h2>
        </div>
        <button
          onClick={fetchTransactionHistory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiRefreshCw className={`text-sm ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FiUser className="text-4xl mx-auto mb-3 text-gray-600" />
          <p className="text-lg">No transactions found</p>
          <p className="text-sm text-gray-500 mt-1">Your transaction history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const debit = isDebit(transaction.amount);
            
            return (
              <div
                key={transaction._id}
                className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-700 transition-colors group ${
                  debit 
                    ? 'bg-red-900/20 border-red-700/50 hover:bg-red-900/30' 
                    : 'bg-green-900/20 border-green-700/50 hover:bg-green-900/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors group-hover:bg-opacity-50 ${
                    debit 
                      ? 'bg-red-900/30 group-hover:bg-red-900/50' 
                      : 'bg-green-900/30 group-hover:bg-green-900/50'
                  }`}>
                    {debit ? (
                      <FiArrowUp className="text-red-400 text-lg" />
                    ) : (
                      <FiArrowDown className="text-green-400 text-lg" />
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold text-lg ${
                      debit ? 'text-red-300' : 'text-green-300'
                    }`}>
                      {debit ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatDate(transaction.createdAt)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {debit ? 'Debit Transaction' : 'Credit Transaction'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${
                    debit
                      ? 'bg-red-900/30 text-red-400 border-red-800'
                      : 'bg-green-900/30 text-green-400 border-green-800'
                  }`}>
                    {debit ? 'Debit' : 'Credit'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex justify-center gap-6 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-400">Credit: {transactions.filter(t => !isDebit(t.amount)).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-400">Debit: {transactions.filter(t => isDebit(t.amount)).length}</span>
            </div>
          </div>
          <p className="text-center text-gray-400 text-sm">
            Showing {transactions.length} most recent transactions
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;