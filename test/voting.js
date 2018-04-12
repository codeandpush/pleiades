var assert = require('assert');
let models = require('../models')

describe('voting', () => {
    //
    beforeEach(() => {
        return models.sequelize.sync({force: true})
            .then(() => {
                return models.VotingRound.create({roomId: 1, startTime: new Date()})
            })
    })

    it('first round', () => {
        models.VotingRound.findById(1)
            .then((vr) => {
                assert.equal(vr.roomId, 1)
                assert.equal(vr.winner(), 'Haminata Vintu Camara Camara Camara')
            })
    })
})