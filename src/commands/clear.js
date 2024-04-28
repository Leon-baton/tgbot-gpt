const chatgpt = require('../services/ChatGPT');

module.exports = {
    description: 'Почистить диалог с ботом',
    execute: async(ctx) => {
        const { message_id } = await ctx.reply('Чистка диалога...');
        await chatgpt.clearConversation(ctx.from.id);
        await ctx.telegram.editMessageText(ctx.chat.id, message_id, 0, 'Диалог успешно отчищен');
    }
}