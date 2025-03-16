import React, { useState, useEffect } from 'react';
import './index.css';
import CryptoList from './components/CryptoList';
import AccountSummary from './components/AccountSummary';
import TransactionHistory from './components/TransactionHistory';
import { getCryptoData, getUserAccount, getUserTransactions, buyCrypto, sellCrypto, resetAccount } from './services/api';

// Generate a random user ID for this session
const userId = 'user-' + Math.random().toString(36).substring(2, 15);

function App() {
  const [cryptoData, setCryptoData] = useState([]);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('market');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial data load
    fetchData();
    
    // Set up polling for crypto data
    const interval = setInterval(() => {
      fetchCryptoData();
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCryptoData(),
        fetchAccountData(),
        fetchTransactionData()
      ]);
      setLoading(false);
    } catch (error) {
      setError('Failed to load data. Please try again.');
      setLoading(false);
    }
  };

  const fetchCryptoData = async () => {
    try {
      const data = await getCryptoData();
      setCryptoData(data);
      return data;
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      setError('Failed to load cryptocurrency data.');
      return [];
    }
  };

  const fetchAccountData = async () => {
    try {
      const accountData = await getUserAccount(userId);
      setAccount(accountData);
      return accountData;
    } catch (error) {
      console.error('Error fetching account data:', error);
      setError('Failed to load account data.');
      return null;
    }
  };

  const fetchTransactionData = async () => {
    try {
      const transactionData = await getUserTransactions(userId);
      setTransactions(transactionData);
      return transactionData;
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      setError('Failed to load transaction history.');
      return [];
    }
  };

  const handleBuy = async (symbol, quantity) => {
    try {
      await buyCrypto(userId, symbol, quantity);
      await fetchAccountData();
      await fetchTransactionData();
      setError(null);
    } catch (error) {
      console.error('Error buying crypto:', error);
      setError(error.response?.data || 'Failed to complete purchase. Please try again.');
    }
  };

  const handleSell = async (symbol, quantity) => {
    try {
      await sellCrypto(userId, symbol, quantity);
      await fetchAccountData();
      await fetchTransactionData();
      setError(null);
    } catch (error) {
      console.error('Error selling crypto:', error);
      setError(error.response?.data || 'Failed to complete sale. Please try again.');
    }
  };

  const handleReset = async () => {
    try {
      await resetAccount(userId);
      await fetchAccountData();
      await fetchTransactionData();
      setError(null);
    } catch (error) {
      console.error('Error resetting account:', error);
      setError('Failed to reset account. Please try again.');
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Crypto Trading Simulator</h1>
        <button className="btn btn-danger" onClick={handleReset}>
          Reset Account
        </button>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <AccountSummary account={account} cryptoData={cryptoData}/>

          <div className="tab-container">
            <div className="tab-buttons">
              <button 
                className={`tab-button ${activeTab === 'market' ? 'active' : ''}`}
                onClick={() => setActiveTab('market')}
              >
                Market
              </button>
              <button 
                className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`}
                onClick={() => setActiveTab('portfolio')}
              >
                Portfolio
              </button>
              <button 
                className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
                onClick={() => setActiveTab('transactions')}
              >
                Transaction History
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'market' && (
                <CryptoList 
                  cryptoData={cryptoData} 
                  onBuy={handleBuy} 
                  onSell={handleSell}
                  holdings={account?.holdings || {}}
                />
              )}
              
              {activeTab === 'portfolio' && (
  <div>
    <h2>Your Holdings</h2>
    {Object.keys(account?.holdings || {}).length === 0 ? (
      <p>You don't have any cryptocurrency holdings yet.</p>
    ) : (
      <ul className="holdings-list">
        {Object.entries(account?.holdings || {}).map(([symbol, amount]) => {
          const crypto = cryptoData.find(c => c.symbol === symbol);
          const currPrice = crypto ? parseFloat(crypto.price) : null;
          const totalValue = currPrice ? currPrice * parseFloat(amount) : 0;
          
          // Find the earliest "BUY" transaction for this crypto
          const buyTransactions = transactions
          .filter(tx => tx.cryptoSymbol === symbol && tx.type === 'BUY')
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort descending (latest first)
          
          const boughtAt = buyTransactions.length > 0 ? parseFloat(buyTransactions[0].price) : null;
                    
          // Function to format price with appropriate decimal places
          const formatPrice = (price) => {
            if (!price) return 'N/A';
                       
            const numPrice = parseFloat(price);
                       
            // For very small prices (less than $0.01), show more decimal places
            if (numPrice < 0.01) {
              // Count significant zeros after decimal
              const priceStr = numPrice.toString();
              const decimalPart = priceStr.split('.')[1];
              let significantZeros = 0;
                           
              if (decimalPart) {
                for (let i = 0; i < decimalPart.length; i++) {
                  if (decimalPart[i] === '0') {
                    significantZeros++;
                  } else {
                    break;
                  }
                }
              }
                           
              // Show at least 6 decimals for very small prices or more if needed
              const decimals = Math.max(6, significantZeros + 2);
              return `$${numPrice.toFixed(decimals)}`;
            }
                       
            // For normal prices use 2 decimals
            return `$${numPrice.toFixed(2)}`;
          };
          
          return (
            <li key={symbol} className="holdings-item">
              <div>
                <strong>{crypto ? crypto.name : symbol}</strong>
                <div>{parseFloat(amount).toFixed(8)} {symbol.split('/')[0]}</div>
              </div>
              <div>
                <div><strong>Curr Price:</strong> {formatPrice(currPrice)}</div>
                <div><strong>Last Bought At:</strong> {formatPrice(boughtAt)}</div>
                <div><strong>Total Value:</strong> {formatPrice(totalValue)}</div>
              </div>
              <div className="buy-sell-form">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => {
                    const qty = prompt(`How much ${symbol.split('/')[0]} do you want to sell?`);
                    if (qty) handleSell(symbol, qty);
                  }}
                >
                  Sell
                </button>
                <button
                  className="btn btn-danger btn-sm ms-2"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to sell all of your ${symbol.split('/')[0]}?`)) {
                      handleSell(symbol, amount);
                    }
                  }}
                >
                  Sell All
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </div>
)}
              
              {activeTab === 'transactions' && (
                <TransactionHistory transactions={transactions} cryptoData={cryptoData} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;