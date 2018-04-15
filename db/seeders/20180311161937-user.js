'use strict';

const _ = require('lodash')

const users = require('../../db_seed').USERS

module.exports = {
    up: function (queryInterface, Sequelize) {
        let prods = _(users)
            .map((value) => _.extend(value, {createdAt: new Date(), updatedAt: new Date()}))
            .value()
        
        return queryInterface.bulkInsert('Users', prods, {})
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.bulkDelete('Users', null, {})
    }
};
