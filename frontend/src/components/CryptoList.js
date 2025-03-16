import React, { useState, useEffect } from 'react';

function CryptoList({ cryptoData, onBuy, onSell, holdings }) {
  const [buyQuantities, setBuyQuantities] = useState({});
  const [sellQuantities, setSellQuantities] = useState({});
  const [sortedData, setSortedData] = useState([]);
  const [previousPrices, setPreviousPrices] = useState({});
  const [priceColors, setPriceColors] = useState({});
  const [priceDirections, setPriceDirections] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);

  // Sort the crypto data by price (most expensive to least expensive)
  useEffect(() => {
    // Create a deep copy to avoid mutating props
    const sorted = [...cryptoData].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    setSortedData(sorted);
    
    // Check for price changes and update colors
    cryptoData.forEach(crypto => {
      const currentPrice = parseFloat(crypto.price);
      const prevPrice = previousPrices[crypto.symbol];
      
      if (prevPrice && currentPrice !== prevPrice) {
        // Determine price direction
        const direction = currentPrice > prevPrice ? 'up' : 'down';
        const newColor = direction === 'up' ? 'green' : 'red';
        
        // Update the color and direction states
        setPriceColors(prev => ({
          ...prev,
          [crypto.symbol]: newColor
        }));
        
        setPriceDirections(prev => ({
          ...prev,
          [crypto.symbol]: direction
        }));
        
        // Set up fade effect timer
        setTimeout(() => {
          setPriceColors(prev => ({
            ...prev,
            [crypto.symbol]: 'black'
          }));
          
          setPriceDirections(prev => ({
            ...prev,
            [crypto.symbol]: 'none'
          }));
        }, 3000);
      }
    });
    
    // Store current prices for next comparison
    const newPreviousPrices = {};
    cryptoData.forEach(crypto => {
      newPreviousPrices[crypto.symbol] = parseFloat(crypto.price);
    });
    
    // Only update previous prices after initial render
    if (Object.keys(previousPrices).length > 0) {
      setPreviousPrices(newPreviousPrices);
    }
  }, [cryptoData, previousPrices]);

  // Set initial previous prices after first render
  useEffect(() => {
    if (cryptoData.length > 0 && Object.keys(previousPrices).length === 0) {
      const initialPrices = {};
      const initialColors = {};
      const initialDirections = {};
      cryptoData.forEach(crypto => {
        initialPrices[crypto.symbol] = parseFloat(crypto.price);
        initialColors[crypto.symbol] = 'black';
        initialDirections[crypto.symbol] = 'none';
      });
      setPreviousPrices(initialPrices);
      setPriceColors(initialColors);
      setPriceDirections(initialDirections);
    }
  }, [cryptoData]);

  // Auto-hide error message after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleBuyInputChange = (symbol, value) => {
    // Only update if the value is valid (empty or positive)
    if (value === '' || parseFloat(value) >= 0) {
      setBuyQuantities({
        ...buyQuantities,
        [symbol]: value
      });
    } else {
      setErrorMessage("Cannot enter negative quantities");
    }
  };

  const handleSellInputChange = (symbol, value) => {
    // Only update if the value is valid (empty or positive)
    if (value === '' || parseFloat(value) >= 0) {
      setSellQuantities({
        ...sellQuantities,
        [symbol]: value
      });
    } else {
      setErrorMessage("Cannot enter negative quantities");
    }
  };

  const handleBuy = (symbol) => {
    const quantity = buyQuantities[symbol];
    
    if (!quantity || quantity === '') {
      setErrorMessage("Please enter a quantity");
      return;
    }
    
    const numQuantity = parseFloat(quantity);
    
    if (numQuantity <= 0) {
      setErrorMessage("Cannot buy zero or negative quantities");
      return;
    }
    
    onBuy(symbol, quantity);
    // Clear input after purchase
    setBuyQuantities({
      ...buyQuantities,
      [symbol]: ''
    });
  };

  const handleSell = (symbol) => {
    const quantity = sellQuantities[symbol];
    
    if (!quantity || quantity === '') {
      setErrorMessage("Please enter a quantity");
      return;
    }
    
    const numQuantity = parseFloat(quantity);
    
    if (numQuantity <= 0) {
      setErrorMessage("Cannot sell zero or negative quantities");
      return;
    }
    
    onSell(symbol, quantity);
    // Clear input after sale
    setSellQuantities({
      ...sellQuantities,
      [symbol]: ''
    });
  };

  // Function to format price with appropriate decimals
  const formatPrice = (price) => {
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

  // Function to render arrow based on price direction
  const renderPriceArrow = (direction) => {
    if (direction === 'up') {
      return <span style={{ marginLeft: '5px' }}>↑</span>;
    } else if (direction === 'down') {
      return <span style={{ marginLeft: '5px' }}>↓</span>;
    }
    return null;
  };

  return (
    <div>
      <h2>Top 20 Cryptocurrencies</h2>
      
      {/* Error message popup */}
      {errorMessage && (
        <div className="error-popup" style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#f44336',
          color: 'white',
          padding: '15px',
          borderRadius: '5px',
          zIndex: 1000,
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          {errorMessage}
        </div>
      )}
      
      <table className="crypto-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Symbol</th>
            <th>Price (USD)</th>
            <th>Your Holdings</th>
            <th>Trade</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((crypto, index) => {
            const holdingAmount = holdings[crypto.symbol] || 0;
            const holdingValue = parseFloat(holdingAmount) * parseFloat(crypto.price);
            const currentColor = priceColors[crypto.symbol] || 'black';
            const direction = priceDirections[crypto.symbol];
            
            return (
              <tr key={crypto.symbol}>
                <td>{index + 1}</td>
                <td style={{ 
                  color: currentColor,
                  transition: 'color 3s ease'
                }}>
                  {crypto.name}
                </td>
                <td>{crypto.symbol}</td>
                <td style={{ 
                  color: currentColor,
                  transition: 'color 3s ease'
                }}>
                  {formatPrice(crypto.price)}
                  {renderPriceArrow(direction)}
                </td>
                <td>
                  {parseFloat(holdingAmount) > 0 ? (
                    <div>
                      {parseFloat(holdingAmount).toFixed(8)} ({crypto.symbol.split('/')[0]})
                      <div>${holdingValue.toFixed(2)}</div>
                    </div>
                  ) : (
                    '0'
                  )}
                </td>
                <td>
                  <div className="buy-sell-form">
                    <input
                      type="number"
                      className="input-quantity"
                      placeholder="Amount"
                      value={buyQuantities[crypto.symbol] || ''}
                      onChange={(e) => handleBuyInputChange(crypto.symbol, e.target.value)}
                      onKeyDown={(e) => {
                        // Prevent typing negative sign (-)
                        if (e.key === '-' || e.key === 'e') {
                          e.preventDefault();
                        }
                      }}
                      min="0"
                      step="0.00000001"
                    />
                    <button 
                      className="btn btn-success"
                      onClick={() => handleBuy(crypto.symbol)}
                    >
                      Buy
                    </button>
                  </div>
                  
                  {parseFloat(holdingAmount) > 0 && (
                    <div className="buy-sell-form" style={{ marginTop: '10px' }}>
                      <input
                        type="number"
                        className="input-quantity"
                        placeholder="Amount"
                        value={sellQuantities[crypto.symbol] || ''}
                        onChange={(e) => handleSellInputChange(crypto.symbol, e.target.value)}
                        onKeyDown={(e) => {
                          // Prevent typing negative sign (-)
                          if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                          }
                        }}
                        min="0"
                        max={holdingAmount}
                        step="0.00000001"
                      />
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleSell(crypto.symbol)}
                      >
                        Sell
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default CryptoList;