/**
 * Created by anthony on 07/04/2018.
 */
const DbObject = require('bkendz').DbObject

class Vote extends DbObject {
    
    static columnDefs(DataTypes) {
        return {
            roundId: DataTypes.INTEGER,
            userId: DataTypes.INTEGER,
            songId: DataTypes.INTEGER,
        }
    }
    
}

module.exports = Vote