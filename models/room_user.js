/**
 * Created by anthony on 07/04/2018.
 */
const DbObject = require('bkendz').DbObject

class RoomUser extends DbObject {
    
    static columnDefs(DataTypes) {
        return {
            roomId: DataTypes.INTEGER,
            userId: DataTypes.INTEGER
        }
    }
    
}

module.exports = RoomUser