/**
 * Created by anthony on 07/04/2018.
 */
const DbObject = require('bkendz').DbObject
const _ = require('lodash')

class MusicRoom extends DbObject {
    
    static columnDefs(DataTypes) {
        return {
            createdById: DataTypes.INTEGER,
            name: DataTypes.STRING,
            genreId: DataTypes.INTEGER
        }
    }
    
    toJson(){
        let json = super.toJson(...arguments)
        return _.omit(json, 'models')
    }
    
    get models(){
        return require('../models').sequelize.models
    }

    addSong(song){
        return this.models.RoomSong.create({roomId: this.id, songId: song.id})
    }

    getSongs(){
        let options = {include:[{model: this.models.Song, as: 'song'}],
            where: {
                roomId: this.get('id')
            }
        }
        return this.models.RoomSong.findAll(options)
            .then((rSongs) => {
                return rSongs.map(rs => rs.song)
            })
    }

    static associate(models){
        // has many rounds
        // has many songs
        // belongs to user
        models.MusicRoom.belongsTo(models.User, {
            foreignKey: 'createdById', as: 'createdBy'
        })

        models.MusicRoom.hasMany(models.RoomSong, {
            foreignKey: 'roomId', as: 'roomSongs'
        })
    
        models.MusicRoom.hasMany(models.VotingRound, {
            foreignKey: 'roomId', as: 'votingRounds'
        })
    }
    
}

module.exports = MusicRoom