/**
 * Created by anthony on 26/03/2018.
 */

class PleiadesApp extends Bkendz {
    
    constructor() {
        super()
        this._room = null
        this._user = null
    }
    
    get elems() {
        return {
            connectionAlert: $('#connection_alert'),
            songsContainer: $('#appContainer'),
            playlistContainer: $('#appContainer')
        }
    }
    
    get role() {
    }
    
    set room(newRoom) {
    
    }

    get user(){
        return this._user
    }

    set user(newUser){
        let oldUser = this._user
        this._user = newUser
        this.emit('changed_authuser', newUser, oldUser)
    }

    fetchAuthUser(){
        return this.api.json('/user')
            .then((res) => {
                this.user = res.data
            })
    }

    init(){
        super.init()
        $('[data-toggle="popover"]').popover()
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
    
    if (!app.apiLocation) {
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
    
    if (!app.dbSchema) {
        app.api.json('/as').then((resp) => {
            app.dbSchema = resp.data
        })
    }

    app.resolveAccess('chinwo', 'password')
        .then(() => app.fetchAuthUser())
})

app.on('click_signin', (e) => {
    console.log('[App] sign in', e)
})

app.on('changed_authuser', (newUser, oldUser) => {
    console.log('[changed_authuser] newUser=%s, oldUser=%s', newUser, oldUser)
})

app.on('changed_accesstoken', (newToken, oldToken) => {
    console.log('[changed_accesstoken] new=%s, old=%s', newToken, oldToken)
    app.api.on('db_update', (snapshot) => {
        //console.log('[db_update]', snapshot)
    })
})

app.on('changed_dbschema', () => {
    return app.fetch('Song', {where: {}})
        .catch((err) => console.error('[changed_dbschema]', err))
        .then((res) => (res || {}).data)
        .then((songs) => {
            if(!_.isArray(songs)) return

            let argsList = songs.map((s) => {
                return {song: s}
            })
            return app.repeat({
                template: '_vote_status.ejs',
                templateArgs: argsList,
                target: app.elems.songsContainer,
                wrapFn: () => {
                    return {prepend: `<li class="list-group-item">`, append: `</li>`}
                }
            })
        })
})

app.on('click_song', (e) => {
    console.log('song clicked')
})

app.on('click_createRoom', (evt) => {
    console.log("Create room clicked");
})

app.on('click_admin', (e) => {
    let getTemplate = app.getTemplate('_upload_playlist.ejs')
    return Promise.all([getTemplate])
        .then(([template]) => {
            app.elems.songsContainer.html(template)
            let compiled = _.template(template)
            _.each([], (song) => {
                let el = $(compiled({song}))
                app.elems.songsContainer.append(el)
            })
        })
})

app.on('change_fileSelected', (evt) => {
    let files = evt.target.files
    for (let i = 0, f; f = files[i]; i++) {
        let reader = new FileReader();
        reader.onload = function (e) {
            let csvString = reader.result;
            let songs = Papa.parse(csvString).data.map(elem => {
                return {
                    artistName: elem[0],
                    name: elem[1],
                    title: elem[1]
                }
            })
            let getTemplate = app.getTemplate('playlist.ejs')
            let playlistElem = $('#playlist')
            
            return Promise.all([Promise.resolve(songs), getTemplate])
                .then(([songs, template]) => {
                    let compiled = _.template(template)
                    _.each(songs, (song) => {
                        let el = $(compiled({song}))
                        playlistElem.append(el)
                    })
                })
        }
        reader.readAsText(f, 'UTF-8');
    }
})

app.debugMode = true
