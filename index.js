const express = require('express');
const Base = require("./src/Bot");
const bot = new Base(process.env.BOT_TOKEN);
const app = express();

bot.start({
    dbUrl: process.env.DATABASE
});

app.get('/', (req, res) => {
    res.send('бот запущен');
});

app.listen(3000, '0.0.0.0');
