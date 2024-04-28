const { Schema, model } = require('mongoose');

const Message = Schema({
    role: { type: String, required: true },
    content: { type: String, required: true },
    internal_id: { type: String, required: true }
});

module.exports = model("Message", Message);