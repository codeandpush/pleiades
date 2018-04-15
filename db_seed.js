/**
 * Created by anthony on 14/04/2018.
 */
const _ = require('lodash')

const USERS = [
    {nickname: 'hvcc'},
    {nickname: 'chinwo'},
    {nickname: 'obi'},
    {nickname: 'hawa'},
    {nickname: 'cori'},
]

const SONGS = [
    {title: 'Shayo', name: 'shayo', artistName: 'Bigiano'},
    {title: 'True Love', name: 'true_love', artistName: 'TuFace'},
    {title: 'Mel Gibson', name: 'mel_gibson', artistName: 'Scotland'},
]

const MUSIC_ROOMS = [{createdById: null, name: 'Obi & Nkem Efulu\'s Wedding'}]
const VOTING_ROUNDS = [{startTime: new Date(), roomId: null}]

module.exports = function fn(opts) {
    opts = opts || {}
    let models = opts.models
    
    return Promise.resolve()
        .then(() => {
            return Promise.all(USERS.map((user) => models.User.create(user)))
        })
        .then((users) => {
            
            let room = models.MusicRoom.create(_.merge({}, MUSIC_ROOMS[0], {createdById: users[0].id}))
            return Promise.all([room, Promise.all(SONGS.map(s => models.Song.create(s))), users])
        })
        .then(([room, songs, users]) => {
            
            songs.forEach((song) => {
                room.addSong(song)
            })
            let round = models.VotingRound.create(_.merge({}, VOTING_ROUNDS[0], {roomId: room.id, startTime: new Date()}))
            return Promise.all([round, songs, users])
        })
        .then(([vr, songs, users]) => {
            let bs = [models.Vote.create({roundId: vr.id, voterId: users[0].id, songId: songs[0].id}),
                models.Vote.create({roundId: vr.id, voterId: users[1].id, songId: songs[0].id}),
            ]
            let tl = [models.Vote.create({roundId: vr.id, voterId: users[3].id, songId: songs[1].id}),
                models.Vote.create({roundId: vr.id, voterId: users[4].id, songId: songs[0].id}),
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
}