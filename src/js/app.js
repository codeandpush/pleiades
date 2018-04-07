/**
 * Created by anthony on 26/03/2018.
 */
class Deferred {
    
    constructor() {
        this.id = `${this.constructor._ID++}`
        
        this.promise = new Promise((res, rej) => {
            this.resolve = res
            this.reject = rej
        })
    }
    
    cancel() {
        this.reject('Cancelled!')
    }
    
    then(...args) {
        this._promise = (this._promise || this.promise).then(...args)
        return this
    }
}

Deferred._ID = 1

class ShowoffApp extends EventEmitter3 {
    
    constructor() {
        super()
        this.retryCount = {api: 0, server: 0}
        this.deferreds = {}
        this._presentations = []
        this._selectedPresentation = this._activeSlide = null
        this.apiLocation = null
    }
    
    get elems() {
        return {
            connectionAlert: $('#connection_alert')
        }
    }
    
    connect(url, options = {}) {
        let ws = new WebSocket(url, 'echo-protocol')
        this.retryCount[options.retryCount]++
        
        _.merge(WebSocket.prototype, Object.create(EventEmitter3.prototype))
        EventEmitter3.call(ws)
        
        let name = options.retryCount
        
        let subscriptions = ws.subscriptons = {}
        
        ws.on = function (eventName, callback) {
            let topic = `/${eventName}`
            console.log(`${name}: event=${eventName}, topic=${topic}`)
            
            let subscribe = `/subscribe?subject=${eventName}`
            ws.json(subscribe)
                .then((resp) => {
                    subscriptions[resp.data.subscribed] = 0
                    console.log('subscriptions:', subscriptions)
                    
                    EventEmitter3.prototype.on.call(ws, eventName, callback)
                })
        }
        
        ws.onopen = () => {
            this.retryCount[options.retryCount] = 0
            this.emit(options.connected || 'server_connected')
        }
        
        ws.onclose = () => {
            this.emit(options.disconnected || 'server_disconnected')
        }
        
        ws.onerror = (err) => {
            console.error(err)
        }
        
        ws.json = (topic, data) => {
            let deferred = new Deferred()
            this.deferreds[deferred.id] = deferred
            
            let req = {topic: `${topic}${_.includes(topic, '?') ? '&' : '?'}uid=${deferred.id}`, data: data}
            ws.send(JSON.stringify(req))
            return deferred
        }
        
        ws.onmessage = (message) => {
            let msg = JSON.parse(message.data)
            let parts = _.split(msg.topic, '?', 2)
            
            let parsed = _.chain(_.last(parts))
                .replace('?', '') // a=b454&c=dhjjh&f=g6hksdfjlksd
                .split('&') // ["a=b454","c=dhjjh","f=g6hksdfjlksd"]
                .map(_.partial(_.split, _, '=', 2)) // [["a","b454"],["c","dhjjh"],["f","g6hksdfjlksd"]]
                .fromPairs() // {"a":"b454","c":"dhjjh","f":"g6hksdfjlksd"}
                .value()
            
            let deferredId = parsed.uid
            let deferred = this.deferreds[deferredId]
            let topic = _.first(parts)
            
            if (_.isObject(deferred)) {
                delete this.deferreds[deferredId]
                deferred.resolve(msg)
            } else if (topic === '/subscribe' && parsed.subject in subscriptions) {
                subscriptions[parsed.subject]++
                ws.emit(parsed.subject, msg)
            } else {
                console.error('no pending promise', message, topic, parsed)
            }
        }
        
        return ws
    }
    
    connectToServer() {
        let url = `${location.protocol === 'https:' ? 'wss://' : 'ws://'}${location.host}`
        this.server = this.connect(url, {
            connected: 'server_connected',
            disconnected: 'server_disconnected',
            retryCount: 'server'
        })
    }
    
    connectToApi() {
        if(!this.apiLocation) throw Error('No API location provided!')
        let url = this.apiLocation[location.protocol === 'http:' ? 'ws' : 'wss']
        this.api = this.connect(url, {connected: 'api_connected', disconnected: 'api_disconnected', retryCount: 'api'})
    }
    
    init() {
        const emitWrap = (event) => {
            let emit = event.target.getAttribute(`data-emit-${event.type}`)
            this.emit(`${event.type}_${emit}`, event)
        }
        
        ['keyup', 'click'].forEach((eventType) => {
            $(document).on(eventType, `[data-emit-${eventType}]`, emitWrap)
        })
    }
}

window.app = new ShowoffApp()

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

document.addEventListener('DOMContentLoaded', function () {
    // lookup the container we want the Grid to use
    console.log('DOM loaded')
    app.init()
    
    app.connectToServer()
    
})