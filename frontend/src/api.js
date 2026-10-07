import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5256/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to requests if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


const ENCRYPTION_KEY_STRING = 'AuthPortalSecKey2026#SecureP@ss!';

// Encrypt password using Web Crypto API (AES-CBC) before sending over network
async function encryptPassword(plainText) {
  if (!plainText) return '';
  try {
    if (window.crypto && window.crypto.subtle) {
      const enc = new TextEncoder();
      const keyData = enc.encode(ENCRYPTION_KEY_STRING);
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-CBC' },
        false,
        ['encrypt']
      );

      const iv = window.crypto.getRandomValues(new Uint8Array(16));
      const encodedText = enc.encode(plainText);

      const cipherBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-CBC', iv },
        cryptoKey,
        encodedText
      );

      // Prepend IV (16 bytes) to Ciphertext
      const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(cipherBuffer), iv.length);

      // Encode as Base64
      let binary = '';
      for (let i = 0; i < combined.byteLength; i++) {
        binary += String.fromCharCode(combined[i]);
      }
      return 'ENC:' + btoa(binary);
    }
  } catch (err) {
    console.error('Password encryption failed:', err);
  }
  return plainText;
}

export const api = {
  async getCaptcha() {
    const res = await client.get('/auth/captcha');
    return res.data?.data;
  },

  async login(email, password, captchaId, captchaCode) {
    const encryptedPassword = await encryptPassword(password);
    const res = await client.post('/auth/login', {
      email,
      password: encryptedPassword,
      captchaId,
      captchaCode,
    });
    if (res.data?.success && res.data?.data) {
      const { token, ...user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user, token, message: res.data.message };
    }
    return { success: false, message: res.data?.message || 'Login failed.' };
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },
};

export default client;
