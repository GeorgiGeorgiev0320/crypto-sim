import React, { useState, useEffect } from "react";

function AccountSummary({ account, cryptoData, transactions }) {
  const [prevValue, setPrevValue] = useState(0);
  const [currValue, setCurrValue] = useState(0);
  const [change, setChange] = useState(0);

  useEffect(() => {
    const newValue = calculatePortfolioValue();
    setChange(newValue - currValue);
    setPrevValue(currValue);
    setCurrValue(newValue);
  }, [account, cryptoData]);

  // Calculate dynamic portfolio value
  const calculatePortfolioValue = () => {
    let totalValue = 0;

    if (account.holdings && cryptoData) {
      totalValue += Object.entries(account.holdings).reduce((acc, [symbol, amount]) => {
        const crypto = cryptoData.find((c) => c.symbol === symbol);
        const currPrice = crypto ? parseFloat(crypto.price) : 0;
        return acc + currPrice * parseFloat(amount);
      }, 0);
    }

    return parseFloat(totalValue.toFixed(2));
  };

  // Determine color based on price change with more distinct colors
  const getChangeStyle = () => {
    if (change > 0) return {
      color: "rgb(22, 163, 74)",
      backgroundColor: "rgba(22, 163, 74, 0.1)",
      icon: "+"
    };
    if (change < 0) return {
      color: "rgb(220, 38, 38)",
      backgroundColor: "rgba(220, 38, 38, 0.1)",
      icon: "-"
    };
    return {
      color: "rgb(107, 114, 128)",
      backgroundColor: "transparent",
      icon: ""
    };
  };

  const changeStyle = getChangeStyle();

  return (
    <div className="balance-card bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
      <div className="mb-2">
        <span className="text-gray-600">Available Balance: </span>
        <span className="balance-amount font-medium">
          ${parseFloat(account.balance).toFixed(2)}
        </span>
      </div>
      <div className="mb-2">
        <span className="text-gray-600">Estimated Portfolio Value: </span>
        <span className="balance-amount font-medium transition-all duration-500" style={{ color: changeStyle.color }}>
          ${currValue.toFixed(2)}
        </span>
      </div>
      {change !== 0 && (
        <div 
          className="mt-1 py-1 px-3 rounded-full inline-flex items-center text-sm font-medium transition-all duration-500"
          style={{ 
            backgroundColor: changeStyle.backgroundColor,
            color: changeStyle.color
          }}
        >
          <span className="font-semibold mr-1">{changeStyle.icon}</span>
          ${Math.abs(change).toFixed(2)} ({Math.abs((change / prevValue) * 100).toFixed(2)}%)
        </div>
      )}
    </div>
  );
}

export default AccountSummary;