'use strict';

const _ = require('lodash')

const votes = require('../../db_seed').VOTES

module.exports = {
    up: function (queryInterface, Sequelize) {
        let prods = _(votes)
            .map((value) => _.extend(value, {createdAt: new Date(), updatedAt: new Date()}))
            .value()
        
        return queryInterface.bulkInsert('Votes', prods, {})
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.bulkDelete('Votes', null, {})
    }
};
