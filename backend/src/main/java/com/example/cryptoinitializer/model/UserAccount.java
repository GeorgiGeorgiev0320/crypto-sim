package com.example.cryptoinitializer.model;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class UserAccount {
    private static final BigDecimal INITIAL_BALANCE = new BigDecimal("10000.00");

    private String userId;
    private BigDecimal balance;
    private Map<String, BigDecimal> holdings;

    public UserAccount(String userId) {
        this.userId = userId;
        this.balance = INITIAL_BALANCE;
        this.holdings = new HashMap<>();
    }

    public void reset() {
        this.balance = INITIAL_BALANCE;
        this.holdings.clear();
    }

    // Getters and Setters
    public String getUserId() { return userId; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public Map<String, BigDecimal> getHoldings() { return holdings; }
    public void setHoldings(Map<String, BigDecimal> holdings) { this.holdings = holdings; }

    public BigDecimal getHolding(String symbol) {
        return holdings.getOrDefault(symbol, BigDecimal.ZERO);
    }

    public void updateHolding(String symbol, BigDecimal amount) {
        BigDecimal currentAmount = getHolding(symbol);
        BigDecimal newAmount = currentAmount.add(amount);

        if (newAmount.compareTo(BigDecimal.ZERO) <= 0) {
            holdings.remove(symbol);
        } else {
            holdings.put(symbol, newAmount);
        }
    }
}