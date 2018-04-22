/**
 * Created by anthony on 26/03/2018.
 */

class PleiadesApp extends Bkendz {
    
    constructor() {
        super()
        this._room = null
        this._user = null
        this._activeTab = null
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
    
    get user() {
        return this._user
    }
    
    set user(newUser) {
        let oldUser = this._user
        this._user = newUser
        this.emit('changed_authuser', newUser, oldUser)
    }
    
    activeTab(tab, opts) {
        if (_.isUndefined(tab)) {
        
        } else {
            this._activeTab = tab
            let target = document.getElementById(tab)
            
            let apply = () => {
                for (let elem of document.querySelectorAll('.tab-content .tab-pane')) {
                    if (elem.id === tab) elem.classList.add('active', 'show')
                    else elem.classList.remove('active', 'show')
                }
            }
            //$().removeClass('active show').filter((i, e) => $(e).attr('id') == 'home').get(0).classList.add('active', 'show')
            return Promise.resolve()
                .then(() => {
                    if(target) return
    
                    let templateName = `_tab_${tab}.ejs`
                    return this.getTemplate(templateName, opts)
                        .then((html) => {
                            let container = $('.tab-content').first()
                            let content = _.template(html)(opts || {})
                            let tabHtml = `<div class="tab-pane fade" id="${tab}" role="tabpanel">${content}</div>`
                            container.append($(tabHtml))
                        })
                })
                .then(apply)
        }
    }
    
    fetchAuthUser() {
        return this.api.json('/user')
            .then((res) => {
                this.user = res.data
            })
    }
    
    init() {
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
    
    
})

app.on('click_signin', (e) => {
    let inputs = document.forms[0].getElementsByTagName('input')
    let nickname = inputs['email'].value
    let passwrd = inputs['password'].value
    console.log('[signin] nickname=%s, password=%s', nickname, passwrd)
    app.resolveAccess(nickname, passwrd)
        .then(() => app.fetchAuthUser())
        .then(() => {
            app.activeTab('home', {nickname: app.user.nickname})
            $('[data-emit-click="tab_signin"]').text(app.user.nickname)
        })
})


app.on('click_tab_signin', (e) => app.activeTab('signin'))
app.on('click_tab_home_anon', (e) => app.activeTab('home_anon'))

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
    // return app.fetch('Song', {where: {}})
    //     .catch((err) => console.error('[changed_dbschema]', err))
    //     .then((res) => (res || {}).data)
    //     .then((songs) => {
    //         if (!_.isArray(songs)) return
    //
    //         let argsList = songs.map((s) => {
    //             return {song: s}
    //         })
    //         return app.repeat({
    //             template: '_vote_status.ejs',
    //             templateArgs: argsList,
    //             target: app.elems.songsContainer,
    //             wrapFn: () => {
    //                 return {prepend: `<li class="list-group-item">`, append: `</li>`}
    //             }
    //         })
    //     })
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

app.debugMode = false
