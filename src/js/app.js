/**
 * Created by anthony on 26/03/2018.
 */

class PleiadesApp extends Bkendz {
    
    constructor() {
        super()
        this._room = null
        this._user = null
        this._activeTab = null
        this._elems = null
        this._SEARCH_RESULT_POOL = []
    }
    
    get elems() {
        if (!this._elems) {
            this._elems = new LazyObject({
                connectionAlert: () => $('#connection_alert'),
                searchInput: () => $(document.querySelector('#search_term')),
                searchResultsContainer: () => $('#search_results_container'),
                btnCreateRoom: () => $('#create_room_btn')
            })
        }
        return this._elems
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
        if (!newUser) localStorage.removeItem('tokens')
        
        this.emit('changed_authuser', newUser, oldUser)
    }
    
    activeTab(tab, opts) {
        if (_.isUndefined(tab)) {
            return (document.querySelector('#tab-panes .tab-pane.active') || {}).id
        } else {
            this._activeTab = tab
            let target = document.getElementById(tab)
            opts = opts || {}
            let reload = _.isUndefined(opts.reload) ? false : opts.reload
            
            let apply = () => {
                for (let elem of document.querySelectorAll('#tab-panes .tab-pane')) {
                    if (elem.id === tab) elem.classList.add('active', 'show')
                    else elem.classList.remove('active', 'show')
                }
            }
            //$().removeClass('active show').filter((i, e) => $(e).attr('id') == 'home').get(0).classList.add('active', 'show')
            return Promise.resolve()
                .then(() => {
                    if (reload && target) target.remove()
                    if (!reload && target) return
                    
                    let templateName = `_tab_${tab}.ejs`
                    //this._templates = {} // clear templates cache
                    return this.getTemplate(templateName, _.merge({rendered: {user: this.user}}, opts, {reload}))
                        .then((html) => {
                            let container = $('#tab-panes').first()
                            let tabHtml = `<div class="tab-pane fade" id="${tab}" role="tabpanel">${html}</div>`
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
        $(document).on('click', '[data-emit-activetab]', (event) => this.activeTab(event.target.getAttribute('data-emit-activetab')))
    }
    
    create(modelName, params) {
        return this.api.json(`/create_model?model=${modelName}`, {modelArgs: params})
    }
    
    newSearchResult(kwargs) {
        let searchResElem = this._SEARCH_RESULT_POOL.shift()
        let defaultOpts = {
            thumbnail_url: 'http://www.aber.ac.uk/staff-profile-assets/img/noimg.png',
            title: '',
            description: ''
        }
        
        kwargs = _.merge({room: defaultOpts}, kwargs)
        let prom
        
        if (searchResElem) {
            searchResElem = $(searchResElem)
            let room = kwargs.room
            searchResElem.attr('data-roomid', room.id)
            searchResElem.find('[data-roomdescription]').text(room.description || room.email)
            searchResElem.find('[data-roomname]').text(room.title || room.name)
            searchResElem.find('img').attr('src', room.thumbnailUrl)
            prom = Promise.resolve(searchResElem)
        } else {
            prom = this.getTemplate('_result_musicroom.ejs').then((html) => {
                return $(_.template(html)(kwargs))
            })
        }
        
        return prom.then((elem) => {
            elem.prop('hidden', false)
            return elem
        })
        
    }
    
    deleteSearchResult(searchResult) {
        $(searchResult).prop('hidden', true)
        this._SEARCH_RESULT_POOL.push(searchResult)
    }
    
    tokensStored() {
        let tokensString = localStorage.getItem('tokens')
        if (!tokensString) return {}
        
        let tokens = _.attempt((tokenStr) => JSON.parse(tokenStr), tokensString)
        return (_.isError(tokens)) ? {} : tokens
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
    
    let tokens = app.tokensStored()
    if (!app.accessToken && 'access' in tokens) {
        app.accessToken = tokens.access
        app.fetchAuthUser()
            .catch((error) => {
                console.error('auto signin error: %s', error)
                app.accessToken = null
                localStorage.removeItem('tokens')
            })
    }
})

app.on('submitted_search_room', (term) => {
    app.api.json(`/search?q=${term}`)
        .then((resp) => {
            
            $('.search-result-item').each((idx, elem) => {
                app.deleteSearchResult(elem)
            })
            
            console.log('[submitted_search_room]', resp)
            
            for (let searchResultKwargs of resp.data.results) {
                switch (searchResultKwargs.$type) {
                    case 'MusicRoom':
                        app.newSearchResult({room: searchResultKwargs})
                            .then((elem) => {
                                app.elems.searchResultsContainer.append(elem)
                            })
                        break
                }
                
            }
        })
})

app.on('click_search_room', () => {
    app.emit('submitted_search_room', app.elems.searchInput.val())
})

app.on('keyup_search_room', (ev) => {
    //if (ev.which === 13)
    app.emit('submitted_search_room', app.elems.searchInput.val())
})

app.on('click_signin', (e) => {
    let inputs = document.forms['form_signin'].getElementsByTagName('input')
    let nickname = inputs['email'].value
    let passwrd = inputs['password'].value
    let remember = inputs['remember'].checked
    
    app.resolveAccess(nickname, passwrd)
        .then((tokens) => {
            app.fetchAuthUser()
            if (remember) localStorage.setItem('tokens', JSON.stringify(tokens))
            else localStorage.setItem('tokens', '{}')
        })
})

app.on('click_create_music_room', (e) => {
    console.log('[click_create_music_room]')
    let inputs = document.forms['form_create_music_room'].getElementsByTagName('input')
    let roomName = inputs['music_room_name'].value
    let isPublic = inputs['music_room_ispublic'].checked
    
    app.create('MusicRoom', {name: roomName, isPublic})
        .then((resp) => {
            console.log('[MusicRoom#create]', resp)
            return app.fetch('MusicRoom', {where: {id: resp.data.id}, scope: 'withVotingRounds'})
                .then((res) => {
                    app.activeTab('view_musicroom', {reload: true, rendered: {room: _.first(res.data) || {}}})
                })
        })
})

app.on('click_tab_signin', (e) => {
    let txt = $(e.target).text().trim()
    console.log('[click_tab_signin] text:', txt)
    
    switch (txt) {
        case 'Sign In':
            return app.activeTab('signin')
        default:
            return app.activeTab('account')
    }
    
})

app.on('changed_authuser', (newUser, oldUser) => {
    console.log('[changed_authuser] newUser=%s, oldUser=%s', newUser, oldUser)
    app.activeTab('home', {nickname: newUser && newUser.nickname || null, reload: true})
    $('[data-emit-click="tab_signin"]').text(_.isObject(newUser) ? app.user.nickname : 'Sign In')
    
    if (!newUser) $('#create_room_btn').hide()
    else $('#create_room_btn').show()
    
    app.elems.btnCreateRoom.show()
})

app.on('changed_accesstoken', (newToken, oldToken) => {
    console.log('[changed_accesstoken] new=%s, old=%s', newToken, oldToken)
    app.api.on('db_update', (snapshot) => {
        //console.log('[db_update]', snapshot)
    })
})

app.on('changed_dbschema', () => {
    console.log('[changed_dbschema]')
})

app.on('click_song', (e) => {
    console.log('song clicked')
})

app.on('click_createRoom', (evt) => {
    console.log("Create room clicked");
})

app.on('click_view_room', (evt) => {
    let roomId = $(evt.target).attr('data-roomid')
    console.log('[click_view_room] %s', roomId)
    
    app.fetch('MusicRoom', {where: {id: roomId}, scope: 'withVotingRounds'}).then((res) => {
        console.log('[res]', res)
        app.activeTab('view_musicroom', {reload: true, rendered: {room: _.first(res.data) || {}}})
    })
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

app.on('click_search', () => {
    app.emit('submitted_search', app.elems.searchInput.val())
})

app.on('keyup_search', (ev) => {
    //if (ev.which === 13)
    app.emit('submitted_search', app.elems.searchInput.val())
})

app.on('click_show_all_search_result', () => {
    app.elems.searchResultsContainer.find('.tab-pane').addClass('in active')
})

app.debugMode = false