package com.example.cryptoinitializer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import com.example.cryptoinitializer.model.CryptoCurrency;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.math.BigDecimal;
import java.net.URI;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CryptoDataService {
    private static final Logger logger = LoggerFactory.getLogger(CryptoDataService.class);
    private static final String KRAKEN_WS_URL = "wss://ws.kraken.com/v2";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private WebSocketSession webSocketSession;
    private WebSocketHandler webSocketHandler;
    private final Map<String, CryptoCurrency> cryptoMap = new ConcurrentHashMap<>();

    // Mapping between symbols and names
    private final Map<String, String> cryptoNames = new HashMap<String, String>() {{
        put("BTC/USD", "Bitcoin");
        put("ETH/USD", "Ethereum");
        put("SOL/USD", "Solana");
        put("XRP/USD", "Ripple");
        put("ADA/USD", "Cardano");
        put("DOT/USD", "Polkadot");
        put("DOGE/USD", "Dogecoin");
        put("SHIB/USD", "Shiba Inu");
        put("MATIC/USD", "Polygon");
        put("LINK/USD", "Chainlink");
        put("AVAX/USD", "Avalanche");
        put("UNI/USD", "Uniswap");
        put("LTC/USD", "Litecoin");
        put("ALGO/USD", "Algorand");
        put("ATOM/USD", "Cosmos");
        put("XTZ/USD", "Tezos");
        put("EOS/USD", "EOS");
        put("BCH/USD", "Bitcoin Cash");
        put("XLM/USD", "Stellar");
        put("TRX/USD", "TRON");
    }};

    @PostConstruct
    public void init() {
        connectWebSocket();
    }

    private void connectWebSocket() {
        try {
            StandardWebSocketClient client = new StandardWebSocketClient();

            webSocketHandler = new TextWebSocketHandler() {
                @Override
                public void handleTextMessage(WebSocketSession session, TextMessage message) {
                    processMessage(message);
                }
            };

            webSocketSession = client.execute(
                    webSocketHandler,
                    new WebSocketHttpHeaders(),
                    URI.create(KRAKEN_WS_URL)
            ).get();

            logger.info("WebSocket connection established successfully");
            sendSubscriptionMessage();
        } catch (Exception e) {
            logger.error("Failed to connect to WebSocket", e);
        }
    }

    private void sendSubscriptionMessage() {
        if (webSocketSession == null || !webSocketSession.isOpen()) {
            logger.warn("WebSocket session is not open, cannot send subscription message");
            return;
        }

        try {
            List<String> pairs = new ArrayList<>(cryptoNames.keySet());

            String subscribeMessage = objectMapper.writeValueAsString(Map.of(
                    "method", "subscribe",
                    "params", Map.of(
                            "channel", "ticker",
                            "symbol", pairs
                    )
            ));

            logger.info("Sending subscription message: {}", subscribeMessage);
            webSocketSession.sendMessage(new TextMessage(subscribeMessage));
        } catch (Exception e) {
            logger.error("Error sending subscription message", e);
        }
    }

    private void processMessage(TextMessage message) {
        try {
            String payload = message.getPayload();
            logger.info("Received WebSocket message: {}", payload);

            JsonNode jsonNode = objectMapper.readTree(payload);

            // Check for either "ticker" type or "update" type
            if (jsonNode.has("type") &&
                    ("ticker".equals(jsonNode.get("type").asText()) || "update".equals(jsonNode.get("type").asText()))) {

                if (jsonNode.has("channel") && "ticker".equals(jsonNode.get("channel").asText())) {
                    JsonNode dataArray = jsonNode.get("data");
                    logger.info("Received ticker data with {} entries", dataArray.size());

                    for (JsonNode tickerData : dataArray) {
                        String symbol = tickerData.get("symbol").asText();
                        logger.info("Processing ticker for symbol: {}", symbol);

                        if (cryptoNames.containsKey(symbol)) {
                            // Handle both array format and direct number format for "ask"
                            BigDecimal price;
                            JsonNode askNode = tickerData.get("ask");

                            if (askNode.isArray()) {
                                price = new BigDecimal(askNode.get(0).asText());
                            } else {
                                price = new BigDecimal(askNode.asText());
                            }

                            cryptoMap.compute(symbol, (k, crypto) -> {
                                if (crypto == null) {
                                    return new CryptoCurrency(symbol, cryptoNames.get(symbol), price);
                                }
                                crypto.setPrice(price);
                                return crypto;
                            });

                            logger.info("Updated price for {}: {}", symbol, price);
                        } else {
                            logger.debug("Ignoring unknown symbol: {}", symbol);
                        }
                    }
                }
            } else if (jsonNode.has("result") && jsonNode.has("method")) {
                // Handle subscription response message
                logger.info("Received response for method '{}': {}",
                        jsonNode.get("method").asText(),
                        jsonNode.get("result").asText());
            }
        } catch (Exception e) {
            logger.error("Error processing WebSocket message", e);
        }
    }

    @Scheduled(fixedDelay = 60000)
    public void checkConnection() {
        if (webSocketSession == null || !webSocketSession.isOpen()) {
            logger.info("WebSocket connection lost, reconnecting...");
            connectWebSocket();
        }
    }

    public List<CryptoCurrency> getTop20Cryptocurrencies() {
        return new ArrayList<>(cryptoMap.values());
    }

    public CryptoCurrency getCryptoCurrency(String symbol) {
        return cryptoMap.get(symbol);
    }
}
