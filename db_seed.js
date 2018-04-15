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

const MUSIC_ROOMS = [{createdById: 1, name: 'Obi & Nkem Efulu\'s Wedding'}]
const ROOM_SONGS = [
    {songId: 1, roomId: 1},
    {songId: 2, roomId: 1},
    {songId: 3, roomId: 1},
    ]

const VOTING_ROUNDS = [{startTime: new Date(), roomId: 1}]

const VOTES = [
    {roundId: 1, voterId: 1, songId: 1},
    {roundId: 1, voterId: 2, songId: 1},
    
    {roundId: 1, voterId: 4, songId: 2},
    {roundId: 1, voterId: 5, songId: 2},
    
    {roundId: 1, voterId: 3, songId: 3},
]

module.exports = {MUSIC_ROOMS, VOTING_ROUNDS, USERS, SONGS, VOTES, ROOM_SONGS}

module.exports.seed = function fn(opts) {
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
    
            let roomSongs = Promise.all(ROOM_SONGS.map(roomSong => models.RoomSong.create(roomSong)))
            
            let round = models.VotingRound.create(_.merge({}, VOTING_ROUNDS[0], {roomId: room.id, startTime: new Date()}))
            return Promise.all([round, songs, users, roomSongs])
        })
        .then(() => {
            return Promise.all(VOTES.map((vote) => models.Vote.create(vote)))
        })
}