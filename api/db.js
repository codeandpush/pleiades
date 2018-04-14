const path = require('path')

const config = {
    "development": {
        "dialect": "sqlite",
        "dialectModulePath": path.resolve(__dirname, '../node_modules/sqlite3/sqlite3.js'),
        "storage": path.resolve(__dirname, "./db/db.development.sqlite")
    },
    "test": {
        "dialect": "sqlite",
        "dialectModulePath": path.resolve(__dirname, '../node_modules/sqlite3/sqlite3.js'),
        "storage": path.resolve(__dirname, "db/db.test.sqlite")
    },
    "production": {
        "username": "DB_USER",
        "password": "DB_PASS",
        "database": "DB_NAME",
        "host": "DB_HOST",
        "dialect": "mysql"
    }
}
console.log('PATH:', JSON.stringify(config, null, 4))
module.exports = config

