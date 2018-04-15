/**
 * Created by anthony on 26/03/2018.
 */
const {SessionHandler} = require('bkendz')
const _ = require('lodash')
const path = require('path')

SessionHandler.DEFAULT_API_URL = '//localhost:64321'

class ClientSession extends SessionHandler {
    
    static supportedTopics() {
        return ['/']
    }
    
    onMessage(topic, request, src) {
        console.log(`[${this.constructor.name}#onMessage] topic=%s, source=%s`, topic, src)
        switch (topic) {
            case '/':
                return {render: ['index']}
        }
    }
    
}

const client = new ClientSession({
    staticPath: path.resolve(__dirname, './src'),
    viewPath: path.resolve(__dirname, './views')
})



module.exports = {ClientSession, default: client}