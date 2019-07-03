"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const lodash_1 = __importDefault(require("lodash"));
const authenticate_1 = require("./authenticate");
const point_of_view_1 = __importDefault(require("point-of-view"));
const pug_1 = __importDefault(require("pug"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const fastify_session_1 = __importDefault(require("fastify-session"));
const fastify_cookie_1 = __importDefault(require("fastify-cookie"));
const fastify_static_1 = __importDefault(require("fastify-static"));
const Playlist_1 = __importDefault(require("./services/Playlist"));
const f = fastify_1.default({
    logger: {
        prettyPrint: true,
    }
});
f.register(fastify_static_1.default, {
    root: path_1.default.join(__dirname, 'public'),
});
f.register(fastify_cookie_1.default);
f.register(fastify_session_1.default, {
    secret: 'e59a7b781745ac15455de026297f024742209f17',
    cookie: {
        secure: false,
        maxAge: 3600000,
    },
    saveUninitialized: true,
});
f.register(point_of_view_1.default, {
    engine: {
        pug: pug_1.default
    },
    templates: 'views',
    options: {
        views: 'views',
        filename: 'views/test.pug',
    }
});
f.addHook('preHandler', (req, res, next) => {
    const { url } = req.raw;
    if (![
        '/login',
        '/authenticate',
    ].includes(url.split('?')[0])) {
        if (!req.session.access_token) {
            res.redirect('/login');
            return;
        }
    }
    next();
});
// check for session access token
const isAuthed = (req, res, next) => {
    if (!req.session.access_token) {
        res.redirect('/login');
    }
    else {
        next();
    }
};
f.get('/refresh', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const result = yield authenticate_1.authenticate(req, res);
    res.send(result);
}));
f.get('/pug', (req, res) => {
    res.view('test.pug');
});
f.get('/', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { access_token } = req.session;
    if (!access_token) {
        // watch out for redirect loop??
        res.redirect('/login');
        return;
    }
    res.view('test.pug');
}));
f.get('/test', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { access_token } = req.session;
    const { body } = req;
    const playlists = Playlist_1.default.getPlaylistTracks(1, 2);
}));
f.get('/devices', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { access_token } = req.session;
    const devices = yield axios_1.default.get(`https://api.spotify.com/v1/me/player/devices?access_token=${access_token}`);
    res.send({ devices: devices.data });
}));
f.put('/play', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { access_token } = req.session;
    const { body } = req;
    const playlists = body.filter(item => item.type === 'playlist');
    const albums = body.filter(item => item.type === 'album');
    const tracks = body.filter(item => item.type === 'track');
    const artists = body.filter(item => item.type === 'artist');
    const playlistPromises = playlists.map(p => axios_1.default.get(`https://api.spotify.com/v1/playlists/${p.id}/tracks?access_token=${access_token}`));
    const artistPromises = artists.map(a => axios_1.default.get(`https://api.spotify.com/v1/artists/${a.id}/top-tracks?access_token=${access_token}&country=US`));
    const albumPromises = albums.map(a => axios_1.default.get(`https://api.spotify.com/v1/albums/${a.id}/tracks?access_token=${access_token}&limit=50`));
    const playlistTracks = yield Promise.all(playlistPromises);
    const artistTracks = yield Promise.all(artistPromises);
    const albumTracks = yield Promise.all(albumPromises);
    const albumUris = lodash_1.default.flatten(albumTracks.map(({ data }) => data.items)).map(t => t.uri);
    const playlistUris = lodash_1.default.flatten(playlistTracks.map(({ data }) => data.items)).map(({ track }) => track.uri);
    const artistUris = lodash_1.default.flatten(artistTracks.map(({ data }) => data.tracks)).map(t => t.uri);
    const trackUris = tracks.map(({ uri }) => uri);
    // TODO figure out why this isn't working great
    const holyLodashMethods = lodash_1.default.shuffle([...albumUris, ...playlistUris, ...artistUris, ...trackUris]);
    // console.log('a', albumUris);
    // console.log('a2', artistUris);
    // console.log(dataObjects);
    // const objects = results.map(result => ({ items: result.data.items, type: result.data.type }));
    // console.log('objects', objects);
    /*
    const results = await Promise.all(
       playlistPromises,
       artistPromises,
       albumsPromises
    );
    /*
    console.log('playlistTracks', playlistTracks);
    console.log('artistTracks', artistTracks);
    console.log('albumsTracks', albumTracks);
    console.log('results', results);
    // const uris = _.shuffle(_.flatten(results.map(playlist => playlist.data.items.map(obj => (obj.track.uri)))));
    const uris = results.map(playlist => playlist.data.items.map(obj => (obj.track.uri)));
    console.log('uris', uris);
 
    const holyLodashMethods = _.compact(_.flatten(_.zip(...uris.map(u => _.shuffle(u)))));
 
 */
    const result = yield axios_1.default({
        method: 'PUT',
        url: 'https://api.spotify.com/v1/me/player/play',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        },
        data: {
            uris: holyLodashMethods,
        },
    });
    res.send(200);
}));
f.get('/play/:context_uri/:deviceId', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { access_token } = req.session;
    const { context_uri, deviceId } = req.params;
    // console.log('context_uri', context_uri);
    // console.log('deviceId', deviceId);
    const request = yield axios_1.default({
        method: 'PUT',
        url: `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        },
        data: {
            context_uri
        },
    });
}));
f.get('/playlists/:playlistId', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { access_token } = req.session;
    const { playlistId } = req.params;
    const tracks = yield axios_1.default.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&access_token=${access_token}`);
    res.send({ tracks: tracks.data.items.map(({ track }) => ({ name: track.name, uri: track.uri })) });
}));
f.get('/d', (req, res) => __awaiter(this, void 0, void 0, function* () {
    req.session.access_token = 'invalid access token';
    res.send({ success: 'true' });
}));
f.get('/search', (req, res) => __awaiter(this, void 0, void 0, function* () {
    // console.log('PARMS', req.query);
    const { q, type } = req.query;
    const { access_token } = req.session;
    const result = yield axios_1.default.get(`https://api.spotify.com/v1/search?q=${q}&type=${type || 'album,artist,playlist,track'}&access_token=${access_token}`);
    res.send(result.data);
}));
f.get('/playlists', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { access_token } = req.session;
    const { getAll } = req.query;
    console.log(access_token);
    const playlists = [];
    let next = `https://api.spotify.com/v1/me/playlists?limit=50`;
    do {
        try {
            const result = yield axios_1.default.get(`${next}&access_token=${access_token}`);
            // console.log('type', typeof result);
            if (result.status !== 200) {
            }
            // console.log(result);
            playlists.push(...result.data.items);
            next = result.data.next;
        }
        catch (e) {
            const { response } = e;
            if ([400, 401].includes(response.status)) {
                yield authenticate_1.authenticate(req, res);
                res.code(response.status).send({
                    status: response.status,
                    message: "Session expired, please refresh the page",
                });
                return;
            }
        }
    } while (next && getAll);
    // TODO add metadata to the response
    //    Also going to need to update the client logic to account for change from [] to {}
    res.send(playlists.map(({ id, name, uri }) => ({ id, name, uri })));
}));
f.get('/login', (req, res) => __awaiter(this, void 0, void 0, function* () { return authenticate_1.login(req, res); }));
// The redirect route coming back from the spotify /authorize call
// Should never be called directly
// TODO see whether fastify can restrict who a call is coming from
f.get('/authenticate', (req, res) => __awaiter(this, void 0, void 0, function* () { return authenticate_1.authenticate(req, res); }));
f.listen(5001, '0.0.0.0', (err, addr) => {
    if (err)
        throw err;
    f.log.info(`server listening on ${addr}`);
});
