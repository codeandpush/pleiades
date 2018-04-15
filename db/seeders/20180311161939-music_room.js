'use strict';

const _ = require('lodash')

const users = require('../../db_seed').MUSIC_ROOMS

module.exports = {
    up: function (queryInterface, Sequelize) {
        let userIds = [1, 2, 3, 4, 5]
        let prods = _(users)
            .map((value, index) => _.extend(value, {createdById: userIds[index], createdAt: new Date(), updatedAt: new Date()}))
            .value()
        
        return queryInterface.bulkInsert('MusicRooms', prods, {})
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.bulkDelete('MusicRooms', null, {})
    }
};
