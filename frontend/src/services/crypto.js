// frontend/src/services/crypto.js
// Provides E2EE operations using Web Crypto API

// IndexedDB Helper for Private Key Storage
const DB_NAME = 'UnivoidCryptoDB';
const STORE_NAME = 'keys';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const storePrivateKey = async (userId, privateKey) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(privateKey, `privateKey_${userId}`);
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e);
  });
};

export const getStoredPrivateKey = async (userId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(`privateKey_${userId}`);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e);
  });
};

// Generate RSA-OAEP Key Pair
export const generateKeyPair = async (userId) => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );

  // Store Private Key securely in IndexedDB
  await storePrivateKey(userId, keyPair.privateKey);

  // Export keys to JWK format to send to server
  const exportedPublicKey = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const exportedPrivateKey = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
  
  return {
    publicKeyJWK: exportedPublicKey,
    privateKeyJWK: exportedPrivateKey,
    privateKey: keyPair.privateKey,
  };
};

export const importPublicKey = async (jwk) => {
  return await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  );
};

export const importPrivateKeyJWK = async (userId, jwk) => {
  const privateKey = await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['decrypt']
  );
  await storePrivateKey(userId, privateKey);
  return privateKey;
};

// Converts string to ArrayBuffer
const strToArrayBuffer = (str) => {
  return new TextEncoder().encode(str);
};

// Converts ArrayBuffer to base64
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Converts base64 to ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

// Encrypt a message payload
export const encryptMessage = async (text, receiverPublicKeyJWK, senderPublicKeyJWK) => {
  // 1. Generate AES-GCM Session Key
  const aesKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // 2. Encrypt Text with AES Key
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedText = strToArrayBuffer(text);
  const encryptedTextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encodedText
  );

  // 3. Export AES Key (Raw)
  const exportedAesKey = await window.crypto.subtle.exportKey('raw', aesKey);

  // 4. Import Public Keys
  const receiverPubKey = await importPublicKey(receiverPublicKeyJWK);
  const senderPubKey = await importPublicKey(senderPublicKeyJWK);

  // 5. Encrypt AES Key with Receiver's Public Key
  const encryptedKeyForReceiverBuffer = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    receiverPubKey,
    exportedAesKey
  );

  // 6. Encrypt AES Key with Sender's Public Key
  const encryptedKeyForSenderBuffer = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    senderPubKey,
    exportedAesKey
  );

  return {
    encryptedText: arrayBufferToBase64(encryptedTextBuffer),
    iv: arrayBufferToBase64(iv),
    encryptedKeyForReceiver: arrayBufferToBase64(encryptedKeyForReceiverBuffer),
    encryptedKeyForSender: arrayBufferToBase64(encryptedKeyForSenderBuffer),
  };
};

// Decrypt a message payload
export const decryptMessage = async (
  encryptedTextB64,
  ivB64,
  encryptedAesKeyB64,
  privateKey
) => {
  try {
    // 1. Decrypt the AES key using the Private Key
    const encryptedAesKeyBuffer = base64ToArrayBuffer(encryptedAesKeyB64);
    const rawAesKey = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encryptedAesKeyBuffer
    );

    // 2. Import the AES key
    const aesKey = await window.crypto.subtle.importKey(
      'raw',
      rawAesKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // 3. Decrypt the text
    const ivBuffer = base64ToArrayBuffer(ivB64);
    const encryptedTextBuffer = base64ToArrayBuffer(encryptedTextB64);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(ivBuffer) },
      aesKey,
      encryptedTextBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null; // Signals unable to decrypt
  }
};
