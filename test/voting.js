var assert = require('assert');
let models = require('../models')
let libRoom = require('./data/room')
const _ = require('lodash')

describe('voting', () => {
    //
    beforeEach(() => {
        return models.sequelize.sync({force: true})
            .then(() => {

                return models.User.create({nickname: 'hvcc'})
            })
            .then((amina) => {

                let bs = models.Song.create({name: 'Shayo', artistName: 'Bigiano'})
                let tl = models.Song.create({name: 'True Love', artistName: 'TuFace'})
                let mg = models.Song.create({name: 'Mel Gibson', artistName: 'Scotland'})

                return Promise.all([models.MusicRoom.create({createdById: amina.id}),
                    Promise.all([bs, tl, mg])
                ])
            })
            .then(([room, songs]) => {

                songs.forEach((song) => {
                    room.addSong(song)
                })
                return models.VotingRound.create({roomId: room.id, startTime: new Date()})
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