const DbObject = require('bkendz').DbObject

class Session extends DbObject {

    static scopeDefs() {
        return {}
    }

    static columnDefs(DataTypes) {
        return {
            accessToken: DataTypes.STRING,
            userId: DataTypes.INTEGER,
            userAgent: DataTypes.STRING,
        }
    }

    static associate(models) {
        models.Session.belongsTo(models.User, {
            foreignKey: 'userId', as: 'user'
        })
    }

    isPublic(){
        return _.isEmpty(this.accessToken)
    }
}

module.exports = Session