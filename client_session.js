/**
 * Created by anthony on 26/03/2018.
 */
const {SessionHandler} = require('bkendz')
const _ = require('lodash')
const path = require('path')

SessionHandler.DEFAULT_API_URL = '//localhost:64321'

class ClientSession extends SessionHandler {
    
    static supportedTopics() {
        return ['/', '/test']
    }
    
    onMessage(topic, request, src) {
        console.log(`[${this.constructor.name}#onMessage] topic=%s, source=%s`, topic, src)
        switch (topic) {
            case '/':
                return {render: ['index']}

            case '/room/admin/votingtally':
                return {render: ['vote_status']}
            case '/test':
                console.log('[Socket Recieved]', _.omit(request, 'conn'))
                return {data: 'Got it!'}
        }
    }

    setupBasicMiddleware(){
        this.messageHandlers.http.get('/room/:id', function(req, res, next) {
            console.log('PARAM:', req.params.id, ' FilePath:', path.resolve(__dirname, 'views/vote_status.ejs'))
            let fileName = path.resolve(__dirname, 'views/vote_status.ejs')
            return res.render('vote_status')
        })

        super.setupBasicMiddleware()
    }
    
}

const client = new ClientSession({
    staticPath: path.resolve(__dirname, './src'),
    viewPath: path.resolve(__dirname, './views')
})



module.exports = {ClientSession, default: client}