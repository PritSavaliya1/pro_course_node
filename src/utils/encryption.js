const crypto = require("crypto");
const config = require("config");

const API_KEY_ENC = config.get("API_KEY_ENC");
const API_ENCRYPT_IV_KEY = config.get("API_ENCRYPT_IV_KEY");
const ENCRYPTION_METHOD = config.get("encryption_method");

if (!API_KEY_ENC || !API_ENCRYPT_IV_KEY || !ENCRYPTION_METHOD) {
    throw new Error('API_KEY_ENC, API_ENCRYPT_IV_KEY, and encryption_method are required');
}

const KEY_ENC = crypto
    .createHash('sha512')
    .update(API_KEY_ENC)
    .digest('hex')
    .substring(0, 32);

const ENCRYPT_IV_KEY = crypto
    .createHash('sha512')
    .update(API_ENCRYPT_IV_KEY)
    .digest('hex')
    .substring(0, 16);

async function encryptedDataResponse(data) {
    const cipher = crypto.createCipheriv("aes-256-cbc", KEY_ENC, ENCRYPT_IV_KEY);
    const message = data ? JSON.stringify(data) : "";
    let encryptedData = cipher.update(message, "utf-8", "base64");
    encryptedData += cipher.final("base64");

    const mac = crypto.createHmac('sha256', KEY_ENC)
        .update(Buffer.from(Buffer.from(ENCRYPT_IV_KEY).toString("base64") + encryptedData, "utf-8").toString())
        .digest('hex');

    return {
        'mac': mac,
        'value': encryptedData
    };
}

async function EncryptData(req, res, data) {
    return await encryptedDataResponse(data);
}

module.exports = { EncryptData };