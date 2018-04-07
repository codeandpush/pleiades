/**
 * Created by anthony on 07/04/2018.
 */
const DbObject = require('bkendz').DbObject

class Song extends DbObject {
    
    static scopeDefs() {
        return {}
    }
    
    static columnDefs(DataTypes) {
        return {
            artistName: DataTypes.STRING,
            lyrics: DataTypes.TEXT
        }
    }
    
    static associate(models) {
    
    }
}

module.exports = Song