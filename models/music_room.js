/**
 * Created by anthony on 07/04/2018.
 */
const DbObject = require('bkendz').DbObject

class MusicRoom extends DbObject {
    
    static columnDefs(DataTypes) {
        return {
            createdById: DataTypes.INTEGER
        }
    }



    addSong(song){
        const models = require('../models')
        return models.RoomSong.create({roomId: this.id, songId: song.id})
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
    }
    
}

module.exports = MusicRoom