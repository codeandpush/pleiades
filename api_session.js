/**
 * Created by anthony on 26/03/2018.
 */
const {ApiSessionHandler} = require('bkendz')
const url = require('url')
const _ = require('lodash')
const Promise = require('bluebird')
var bcrypt = require('bcrypt')
var jwt = require('jwt-simple')

class ApiSession extends ApiSessionHandler {

    static supportedTopics() {
        return ['/fetch', '/authenticate', '/user', '/search', '/create_model', '/grids']
    }

    static publicTopics() {
        return ['/authenticate', '/search']
    }

    onMessage(topic, request, src) {
        
        if(src === 'HTTP/OPTIONS') return {send: 'OK'} // CORS
        
        let accessToken = request.ACCESS_TOKEN || null
        return this.resolveSession(accessToken)
            .catch((e) => {
                if (_.includes(this.constructor.publicTopics(), topic)) {
                    return Promise.resolve(this.models.Session.PUBLIC)
                }else {
                    throw e
                }
            })
            .then((session) => {

                switch (topic) {
                    case '/grids':
                        return {hello: 'api'}
                    case '/user':
                        return this.models.User.findOne({where: {id: session.userId}})
                    case '/fetch':
                        let model = request.model
                        let where = request.where || {}
                        let opts = {where: where}

                        if (!(model in this.models)) throw new Error(`Unknown model: ${model}`)
                        
                        let modelCls = this.models[model]
                        return (_.isString(request.scope) ? modelCls.scope(request.scope) : modelCls)
                            .findAll(opts)
                            .then((rooms) => {
                                return rooms.map((r) => r.toJson())
                            })
                    case '/create_model':
                        return this.models[request.model].create(request.modelArgs).then(m => m.toJson())
                    case '/authenticate':
                        return this.tokens(request)
                    case '/search':
                        return this.onSearch(request)
                    default:
                        console.warn(`[${this.constructor.name}#onMessage] Unknown message (${src}): ${_.omit(request, 'conn')}`)
                }
            })
    }
    
    onSearch(req){
        //console.log('[onSearch]', _.omit(req, 'conn'))
        const models = this.models
        let query = req.q
        let queryLower = query.toLowerCase()
    
        const filter = (modelJson) => {
            for(let val of Object.values(modelJson)){
                if(_.isString(val) && val.toLowerCase().indexOf(queryLower) !== -1){
                    return true
                }
            }
            return false
        }
    
        const toJsonList = (modelName, models) => {
            return models.map((m) => {
                let j = m.toJson()
                j.$type = modelName
                return j
            })
        }
    
        return models.MusicRoom.all()
            .then((items) => {
                let filteredItems = _.filter(toJsonList(models.MusicRoom.name, items), filter)
                return {results: _.concat(filteredItems)}
            })
    }

    SECRET() {
        return 'SECRET'
    }

    resolveSession(token) {
        return Promise.resolve()
            .then(() => {
                console.log('[resolveSession] token:', token)
                let auth = jwt.decode(token, this.SECRET())
                return this.models.Session.findOne({where: {userId: auth.userId}})
                    .then((sess) => {
                        if(_.isObject(sess)) return sess
                        else throw new Error('invalid access token: ' + token)
                    })
            })
    }

    tokens(req) {
        let email = req.email || req.body.email
        //console.log(`[${this.constructor.name}#tokens] getting tokens:`, _.omit(req, 'conn'))
        return api.models.User.findOne({where: {nickname: email}})
            .then((user) => {
                if(!_.isObject(user)) throw new Error('no user with email: ' + email)

                let password = req.password || req.body.password
                let hash = user.passwordHash
                //console.log(`[${this.constructor.name}#tokesn] comparing: password=${req.body.password}, hash=${hash}`)
                return Promise.promisify(bcrypt.compare)(password, hash)
                    .then((isValid) => {
                        if(!isValid) throw new Error('in valid password!')
                        return this.models.Session.create({userId: user.id, email})
                    })
                    .then(() => {

                        let access = jwt.encode({email, userId: user.id}, this.SECRET())
                        console.log('[AccessToken]', access)
                        return {
                            tokens: {
                                access: access,
                                refresh: {}
                            }
                        }
                    })
            })
    }

}

let api = new ApiSession()

api.messageHandlers.http.get('/api/room/:id', function (req, res, next) {
    return res.json([{song: "bank alert"},])
})

api.messageHandlers.http.post('/api/create/playlist', function(req, res, next) {
    let reqData = req.body
    let playlist = reqData.playlist

    var songList = []
    for (let song of playlist) {
        console.log(song);
        let song = models.Song.create(song)
        api.models.RoomSong.create({songId: song.id, roomId: reqData.roomId})
            .then((roomSong) => {
                songList.concat(roomSong)
            })
    }
    return res.json(songList)
})

api.messageHandlers.http.post('/api/create/room', function(req, res, next) {
    let reqData = req.body
    return api.models.MusicRoom.create(reqData)
        .then((room) => {
            res.json(room)
        })
})

api.messageHandlers.http.post('/api/room/vote', function (req, res, next) {
    console.log("voting on song.")
    return res.json([{song: "bank alert"},])
})

const wsHandler = api.messageHandlers.ws

wsHandler.on('db_update', (updates) => {
    for (let subscriberConn of wsHandler.subscribers['db_update'] || []) {
        subscriberConn.send('/subscribe?subject=db_update', {type: 'utf8', data: {updates}})
    }
})

wsHandler.on('subscription_added', (subject) => {
    console.log(`[${api.constructor.name}#subscription_added] sending snapshot`)
    let models = api.models
    
    _.each(models, (cls, modelName) => {
        cls.all().then((records) => {
            let updates = records.map(u => {
                return {changeType: 'NEW', type: modelName, value: u.toJson()}
            })
            wsHandler.emit('db_update', updates)
        })
    })
})

wsHandler.topic('/status', () => {
    return {data: {clients: wsHandler.connections.length}}
})

if (process.env.NODE_ENV !== 'production') {
    wsHandler.topic('/exec', (conn, msg) => {
        let cmd = msg.cmd
        console.log('[EXEC] command:', cmd, msg)
        let buf = require('child_process').execSync(cmd, {stdio: [1, 2, 3]})
        console.log('[EXEC]', buf)
        return {data: {out: buf}}
    })

    wsHandler.topic('/eval', (conn, msg) => {
        let cmd = msg.exp
        console.log('[EVAL] command:', cmd, msg)
        let buf = eval(cmd)
        console.log('[EVAL]', buf)
        return {data: {out: buf}}
    })
}

module.exports = {ApiSession, default: api}