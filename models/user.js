/**
 * Created by anthony on 07/04/2018.
 */
const DbObject = require('bkendz').DbObject

class User extends DbObject {
    
    static columnDefs(DataTypes) {
        return {
            nickname: DataTypes.STRING
        }
    }
    
}

module.exports = User