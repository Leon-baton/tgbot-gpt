const path = require('path');
const fs = require('fs');

function findFiles(folderPath) {
    const files = []
    folderPath = path.isAbsolute(folderPath) ? folderPath : path.join(process.cwd(), folderPath)
    const folder = fs.readdirSync(folderPath, { withFileTypes: true })

    for(const file of folder) {
        const pathFile = path.join(folderPath, file.name)
        if(file.isDirectory()){
            files.push(...findFiles(pathFile))
            continue
        }
        files.push(pathFile)
    }
    return files;
}

module.exports = (bot) => {
    for(const file of findFiles("./src/commands/")) {
        const commandName = file.split('/commands/')[1].slice(0, -3);
    
        try {
            const { dir, base } = path.parse(file);
            const command = require(file);
    
            bot.command(commandName, command.execute);
            bot.commands.set(commandName, command);
    
            console.log(`Комманда "${commandName}" успешно загружена!`);
        } catch(err) {
            console.error(`Комманда ${commandName} не смогла запуститься. ${err.message.split("\n")[0]}`);
        }
    }

    // bot.telegram.setMyCommands([...bot.commands].map(([name, command]) => ({ command: name, description: command.description || 'Описания нет' })))
}
