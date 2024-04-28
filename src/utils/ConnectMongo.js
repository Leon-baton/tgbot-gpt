const { connect, connection } = require('mongoose');

module.exports = (dbUrl) => {
    connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

    connection.on("connected", () => console.log('MongoDB успешно подключена'));
    connection.on("error", (err) => console.error(`Ошибка при подключении к БД: ${err.message}`));
}