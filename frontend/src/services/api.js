import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Fetch crypto data
export const getCryptoData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/crypto/top20`);
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
};

// Fetch user account
export const getUserAccount = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}/account`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user account:', error);
    throw error;
  }
};

// Fetch user account
export const getPortfolioValue = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}/get-portfolio`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user account:', error);
    throw error;
  }
};

// Fetch user transactions
export const getUserTransactions = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}/transactions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    throw error;
  }
};

// Buy cryptocurrency
export const buyCrypto = async (userId, symbol, quantity) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/${userId}/buy`, {
      symbol,
      quantity
    });
    return response.data;
  } catch (error) {
    console.error('Error buying crypto:', error);
    throw error;
  }
};

// Sell cryptocurrency
export const sellCrypto = async (userId, symbol, quantity) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/${userId}/sell`, {
      symbol,
      quantity
    });
    return response.data;
  } catch (error) {
    console.error('Error selling crypto:', error);
    throw error;
  }
};

// Reset account
export const resetAccount = async (userId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/${userId}/reset`);
    return response.data;
  } catch (error) {
    console.error('Error resetting account:', error);
    throw error;
  }
};