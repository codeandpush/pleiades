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
    
}

module.exports = MusicRoom