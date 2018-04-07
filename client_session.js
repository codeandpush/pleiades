/**
 * Created by anthony on 26/03/2018.
 */
const {SessionHandler} = require('bkendz')
const _ = require('lodash')
const path = require('path')

SessionHandler.DEFAULT_API_URL = '//localhost:64321'

class ClientSession extends SessionHandler {

    onMessage(topic, request){
        console.log('Client recieved...', request)
    }

}

const client = new ClientSession({staticPath: path.resolve(__dirname, './src')})

client.messageHandlers.http.set('views', path.resolve(__dirname, './views'))

client.messageHandlers.http.get('/', (req, res) => {
    res.render('index')//, {elemName: 'TEST!!!'})
})

module.exports = {ClientSession, default: client}