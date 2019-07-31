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
// import { authenticate, login } from './authenticate';
const point_of_view_1 = __importDefault(require("point-of-view"));
const pug_1 = __importDefault(require("pug"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const axios_1 = __importDefault(require("axios"));
const fastify_session_1 = __importDefault(require("fastify-session"));
const fastify_cookie_1 = __importDefault(require("fastify-cookie"));
const fastify_static_1 = __importDefault(require("fastify-static"));
const playlists_1 = __importDefault(require("./playlists"));
const users_1 = __importDefault(require("./users"));
const albums_1 = __importDefault(require("./albums"));
const artists_1 = __importDefault(require("./artists"));
const player_1 = __importDefault(require("./player"));
const f = fastify_1.default({
    logger: {
        prettyPrint: true,
    }
});
// set env variables
(() => __awaiter(this, void 0, void 0, function* () {
    try {
        const spotify_client_id = yield fs_1.promises.readFile('/run/secrets/spotify_client_id', 'utf8');
        const spotify_client_secret = yield fs_1.promises.readFile('/run/secrets/spotify_client_secret', 'utf8');
        process.env.SPOTIFY_CLIENT_ID = spotify_client_id.replace(/\n/g, '');
        process.env.SPOTIFY_CLIENT_SECRET = spotify_client_secret.replace(/\n/g, '');
        console.log('set secrets');
    }
    catch (e) {
    }
    console.log(process.env.SPOTIFY_CLIENT_ID);
}))();
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
// Register the playlist routes
f.register(playlists_1.default);
f.register(users_1.default);
f.register(artists_1.default);
f.register(albums_1.default);
f.register(player_1.default);
f.addHook('preHandler', (req, res, next) => {
    const { url } = req.raw;
    if (![
        '/login',
        '/authenticate',
    ].includes(url.split('?')[0])) {
        if (!req.session.access_token) {
            console.log('redirecting...');
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
/* ============= REMOVE THESE ROUTES ============== */
/*
f.get('/refresh', async (req, res) => {
const result = await authenticate(req, res);
res.send(result);
});
*/
f.get('/pug', (req, res) => {
    res.view('test.pug');
});
f.get('/info', (req, res) => {
    res.view('info.pug');
});
f.get('/', (req, res) => __awaiter(this, void 0, void 0, function* () {
    console.log('spotify', process.env.spotify_client_id);
    const { access_token } = req.session;
    if (!access_token) {
        // watch out for redirect loop??
        res.redirect('/login');
        return;
    }
    res.view('test.pug');
}));
// For simpler debugging
f.get('/d', (req, res) => __awaiter(this, void 0, void 0, function* () {
    req.session.access_token = 'invalid access token';
    res.send({ success: 'true' });
}));
f.get('/search', (req, res) => __awaiter(this, void 0, void 0, function* () {
    // console.log('PARMS', req.query);
    const { q, type } = req.query;
    const { access_token } = req.session;
    try {
        const result = yield axios_1.default.get(`https://api.spotify.com/v1/search?q=${q}&type=${type || 'album,artist,playlist,track'}&access_token=${access_token}`);
        res.send(result.data);
    }
    catch (e) {
        const { response, request, message } = e;
        if (response) {
            res.status(response.status);
            res.send(response.data);
            return;
        }
        else if (request) {
            // do something else i guess
            res.send({ message: 'no response received' });
            return;
        }
        else {
            res.send({ message });
            return;
        }
    }
}));
f.listen(5001, '0.0.0.0', (err, addr) => {
    if (err)
        throw err;
    f.log.info(`server listening on ${addr}`);
});
