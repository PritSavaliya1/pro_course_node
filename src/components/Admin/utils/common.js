const { EncryptData } = require("./encryption");

const sendSuccess = async (req, res, data) => {
    if (req.headers.env && req.headers.env === "test") {
        res.json(data);
    } else {
        const responseData = await EncryptData(req, res, data);
        res.json(responseData);
    }
};

const sendError = async (req, res, message, status) => {
    res.status(status).send(message).json();
  };

module.exports = { sendError, sendSuccess };