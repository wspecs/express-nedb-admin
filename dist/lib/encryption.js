"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const express_starter_config_1 = require("express-starter-config");
const bcrypt = require('bcryptjs');
const ALGORITHM = express_starter_config_1.serverConfig.encryptionAlgorithm;
const BLOCK_SIZE = express_starter_config_1.serverConfig.encryptionBlocksize;
const ENCRYPTION_KEY = express_starter_config_1.serverConfig.encryptionKey;
function afterSerialization(plaintext) {
    // Generate random IV.
    const iv = crypto.randomBytes(BLOCK_SIZE);
    // Create cipher from key and IV.
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    // Encrypt record and prepend with IV.
    const ciphertext = Buffer.concat([
        iv,
        cipher.update(plaintext),
        cipher.final()
    ]);
    // Encode encrypted record as Base64.
    return ciphertext.toString('base64');
}
exports.afterSerialization = afterSerialization;
function beforeDeserialization(ciphertext) {
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
exports.beforeDeserialization = beforeDeserialization;
function hashInfo(input) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(input, salt);
    return { salt, hash };
}
exports.hashInfo = hashInfo;
function compareHash(input, hash) {
    return bcrypt.compareSync(input, hash);
}
exports.compareHash = compareHash;
