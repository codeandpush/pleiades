/**
 * Created by anthony on 07/04/2018.
 */
const DbObject = require('bkendz').DbObject

class VotingRound extends DbObject {
    
    static columnDefs(DataTypes) {
        return {
            roundId: DataTypes.INTEGER,
            roomId: DataTypes.INTEGER,
            startTime: DataTypes.DATE
        }
    }
    
}

module.exports = VotingRound