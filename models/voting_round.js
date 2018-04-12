/**
 * Created by anthony on 07/04/2018.
 */
const DbObject = require('bkendz').DbObject

class VotingRound extends DbObject {
    
    static columnDefs(DataTypes) {
        return {
            roomId: DataTypes.INTEGER,
            startTime: DataTypes.DATE
        }
    }

    winner(){
        return this.getVotes()
            .then((votes) => {
                return votes[0].getSong()
            })
    }

    static associate(models){
        // has many votes
        // belongs to room
        // has many songs

        models.VotingRound.belongsTo(models.MusicRoom, {
            foreignKey: 'roomId', as: 'room'
        })

        models.VotingRound.hasMany(models.Vote, {
            foreignKey: 'roundId', as: 'votes'
        })
    }
    
}

module.exports = VotingRound