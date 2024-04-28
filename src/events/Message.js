const chatgpt = require('../services/ChatGPT');

module.exports = {
	name: 'message',
	once: false,
	async execute(ctx, next) {
        const user = ctx.message.from.id;
        const getQueue = () => { return [...chatgpt.queue.entries()] };
        if (chatgpt.queue.has(user.id)) return ctx.sendMessage('Дождись ответа на предыдущий запрос');
        if (ctx.message.text.length > 3000) return ctx.sendMessage('Твое сообщение слишком длинное, сократи запрос.');
        
        async function startDialog() {
            let reply = null;
            const chat = getQueue()[0][1];

            try {
                const stream = await chat.send(ctx.message.text);
                const { message_id } = await ctx.reply('Началась генерация ответа...');
                
                stream.on("messageUpdate", async (content) => {
                    reply = content;
                });

                const intervalId = setInterval(async () => {
                    if(reply.length <= 1900) {
                        await ctx.telegram.editMessageText(ctx.chat.id, message_id, 0, reply || 'Началась генерация ответа');
                    } else {
                        chat.stop();
                    }
                }, 2000);

                stream.on("end", async () => {
                    clearInterval(intervalId);
                    await ctx.telegram.editMessageText(ctx.chat.id, message_id, 0, reply || 'Бот не может ответить на вопрос');
                    await chat.stop();
                });
            } catch (err) {
                await ctx.sendMessage('Ошибка вылезла: \n' + err);
                return await chat.stop();
            }
        }

        await chatgpt.createDialog({
            userId: user
        });

        let oldPosition = 0;

        const getposition = async () => {
            const position = getQueue().map(el => el[0]).indexOf(user);
            if(position == 0) return await startDialog();

            if(oldPosition !== position) await ctx.sendMessage(`Твой запрос добавлен в очередь. Позиция: ${position}`);
            oldPosition = position;

            setTimeout(getposition, 5000);
        }

        getposition();
        // ctx.sendMessage(ctx.message.text);
	},
};