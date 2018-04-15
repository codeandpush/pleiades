/**
 * Created by anthony on 26/03/2018.
 */

class PleiadesApp extends Bkendz {
    
    constructor() {
        super()
        this._room = null
    }
    
    get elems() {
        return {
            connectionAlert: $('#connection_alert'),
            songsContainer: $('#appContainer'),
            playlistContainer: $('#appContainer')
        }
    }

    get role(){}

    set room(newRoom){
    
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
    
    if(!app.dbSchema){
        app.api.json('/as').then((resp) => {
            app.dbSchema = resp.data
        })
    }
    
    app.api.on('db_update', (snapshot) => {
        console.log('[db_update]', snapshot)
    })
})

app.on('changed_dbschema', () => {
    let getTemplate = app.getTemplate('_vote_status.ejs')
    let fetchSong = app.fetch('Song', {where: {}}).then((res) => res.data)
    
    return Promise.all([fetchSong, getTemplate])
        .then(([songs, template]) => {
            let compiled = _.template(template)
            _.each(songs, (song) => {
                let el = $(compiled({song}))
                app.elems.songsContainer.append(el)
            })
        })
})

app.on('click_song', (e)=>{
    console.log('song clicked')
})

app.on('click_admin', (e)=>{
    let getTemplate = app.getTemplate('_upload_playlist.ejs')
    return Promise.all([getTemplate])
        .then(([template]) => {
            app.elems.songsContainer.html(template)
        })
})

app.on('change_fileSelected', (evt)=>{
    var files = evt.target.files
    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var csvString = reader.result;
            console.log(Papa.parse(csvString))
            let getTemplate = app.getTemplate('playlist.ejs')

            return Promise.all([getTemplate])
                .then(([songs, template]) => {
                    let compiled = _.template(template)
                    _.each(songs, (song) => {
                        let el = $(compiled({song}))
                        app.elems.songsContainer.append(el)
                    })
                })
        }
        reader.readAsText(f, 'UTF-8');
    }
})

app.debugMode = true
