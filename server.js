/**
 * Created by anthony on 18/03/2018.
 */
const bz = require('bkendz')
const _ = require('lodash')
const clientSession = require('./session')
const apiSession = require('./api/session')

const app = new bz.Bkendz({
    enableOnly: process.env.BZ_PROCESS_NAME || bz.Bkendz.PROCESS_NAME_CLIENT,
    standalone: _.isUndefined(process.env.STANDALONE) ? true : process.env.STANDALONE.toLowerCase() !== 'false'
})

app.api = apiSession.default
app.client = clientSession.default

const port = process.env.PORT || 64321
console.log(`starting monitoring server on ${port}...`)
app.listen(port)