// receipts/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  FiDownload, 
  FiSearch, 
  FiFilter, 
  FiCalendar,
  FiArrowDown,
  FiArrowUp,
  FiEye,
  FiPrinter,
  FiX,
  FiRefreshCw
} from 'react-icons/fi';

interface Transaction {
  _id: string;
  clerkId: string;
  firstName?: string;
  lastName?: string;
  amount: string;
  createdAt: string;
  type?: 'credit' | 'debit';
  description?: string;
}

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isCredit = parseFloat(transaction.amount) > 0;
  const receiptNumber = `RCP-${transaction._id.slice(-8).toUpperCase()}`;
  const formattedDate = new Date(transaction.createdAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">VivaTrust Bank</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Print Receipt"
            >
              <FiPrinter size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6" id="receipt-content">
          {/* Header */}
          <div className="text-center border-b border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-white mb-1">TRANSACTION RECEIPT</h2>
            <p className="text-gray-400">{receiptNumber}</p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isCredit 
                ? 'bg-green-900/50 text-green-400 border border-green-700' 
                : 'bg-red-900/50 text-red-400 border border-red-700'
            }`}>
              {isCredit ? 'CREDIT TRANSACTION' : 'DEBIT TRANSACTION'}
            </span>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-900/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-700">
              <span className="text-gray-400">Amount</span>
              <span className={`text-3xl font-bold ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                {isCredit ? '+' : '-'}${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Name</span>
                <span className="text-white">{transaction.firstName || ''} {transaction.lastName || ''}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Transaction ID</span>
                <span className="text-white font-mono text-sm">{transaction._id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">User ID</span>
                <span className="text-white font-mono text-sm">{transaction.clerkId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Date & Time</span>
                <span className="text-white">{formattedDate}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction Type</span>
                <span className={`${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                  {isCredit ? 'Credit' : 'Debit'}
                </span>
              </div>
              
              {transaction.description && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Description</span>
                  <span className="text-white">{transaction.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm pt-4 border-t border-gray-700">
            <p>This is a computer generated receipt. No signature required.</p>
            <p className="mt-1">For any queries, please contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReceiptsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    credit: 0,
    debit: 0,
    totalAmount: 0
  });

  const { userId, sessionClaims } = useAuth();
  const router = useRouter();

  // perform initial fetch when component mounts
  useEffect(() => {
    fetchAllTransactions();
  }, []);

  // whenever the list or any filter criteria change, update the filtered results
  useEffect(() => {
    filterTransactions();
  }, [searchTerm, filterType, dateFilter, transactions]);

  const fetchAllTransactions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/receipts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      const transactionsWithType = data.transactions.map((t: Transaction) => ({
        ...t,
        type: parseFloat(t.amount) > 0 ? 'credit' : 'debit'
      }));
      
      setTransactions(transactionsWithType);
      calculateStats(transactionsWithType);
    } catch (err) {
      setError('Error loading transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transData: Transaction[]) => {
    const credit = transData.filter(t => parseFloat(t.amount) > 0);
    const debit = transData.filter(t => parseFloat(t.amount) < 0);
    const totalAmount = transData.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

    setStats({
      total: transData.length,
      credit: credit.length,
      debit: debit.length,
      totalAmount
    });
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => 
        filterType === 'credit' ? parseFloat(t.amount) > 0 : parseFloat(t.amount) < 0
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(t => {
        const term = searchTerm.toLowerCase();
        return (
          t._id.toLowerCase().includes(term) ||
          t.clerkId.toLowerCase().includes(term) ||
          (t.firstName && t.firstName.toLowerCase().includes(term)) ||
          (t.lastName && t.lastName.toLowerCase().includes(term))
        );
      });
    }

    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter(t => 
        new Date(t.createdAt).toDateString() === filterDate
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleViewReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'User ID', 'Name', 'Amount', 'Type', 'Date', 'Description'];
    const csvData = filteredTransactions.map(t => [
      t._id,
      t.clerkId,
      `${t.firstName || ''} ${t.lastName || ''}`.trim(),
      t.amount,
      parseFloat(t.amount) > 0 ? 'Credit' : 'Debit',
      new Date(t.createdAt).toLocaleString(),
      t.description || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Transaction Receipts</h1>
          <p className="text-gray-400">View and manage all transaction receipts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Transactions</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Credit Transactions</p>
            <p className="text-2xl font-bold text-green-400">{stats.credit}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Debit Transactions</p>
            <p className="text-2xl font-bold text-red-400">{stats.debit}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Volume</p>
            <p className="text-2xl font-bold text-blue-400">${stats.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Transaction ID or User ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'credit' | 'debit')}
                className="bg-gray-700 border border-gray-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="credit">Credit Only</option>
                <option value="debit">Debit Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiDownload />
              Export CSV
            </button>

            <button
              onClick={fetchAllTransactions}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const isCredit = parseFloat(transaction.amount) > 0;
                    
                    return (
                      <tr key={transaction._id} className="hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            isCredit 
                              ? 'bg-green-900/50 text-green-400' 
                              : 'bg-red-900/50 text-red-400'
                          }`}>
                            {isCredit ? <FiArrowDown /> : <FiArrowUp />}
                            {isCredit ? 'Credit' : 'Debit'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-mono">
                          {transaction._id.slice(-12)}...
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                          {transaction.clerkId.slice(-8)}...
                        </td>                        <td className="px-6 py-4 text-sm text-white">
                          {transaction.firstName || ''} {transaction.lastName || ''}
                        </td>                        <td className={`px-6 py-4 text-sm font-semibold ${
                          isCredit ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {isCredit ? '+' : '-'}${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleViewReceipt(transaction)}
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <FiEye />
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-gray-900 px-6 py-3 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          </div>
        </div>

        {/* Receipt Modal */}
        {selectedTransaction && (
          <ReceiptModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ReceiptsPage;
