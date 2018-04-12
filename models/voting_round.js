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
        return 'Haminata Vintu Camara Camara Camara'
    }
    
}

module.exports = VotingRound