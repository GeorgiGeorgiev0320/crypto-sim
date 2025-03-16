package com.example.cryptoinitializer.controller;

import com.example.cryptoinitializer.model.CryptoCurrency;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.cryptoinitializer.service.CryptoDataService;

import java.util.List;

@RestController
@RequestMapping("/api/crypto")
@CrossOrigin(origins = "*")
public class CryptoController {

    @Autowired
    private CryptoDataService cryptoDataService;

    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }

    @GetMapping("/top20")
    public List<CryptoCurrency> getTop20Cryptocurrencies() {
        return cryptoDataService.getTop20Cryptocurrencies();
    }

    @GetMapping("/zdr")
    public CryptoCurrency getCurrentCryptocurrency() {
        return cryptoDataService.getCryptoCurrency("BTC/USD");
    }
}