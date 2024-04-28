const uuid = require("uuid").v4;

const doRequest = require('./internal/Request.js');
const Conversation = require("../models/Conversation.js");
const Message = require("../models/Message.js");
const config = require('../config.json')

const apiEndpoint = "https://api.openai.com/v1/chat/completions";

class ChatGPT {
    constructor() {
        this.queue = new Map();

        if (process.env.OPENAI_API_KEY) {
            this.api_key = process.env.OPENAI_API_KEY;
        } else {
            throw new Error('Нет токена ChatGPT');
        }
    }

    async clearConversation(userId) {
        const conversation = await Conversation.findOne({ uid: userId });
        if(!conversation) return false;

        conversation.uid = "old_" + conversation.uid + "_" + Date.now().toString();
        await conversation.save();

        return true;
    }

    async createDialog(options) {
        if(!this.queue.has(options.userId)) {
            const dialog = (await Conversation.findOrCreate({ uid: options.userId })).doc;

            dialog.send = async (content) => {
                return await this.sendMessage(options.userId, content)
            };

            dialog.stop = async () => {
                return await this.deleteDialog(options.userId)
            };

            this.queue.set(options.userId, dialog);
        }

        return this.queue.get(options.userId);
    }

    async deleteDialog(userId) {
        this.queue.delete(userId);
    }

    async doApiRequest(data) {
        return await doRequest({
            method: 'POST',
            endpoint: apiEndpoint,
            responseType: 'stream',
            timeout: -1,
            headers: {
                Authorization: `Bearer ${this.api_key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
        });
    }

    async createMessage(dialog, options) {
        if(!options?.internal_id) options.internal_id = uuid();

        const message = new Message({
            role: options.role,
            content: options.content,
            internal_id: options.internal_id
        });
        await message.save();

        await dialog.messages.push(message);
        await dialog.save();

        return message;
    }

    async sendMessage(userId, content) {
        let result = "";
        let previous = "";

        const dialog = await this.queue.get(userId);
        await dialog.populate("messages");

        await this.createMessage(dialog, {
            role: 'user',
            content: content
        });

        const messages = dialog.messages.reduceRight((accumulator, currentValue, i, array) => {
            if((accumulator.join('') + currentValue).length > 800) array.length = 0;
            accumulator.push({ role: currentValue.role, content: currentValue.content });

            return accumulator;
        }, []).reverse();

        const stream = await this.doApiRequest({
            model: config.chatgpt.model,
            messages: messages,
            stream: true
        });

        stream.on("data", (raw) => {
            let cache = raw.toString();
            cache = cache.replace(/\r\n/giu, "\n");

            let rw = previous + cache;
            let sp = rw.split("\n\n");

            for(let i = 0; i < sp.length; i++){
                if(sp[i] == 'data: [DONE]') break;

                try {
                    let parsed = JSON.parse(sp[i].slice("data: ".length));
                    if(typeof parsed == 'object') {
                        if(parsed.choices[0].delta.content != null) result += parsed.choices[0].delta.content;
                    }
                } catch {}
            }

            previous = sp[sp.length-1];
            stream.emit("messageUpdate", result);
        });

        stream.on('close', async () => {
            await this.createMessage(dialog, {
                role: 'assistant',
                content: result
            });
        });

        return stream;
    }
};

module.exports = new ChatGPT();