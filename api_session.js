/**
 * Created by anthony on 26/03/2018.
 */
const {ApiSessionHandler} = require('bkendz')
const url = require('url')
const _ = require('lodash')

class ApiSession extends ApiSessionHandler {
    
    static supportedTopics(){
        return []
    }
    
    onMessage(topic, request){
        let presentationid = request.presentationid
        switch (topic){
            case '/slides':
                return this.models.Presentation.findById(presentationid)
                    .then(p => p.getSlides())
                    .then((slides) => {
                        return _.map(slides, (s) => s.toJson())
                    })
        }
    }
    
    onListening(){
        console.log(`[${this.constructor.name}] seeding database`)
        return require('./db_seed')({models: this.models})
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