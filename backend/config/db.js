const mysql = require('mysql');

const sqlconnect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'practice_db',
    multipleStatements: true
});

sqlconnect.connect((err) => {
    if (!err) {
        console.log('DB connection succeeded');
    } else {
        console.error('DB connection failed:', err.message);
    }
});

module.exports = sqlconnect;