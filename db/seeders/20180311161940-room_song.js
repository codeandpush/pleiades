'use strict';

const _ = require('lodash')

const roomSongs = require('../../db_seed').ROOM_SONGS

module.exports = {
    up: function (queryInterface, Sequelize) {
        let prods = _(roomSongs)
            .map((value) => _.extend(value, {createdAt: new Date(), updatedAt: new Date()}))
            .value()
        
        return queryInterface.bulkInsert('RoomSongs', prods, {})
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.bulkDelete('RoomSongs', null, {})
    }
};
