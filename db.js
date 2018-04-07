const path = require('path')

const config = {
    "development": {
        "dialect": "sqlite",
        "dialectModulePath": path.resolve('./node_modules/sqlite3/sqlite3.js'),
        "storage": "db/db.development.sqlite"
    },
    "test": {
        "dialect": "sqlite",
        "dialectModulePath": path.resolve('./node_modules/sqlite3/sqlite3.js'),
        "storage": "db/db.test.sqlite"
    },
    "production": {
        "username": "DB_USER",
        "password": "DB_PASS",
        "database": "DB_NAME",
        "host": "DB_HOST",
        "dialect": "mysql"
    }
}

module.exports = config

