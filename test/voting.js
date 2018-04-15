var assert = require('assert');
let models = require('../models')
let seeder = require('../db_seed')
const _ = require('lodash')

describe('voting', () => {
    //
    beforeEach(() => {
        return models.sequelize.sync({force: true})
            .then(() => seeder.seed({models}))
    })

    it('vote user & song', () => {
        return models.Vote.findById(1)
            .then((vote) => {
                return Promise.all([vote.getRound(), vote.getSong(), vote.getVoter()])
            })
            .then(([round, song, user]) => {
                assert.equal(user.nickname, 'hvcc')
                assert.equal(song.artistName, 'Bigiano')
                assert.equal(round.roomId, 1)
            })
    })

    it('first round', () => {
        return models.VotingRound.findById(1)
            .then((vr) => {
                assert.equal(vr.roomId, 1)
                return Promise.all([vr.getVotes(), vr.winner()])
            })
            .then(([votes, winner]) => {
                assert.equal(votes.length, 5)
                assert.equal(winner.artistName, 'TuFace')
            })
    })

    it('room songs', () => {
        return models.MusicRoom.findById(1)
            .then((room) => {
                return room.getSongs()
            })
            .then((songs) => {
                assert.equal(songs.length, 3)
            })
    })
})