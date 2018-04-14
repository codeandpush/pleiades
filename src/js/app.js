/**
 * Created by anthony on 26/03/2018.
 */

class PleiadesApp extends Bkendz {
    
    constructor() {
        super()
    }
    
    get elems() {
        return {
            connectionAlert: $('#connection_alert')
        }
    }
    
}

window.app = new PleiadesApp()

app.on('server_disconnected', () => {
    console.log('server disconnected')
    app.elems.connectionAlert.show().slideDown()
    setTimeout(() => app.connectToServer(), 1000 * app.retryCount.server)
})

app.on('server_connected', () => {
    console.log('server connected')
    app.elems.connectionAlert.slideUp().hide()
    
    if(!app.apiLocation){
        app.server.json('/api', location).then((res) => {
            app.apiLocation = res.data
            app.connectToApi()
        })
    }
})

app.on('api_disconnected', () => {
    console.log('api disconnected')
    setTimeout(() => app.connectToApi(), 1000 * app.retryCount.api)
})

app.on('api_connected', () => {
    console.log('api connected')
})