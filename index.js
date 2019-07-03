"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var fastify_1 = require("fastify");
var lodash_1 = require("lodash");
var authenticate_1 = require("./authenticate");
var point_of_view_1 = require("point-of-view");
var pug_1 = require("pug");
var path_1 = require("path");
var axios_1 = require("axios");
var fastify_session_1 = require("fastify-session");
var fastify_cookie_1 = require("fastify-cookie");
var fastify_static_1 = require("fastify-static");
var f = fastify_1["default"]({
    logger: {
        prettyPrint: true
    }
});
f.register(fastify_static_1["default"], {
    root: path_1["default"].join(__dirname, 'public')
});
f.register(fastify_cookie_1["default"]);
f.register(fastify_session_1["default"], {
    secret: 'e59a7b781745ac15455de026297f024742209f17',
    cookie: {
        secure: false,
        maxAge: 3600000
    },
    resave: false,
    saveUninitialized: true
});
f.register(point_of_view_1["default"], {
    engine: {
        pug: pug_1["default"]
    },
    templates: 'views',
    options: {
        views: 'views',
        filename: 'views/test.pug'
    }
});
f.addHook('preHandler', function (req, res, next) {
    var url = req.raw.url;
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
var isAuthed = function (req, res, next) {
    if (!req.session.access_token) {
        res.redirect('/login');
    }
    else {
        next();
    }
};
f.get('/refresh', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, authenticate_1.authenticate(req, res)];
            case 1:
                result = _a.sent();
                res.send(result);
                return [2 /*return*/];
        }
    });
}); });
f.get('/pug', function (req, res) {
    res.view('test.pug');
});
f.get('/', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var access_token;
    return __generator(this, function (_a) {
        access_token = req.session.access_token;
        if (!access_token) {
            // watch out for redirect loop??
            res.redirect('/login');
            return [2 /*return*/];
        }
        res.view('test.pug');
        return [2 /*return*/];
    });
}); });
f.get('/devices', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var access_token, devices;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                access_token = req.session.access_token;
                return [4 /*yield*/, axios_1["default"].get("https://api.spotify.com/v1/me/player/devices?access_token=" + access_token)];
            case 1:
                devices = _a.sent();
                res.send({ devices: devices.data });
                return [2 /*return*/];
        }
    });
}); });
f.put('/play', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var access_token, body, playlists, albums, tracks, artists, playlistPromises, artistPromises, albumPromises, playlistTracks, artistTracks, albumTracks, albumUris, playlistUris, artistUris, trackUris, holyLodashMethods, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                access_token = req.session.access_token;
                body = req.body;
                playlists = body.filter(function (item) { return item.type === 'playlist'; });
                albums = body.filter(function (item) { return item.type === 'album'; });
                tracks = body.filter(function (item) { return item.type === 'track'; });
                artists = body.filter(function (item) { return item.type === 'artist'; });
                playlistPromises = playlists.map(function (p) { return axios_1["default"].get("https://api.spotify.com/v1/playlists/" + p.id + "/tracks?access_token=" + access_token); });
                artistPromises = artists.map(function (a) { return axios_1["default"].get("https://api.spotify.com/v1/artists/" + a.id + "/top-tracks?access_token=" + access_token + "&country=US"); });
                albumPromises = albums.map(function (a) { return axios_1["default"].get("https://api.spotify.com/v1/albums/" + a.id + "/tracks?access_token=" + access_token + "&limit=50"); });
                return [4 /*yield*/, Promise.all(playlistPromises)];
            case 1:
                playlistTracks = _a.sent();
                return [4 /*yield*/, Promise.all(artistPromises)];
            case 2:
                artistTracks = _a.sent();
                return [4 /*yield*/, Promise.all(albumPromises)];
            case 3:
                albumTracks = _a.sent();
                albumUris = lodash_1["default"].flatten(albumTracks.map(function (_a) {
                    var data = _a.data;
                    return data.items;
                })).map(function (t) { return t.uri; });
                playlistUris = lodash_1["default"].flatten(playlistTracks.map(function (_a) {
                    var data = _a.data;
                    return data.items;
                })).map(function (_a) {
                    var track = _a.track;
                    return track.uri;
                });
                artistUris = lodash_1["default"].flatten(artistTracks.map(function (_a) {
                    var data = _a.data;
                    return data.tracks;
                })).map(function (t) { return t.uri; });
                trackUris = tracks.map(function (_a) {
                    var uri = _a.uri;
                    return uri;
                });
                holyLodashMethods = lodash_1["default"].shuffle(albumUris.concat(playlistUris, artistUris, trackUris));
                return [4 /*yield*/, axios_1["default"]({
                        method: 'PUT',
                        url: 'https://api.spotify.com/v1/me/player/play',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': "Bearer " + access_token
                        },
                        data: {
                            uris: holyLodashMethods
                        }
                    })];
            case 4:
                result = _a.sent();
                res.send(200);
                return [2 /*return*/];
        }
    });
}); });
f.get('/play/:context_uri/:deviceId', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var access_token, _a, context_uri, deviceId, request;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                access_token = req.session.access_token;
                _a = req.params, context_uri = _a.context_uri, deviceId = _a.deviceId;
                return [4 /*yield*/, axios_1["default"]({
                        method: 'PUT',
                        url: "https://api.spotify.com/v1/me/player/play?device_id=" + deviceId,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': "Bearer " + access_token
                        },
                        data: {
                            context_uri: context_uri
                        }
                    })];
            case 1:
                request = _b.sent();
                return [2 /*return*/];
        }
    });
}); });
f.get('/playlists/:playlistId', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var access_token, playlistId, tracks;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                access_token = req.session.access_token;
                playlistId = req.params.playlistId;
                return [4 /*yield*/, axios_1["default"].get("https://api.spotify.com/v1/playlists/" + playlistId + "/tracks?limit=100&access_token=" + access_token)];
            case 1:
                tracks = _a.sent();
                res.send({ tracks: tracks.data.items.map(function (_a) {
                        var track = _a.track;
                        return ({ name: track.name, uri: track.uri });
                    }) });
                return [2 /*return*/];
        }
    });
}); });
f.get('/d', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        req.session.access_token = 'invalid access token';
        res.send({ success: 'true' });
        return [2 /*return*/];
    });
}); });
f.get('/search', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var _a, q, type, access_token, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, q = _a.q, type = _a.type;
                access_token = req.session.access_token;
                return [4 /*yield*/, axios_1["default"].get("https://api.spotify.com/v1/search?q=" + q + "&type=" + (type || 'album,artist,playlist,track') + "&access_token=" + access_token)];
            case 1:
                result = _b.sent();
                res.send(result.data);
                return [2 /*return*/];
        }
    });
}); });
f.get('/playlists', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var access_token, getAll, playlists, next, result, e_1, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                access_token = req.session.access_token;
                getAll = req.query.getAll;
                console.log(access_token);
                playlists = [];
                next = "https://api.spotify.com/v1/me/playlists?limit=50";
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 6]);
                return [4 /*yield*/, axios_1["default"].get(next + "&access_token=" + access_token)];
            case 2:
                result = _a.sent();
                // console.log('type', typeof result);
                if (result.status !== 200) {
                }
                // console.log(result);
                playlists.push.apply(playlists, result.data.items);
                next = result.data.next;
                return [3 /*break*/, 6];
            case 3:
                e_1 = _a.sent();
                response = e_1.response;
                if (![400, 401].includes(response.status)) return [3 /*break*/, 5];
                return [4 /*yield*/, authenticate_1.authenticate(req, res)];
            case 4:
                _a.sent();
                res.code(response.status).send({
                    status: response.status,
                    message: "Session expired, please refresh the page"
                });
                return [2 /*return*/];
            case 5: return [3 /*break*/, 6];
            case 6:
                if (next && getAll) return [3 /*break*/, 1];
                _a.label = 7;
            case 7:
                // TODO add metadata to the response
                //    Also going to need to update the client logic to account for change from [] to {}
                res.send(playlists.map(function (_a) {
                    var id = _a.id, name = _a.name, uri = _a.uri;
                    return ({ id: id, name: name, uri: uri });
                }));
                return [2 /*return*/];
        }
    });
}); });
f.get('/fjdsafdsa', function (req, res) { return res.send('hello'); });
f.get('/login', function (req, res) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, authenticate_1.login(req, res)];
}); }); });
// The redirect route coming back from the spotify /authorize call
// Should never be called directly
// TODO see whether fastify can restrict who a call is coming from
f.get('/authenticate', function (req, res) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, authenticate_1.authenticate(req, res)];
}); }); });
f.listen(5001, '0.0.0.0', function (err, addr) {
    if (err)
        throw err;
    f.log.info("server listening on " + addr);
});
