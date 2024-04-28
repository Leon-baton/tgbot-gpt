const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);

const EventsLoader = async(bot) => {
    const eventFiles = await readdir("src/events");

    for (const file of eventFiles) {
        if (!file.endsWith(".js")) return;

        const event = require(`../events/${file}`);
        if (event.once) {
            bot.once(event.name, (...args) => event.execute(...args));
        } else {
            bot.on(event.name, (...args) => event.execute(...args));
        }
    }
}

module.exports = EventsLoader;