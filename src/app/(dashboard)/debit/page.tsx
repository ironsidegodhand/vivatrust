'use client';

import React, { useState } from 'react'
import { GiPiggyBank } from "react-icons/gi"; 
import { FiUser } from "react-icons/fi";

interface DebitHistory {
  account: string;
  amount: number;
  name: string;
  timestamp: Date;
}

const DebitUserPage = () => {
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [debitHistory, setDebitHistory] = useState<DebitHistory[]>([]);

  const handleDebit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountNumber || !amount) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/kyc/debit', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: accountNumber,
          amount: parseFloat(amount)
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`Successfully debited $${amount} from account ${accountNumber}`);
        setAccountNumber('');
        setAmount('');
        
        // Add to debit history
        const newDebit = {
          account: accountNumber,
          amount: parseFloat(amount),
          name: result.userName || 'Unknown User',
          timestamp: new Date()
        };
        
        setDebitHistory(prev => [newDebit, ...prev]);
      } else {
        setError(result.error || 'Failed to process debit');
      }
    } catch (err) {
      setError('An error occurred while processing the debit');
      console.error('Debit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='dashboard'>
      <div className="transfer_p">
        <div className="transfer_p-container">
          <div className='flex items-center gap-1.5'> 
            <GiPiggyBank className='text-3xl' /> 
            <h1>Admin Debit</h1>
          </div>
          
          <div className="transfer_p-content">
            <form onSubmit={handleDebit}>
              <div className="recipient">
                <span className='flex items-center gap-1.5'>
                  <FiUser /> 
                  <h2>Debit User Account</h2>
                </span>
                <div className="receipt">
                  <div className="receipt-content">
                    <h3>Account Number *</h3>
                    <input 
                      type="text" 
                      placeholder='VivaTrust account number'
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="tf-amount">
                <h3>Debit Amount ($USD)</h3>
                <input 
                  type="number" 
                  placeholder='Enter amount to debit' 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              {error && <div className="error_btn">{error}</div>}
              {message && <div className="success_btn">{message}</div>}
              
              <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
                {loading ? 'Processing...' : 'Debit Account'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="tf_Information">
          <h2>Debited Users:</h2>
          {debitHistory.length === 0 ? (
            <p>No debit transactions yet</p>
          ) : (
            <ul>
              {debitHistory.map((debit, index) => (
                <li key={index} className="mb-2 p-2 border-l-4 border-l-red-500 bg-red-50">
                  <div className="flex justify-between">
                    <span className="font-medium">{debit.name}</span>
                    <span className="font-bold text-red-600">
                      -${debit.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Account: {debit.account} - {debit.timestamp.toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebitUserPage;
