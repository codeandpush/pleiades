const DbObject = require('bkendz').DbObject

class RoomSong extends DbObject {

    static isJunction(){
        return true
    }

    static columnDefs(DataTypes) {
        return {
            songId: DataTypes.INTEGER,
            roomId: DataTypes.INTEGER,
        }
    }

    static associate(models){
        models.RoomSong.belongsTo(models.MusicRoom, {
            foreignKey: 'roomId', as: 'room'
        })

        models.RoomSong.belongsTo(models.Song, {
            foreignKey: 'songId',
            constraints: false,
            as: 'song'
        })
    }

}

module.exports = RoomSong