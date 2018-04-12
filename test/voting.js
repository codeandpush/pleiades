var assert = require('assert');
let models = require('../models')
let libRoom = require('./data/room')
const _ = require('lodash')

describe('voting', () => {
    //
    beforeEach(() => {
        return models.sequelize.sync({force: true})
            .then(() => {
                let amina = models.User.create({nickname: 'hvcc'})
                let chinwo = models.User.create({nickname: 'chinwo'})
                let obi = models.User.create({nickname: 'obi'})
                let hawa = models.User.create({nickname: 'hawa'})
                let cori = models.User.create({nickname: 'cori'})
                return Promise.all([amina, chinwo, obi, hawa, cori])
            })
            .then((users) => {

                let bs = models.Song.create({name: 'Shayo', artistName: 'Bigiano'})
                let tl = models.Song.create({name: 'True Love', artistName: 'TuFace'})
                let mg = models.Song.create({name: 'Mel Gibson', artistName: 'Scotland'})

                let room = models.MusicRoom.create({
                    createdById: users[0].id,
                    name: 'Obi & Nkem Efulu\'s Wedding'
                })

                return Promise.all([room, Promise.all([bs, tl, mg]), users])
            })
            .then(([room, songs, users]) => {

                songs.forEach((song) => {
                    room.addSong(song)
                })

                return Promise.all([models.VotingRound.create({roomId: room.id, startTime: new Date()}), songs, users])
            })
            .then(([vr, songs, users]) => {
                let bs = [models.Vote.create({roundId: vr.id, voterId: users[0].id, songId: songs[0].id}),
                    models.Vote.create({roundId: vr.id, voterId: users[1].id, songId: songs[0].id}),
                ]
                let tl = [models.Vote.create({roundId: vr.id, voterId: users[3].id, songId: songs[1].id}),
                    models.Vote.create({roundId: vr.id, voterId: users[4].id, songId: songs[1].id}),
                ]
                let mg = [models.Vote.create({roundId: vr.id, voterId: users[2].id, songId: songs[2].id}),
                ]

                return Promise.all([vr, _.flatten(vr, bs, tl, mg)])
            })
            .then(([vr, votes]) => {
                let proms = votes.map((vote) => {
                    console.log(vote)
                    console.log(vote.toJson())
                    return vr.addVote(vote)
                })
                return proms
            })
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
                assert.equal(winner.artistName, 'Bigiano')
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