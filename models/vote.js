/**
 * Created by anthony on 07/04/2018.
 */
const DbObject = require('bkendz').DbObject

class Vote extends DbObject {
    
    static columnDefs(DataTypes) {
        return {
            roundId: DataTypes.INTEGER,
            voterId: DataTypes.INTEGER,
            songId: DataTypes.INTEGER,
        }
    }

    static associate(models){
        models.Vote.belongsTo(models.User, {
            foreignKey: 'voterId', as: 'voter'
        })

        models.Vote.belongsTo(models.Song, {
            foreignKey: 'songId', as: 'song'
        })

        models.Vote.belongsTo(models.VotingRound, {
            foreignKey: 'roundId', as: 'round'
        })
    }

}

module.exports = Vote