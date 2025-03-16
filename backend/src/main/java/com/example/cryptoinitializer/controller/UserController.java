package com.example.cryptoinitializer.controller;

import com.example.cryptoinitializer.model.Transaction;
import com.example.cryptoinitializer.model.UserAccount;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.cryptoinitializer.service.UserService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{userId}/account")
    public UserAccount getUserAccount(@PathVariable String userId) {
        return userService.getUserAccount(userId);
    }

    @GetMapping("/{userId}/transactions")
    public List<Transaction> getUserTransactions(@PathVariable String userId) {
        return userService.getUserTransactions(userId);
    }

    @PostMapping("/{userId}/buy")
    public ResponseEntity<?> buyCrypto(
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {
        try {
            String symbol = request.get("symbol");
            BigDecimal quantity = new BigDecimal(request.get("quantity"));

            Transaction transaction = userService.buyCrypto(userId, symbol, quantity);
            return ResponseEntity.ok(transaction);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{userId}/sell")
    public ResponseEntity<?> sellCrypto(
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {
        try {
            String symbol = request.get("symbol");
            BigDecimal quantity = new BigDecimal(request.get("quantity"));

            Transaction transaction = userService.sellCrypto(userId, symbol, quantity);
            return ResponseEntity.ok(transaction);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{userId}/reset")
    public ResponseEntity<?> resetAccount(@PathVariable String userId) {
        userService.resetAccount(userId);
        return ResponseEntity.ok().build();
    }
}