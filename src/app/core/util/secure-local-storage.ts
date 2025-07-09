import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'resume-matcher-premium-key'; // Change to env var in prod

export class SecureLocalStorage {
  static setItem(key: string, value: string) {
    const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
    localStorage.setItem(key, encrypted);
  }

  static getItem(key: string): string | null {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return null;
    }
  }

  static clear() {
    localStorage.clear();
  }
}
