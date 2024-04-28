const { Schema, model } = require('mongoose');
const findorcreate = require('mongoose-findorcreate');

const Conversation = Schema({
    uid: { type: String, default: null },
  
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    mode: { type: Number, default: 1 },
    internal_id: { type: String, default: '' },
    current_node: { type: String, default: '' }
});

Conversation.plugin(findorcreate);
module.exports = model("Conversation", Conversation)