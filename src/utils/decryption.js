const crypto = require("crypto");
const config = require("config");

const APT_KEY_DEC = config.get("APT_KEY_DEC");
const APT_DECRYPT_IV_KEY = config.get("APT_DECRYPT_IV_KEY");
const ENCRYPTION_METHOD = config.get("encryption_method");

if (!APT_KEY_DEC || !APT_DECRYPT_IV_KEY || !ENCRYPTION_METHOD) {
    throw new Error('API_KEY_ENC, API_ENCRYPT_IV_KEY, and encryption_method are required');
}

const KEY_DEC = crypto
    .createHash('sha512')
    .update(APT_KEY_DEC)
    .digest('hex')
    .substring(0, 32);

const DECRYPT_IV_KEY = crypto
    .createHash('sha512')
    .update(APT_DECRYPT_IV_KEY)
    .digest('hex')
    .substring(0, 16);

function decryptData(mac, value) {
    try {
        const buff = Buffer.from(value, 'base64')
        const decipher = crypto.createDecipheriv(ENCRYPTION_METHOD, KEY_DEC, DECRYPT_IV_KEY)
        let decrypted = decipher.update(buff.toString('hex'), 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return JSON.parse(decrypted);
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

module.exports = { decryptData };