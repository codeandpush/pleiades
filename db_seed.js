/**
 * Created by anthony on 14/04/2018.
 */
const _ = require('lodash')

module.exports = function (opts) {
    opts = opts || {}
    let models = opts.models
    
    return Promise.resolve()
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