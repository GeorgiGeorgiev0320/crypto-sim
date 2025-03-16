package com.example.cryptoinitializer.model;

import java.math.BigDecimal;

public class CryptoCurrency {
    private String symbol;
    private String name;
    private BigDecimal price;

    public CryptoCurrency() {}

    public CryptoCurrency(String symbol, String name, BigDecimal price) {
        this.symbol = symbol;
        this.name = name;
        this.price = price;
    }

    // Getters and Setters
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
