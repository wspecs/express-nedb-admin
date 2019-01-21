import * as crypto from 'crypto';
import { serverConfig } from 'express-starter-config';
const bcrypt = require('bcryptjs');

const ALGORITHM = serverConfig.encryptionAlgorithm;
const BLOCK_SIZE = serverConfig.encryptionBlocksize;
const ENCRYPTION_KEY = serverConfig.encryptionKey;

export function afterSerialization(plaintext: string) {
  // Generate random IV.
  const iv = crypto.randomBytes(BLOCK_SIZE);
  // Create cipher from key and IV.
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  // Encrypt record and prepend with IV.
  const ciphertext = Buffer.concat([
    iv,
    cipher.update((plaintext as {}) as Buffer),
    cipher.final()
  ]);
  // Encode encrypted record as Base64.
  return ciphertext.toString('base64');
}

export function beforeDeserialization(ciphertext: string) {
  // Decode encrypted record from Base64.
  const ciphertextBytes = Buffer.from(ciphertext, 'base64');
  // Get IV from initial bytes.
  const iv = ciphertextBytes.slice(0, BLOCK_SIZE);
  // Get encrypted data from remaining bytes.
  const data = ciphertextBytes.slice(BLOCK_SIZE);
  // Create decipher from key and IV.
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  // Decrypt record.
  const plaintextBytes = Buffer.concat([
    decipher.update(data),
    decipher.final()
  ]);

  // Encode record as UTF-8.
  return plaintextBytes.toString();
}

export function hashInfo(input: string) {
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(input, salt);
  return { salt, hash };
}

export function compareHash(input: string, hash: string) {
  return bcrypt.compareSync(input, hash);
}
