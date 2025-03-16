import React from 'react';

function TransactionHistory({ transactions, cryptoData }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <h2>Transaction History</h2>
      
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <div className="transaction-list">
          {transactions.map((transaction) => {
            const crypto = cryptoData.find(c => c.symbol === transaction.cryptoSymbol);
            const cryptoName = crypto ? crypto.name : transaction.cryptoSymbol;
            const isProfitable = transaction.type === 'SELL' && parseFloat(transaction.profitLoss) > 0;
            const isLoss = transaction.type === 'SELL' && parseFloat(transaction.profitLoss) < 0;
            
            return (
              <div key={transaction.id} className="transaction-item">
                <div>
                  <strong>
                    {transaction.type === 'BUY' ? 'Bought' : 'Sold'} {parseFloat(transaction.quantity).toFixed(8)} {cryptoName}
                  </strong>
                  <div>Price: ${parseFloat(transaction.price).toFixed(2)}</div>
                  <div>Total: ${parseFloat(transaction.total).toFixed(2)}</div>
                  {transaction.type === 'SELL' && (
                    <div className={isProfitable ? 'profit' : isLoss ? 'loss' : ''}>
                      {isProfitable ? 'Profit' : isLoss ? 'Loss' : 'Break even'}: 
                      ${Math.abs(parseFloat(transaction.profitLoss)).toFixed(2)}
                    </div>
                  )}
                  <div className="transaction-date">
                    {formatDate(transaction.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;