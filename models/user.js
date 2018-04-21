/**
 * Created by anthony on 07/04/2018.
 */
const DbObject = require('bkendz').DbObject

class User extends DbObject {
    
    static columnDefs(DataTypes) {
        return {
            nickname: DataTypes.STRING,
            email: DataTypes.STRING,
            passwordHash: DataTypes.STRING,
            password: {
                type: DataTypes.VIRTUAL,
                set: function (val) {
                    const bcrypt = require('bcrypt')
                    const salt = bcrypt.genSaltSync()

                    this.setDataValue('password', val); // Remember to set the data value, otherwise it won't be validated
                    this.setDataValue('passwordHash', bcrypt.hashSync(val, salt));
                }
            }
        }
    }
    
}

module.exports = User