package com.example.cryptoinitializer.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Transaction {
    public enum TransactionType {
        BUY, SELL
    }

    private String id;
    private String userId;
    private String cryptoSymbol;
    private TransactionType type;
    private BigDecimal quantity;
    private BigDecimal price;
    private BigDecimal total;
    private LocalDateTime timestamp;
    private BigDecimal profitLoss;

    public Transaction() {
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCryptoSymbol() { return cryptoSymbol; }
    public void setCryptoSymbol(String cryptoSymbol) { this.cryptoSymbol = cryptoSymbol; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public BigDecimal getProfitLoss() { return profitLoss; }
    public void setProfitLoss(BigDecimal profitLoss) { this.profitLoss = profitLoss; }
}