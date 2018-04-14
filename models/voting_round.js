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
                let voteTally = votes.reduce(function(tally, vote) {
                    tally[vote.songId] = (tally[vote.songId] || 0) + 1;
                    return tally;
                }, {});
                let songWithMostVote = Object.keys(voteTally).reduce(function(a, b){ return voteTally[a] > voteTally[b] ? a : b });
                let models = require('../models')
                return models.Song.findById(parseInt(songWithMostVote))
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