/**
 * Created by anthony on 26/03/2018.
 */
const {ApiSessionHandler} = require('bkendz')
const url = require('url')
const _ = require('lodash')

class ApiSession extends ApiSessionHandler {
    
    static supportedTopics(){
        return ['/fetch',]
    }
    
    onMessage(topic, request){
        switch (topic){
            case '/fetch':
                let model = request.model
                let where = request.where || {}
                
                if(!(model in this.models)) throw new Error(`Unkown model: ${model}`)
                
                return this.models[model].findAll({where: where})
                    .then((rooms) => {
                    return rooms.map((r) => r.toJson())
                })
        }
    }
    
    onListening(){
        console.log(`[${this.constructor.name}] seeding database`)
        return require('./db_seed')({models: this.models})
    }

    setupBasicMiddleware(){
        console.log("Setting up API middleware")
        this.messageHandlers.http.get('/api/room/:id/songs', function(req, res, next) {
            return [{song:"bank alert"},]
        })
        super.setupBasicMiddleware()
    }
}

let api = new ApiSession()

const wsHandler = api.messageHandlers.ws

wsHandler.on('db_update', (updates) => {
    for (let subscriberConn of wsHandler.subscribers['db_update'] || []) {
        subscriberConn.send('/subscribe?subject=db_update', {type: 'utf8', data: {updates}})
    }
})

wsHandler.on('subscription_added', (subject) => {
    console.log('sending snapshot')
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

if(process.env.NODE_ENV !== 'production'){
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