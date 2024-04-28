require('dotenv').config();

const { Telegraf } = require('telegraf');

const CommandsLoader = require('./utils/CommandsLoader');
const EventsLoader = require('./utils/EventsLoader');
const ConnectMongo = require('./utils/ConnectMongo');

class SampleBot extends Telegraf {
    constructor(token) {
        super(token);
        
        this.commands = new Map();
    }

    start(options) {
        if(options?.dbUrl) ConnectMongo(options.dbUrl);
        CommandsLoader(this);
        EventsLoader(this);
        
        this.launch()
            .then(console.log('Бот запущен.'))
            .catch(err => console.error('Произошла ошибка при запуске бота: ' + err));

        process.once('SIGINT', () => this.stop('SIGINT'))
        process.once('SIGTERM', () => this.stop('SIGTERM'))
    }
}

module.exports = SampleBot;