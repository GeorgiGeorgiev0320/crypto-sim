package com.example.cryptoinitializer.service;

import com.example.cryptoinitializer.model.CryptoCurrency;
import com.example.cryptoinitializer.model.Transaction;
import com.example.cryptoinitializer.model.UserAccount;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {
    private final Map<String, UserAccount> userAccounts = new ConcurrentHashMap<>();
    private final Map<String, List<Transaction>> userTransactions = new ConcurrentHashMap<>();

    @Autowired
    private CryptoDataService cryptoDataService;

    public UserAccount getUserAccount(String userId) {
        return userAccounts.computeIfAbsent(userId, UserAccount::new);
    }

    public List<Transaction> getUserTransactions(String userId) {
        return userTransactions.computeIfAbsent(userId, k -> new ArrayList<>());
    }

    public Transaction buyCrypto(String userId, String symbol, BigDecimal quantity) {
        UserAccount account = getUserAccount(userId);
        CryptoCurrency crypto = cryptoDataService.getCryptoCurrency(symbol);

        if (crypto == null) {
            throw new IllegalArgumentException("Cryptocurrency not found: " + symbol);
        }

        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        BigDecimal total = crypto.getPrice().multiply(quantity);

        if (total.compareTo(account.getBalance()) > 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        // Update account
        account.setBalance(account.getBalance().subtract(total));
        account.updateHolding(symbol, quantity);

        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setId(UUID.randomUUID().toString());
        transaction.setUserId(userId);
        transaction.setCryptoSymbol(symbol);
        transaction.setType(Transaction.TransactionType.BUY);
        transaction.setQuantity(quantity);
        transaction.setPrice(crypto.getPrice());
        transaction.setTotal(total);
        transaction.setProfitLoss(BigDecimal.ZERO); // No profit/loss for buy transactions

        // Save transaction
        userTransactions.get(userId).add(transaction);

        return transaction;
    }

    public Transaction sellCrypto(String userId, String symbol, BigDecimal quantity) {
        UserAccount account = getUserAccount(userId);
        CryptoCurrency crypto = cryptoDataService.getCryptoCurrency(symbol);

        if (crypto == null) {
            throw new IllegalArgumentException("Cryptocurrency not found: " + symbol);
        }

        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        BigDecimal currentHolding = account.getHolding(symbol);
        if (quantity.compareTo(currentHolding) > 0) {
            throw new IllegalArgumentException("Insufficient holdings");
        }

        BigDecimal total = crypto.getPrice().multiply(quantity);

        // Calculate profit/loss
        BigDecimal avgPurchasePrice = calculateAveragePurchasePrice(userId, symbol);
        BigDecimal purchaseValue = avgPurchasePrice.multiply(quantity);
        BigDecimal profitLoss = total.subtract(purchaseValue);

        // Update account
        account.setBalance(account.getBalance().add(total));
        account.updateHolding(symbol, quantity.negate());

        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setId(UUID.randomUUID().toString());
        transaction.setUserId(userId);
        transaction.setCryptoSymbol(symbol);
        transaction.setType(Transaction.TransactionType.SELL);
        transaction.setQuantity(quantity);
        transaction.setPrice(crypto.getPrice());
        transaction.setTotal(total);
        transaction.setProfitLoss(profitLoss);

        // Save transaction
        userTransactions.get(userId).add(transaction);

        return transaction;
    }

    public void resetAccount(String userId) {
        UserAccount account = getUserAccount(userId);
        account.reset();
        userTransactions.get(userId).clear();
    }

    private BigDecimal calculateAveragePurchasePrice(String userId, String symbol) {
        List<Transaction> transactions = getUserTransactions(userId);
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal totalQuantity = BigDecimal.ZERO;

        for (Transaction transaction : transactions) {
            if (transaction.getCryptoSymbol().equals(symbol) &&
                    transaction.getType() == Transaction.TransactionType.BUY) {
                totalCost = totalCost.add(transaction.getTotal());
                totalQuantity = totalQuantity.add(transaction.getQuantity());
            }
        }

        if (totalQuantity.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return totalCost.divide(totalQuantity, 8, BigDecimal.ROUND_HALF_UP);
    }
}