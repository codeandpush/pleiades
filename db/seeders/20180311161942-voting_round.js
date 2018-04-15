'use strict';

const _ = require('lodash')

const votingRounds = require('../../db_seed').VOTING_ROUNDS

module.exports = {
    up: function (queryInterface, Sequelize) {
        let prods = _(votingRounds)
            .map((value) => _.extend(value, {createdAt: new Date(), updatedAt: new Date()}))
            .value()
        
        return queryInterface.bulkInsert('VotingRounds', prods, {})
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.bulkDelete('VotingRounds', null, {})
    }
};
