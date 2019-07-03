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
const axios_1 = __importDefault(require("axios"));
exports.authenticate = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { error, code, state, } = req.query;
    // This flow is used when the spotify service comes back
    if (code) {
        const data = {
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'http://localhost:5001/authenticate',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            client_secret: process.env.SPOTIFY_CLIENT_SECRET,
        };
        const result = yield axios_1.default({
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data,
            transformRequest: [
                // just puts the object into a url-encoded format
                data => Object.keys(data).map(key => `${key}=${data[key]}`).join('&'),
            ],
        });
        if (result.status === 200) {
            const { access_token, refresh_token, expires_in, scope, } = result.data;
            // fuck yeah we've got our shit
            req.session.access_token = access_token;
            req.session.refresh_token = refresh_token;
            console.log('access', access_token);
            console.log('refresh', refresh_token);
            // TODO figure out how to redirect to previously requested enpoint
            //    probably a session variable
            res.redirect('/');
            return;
        }
    }
    else if (req.session.refresh_token) {
        console.log('using refresh_token');
        const data = {
            grant_type: 'refresh_token',
            refresh_token: req.session.refresh_token,
            redirect_uri: 'http://localhost:5001/authenticate',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            client_secret: process.env.SPOTIFY_CLIENT_SECRET,
        };
        const result = yield axios_1.default({
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data,
            transformRequest: [
                // just puts the object into a url-encoded format
                data => Object.keys(data).map(key => `${key}=${data[key]}`).join('&'),
            ],
        });
        const { access_token, refresh_token } = result.data;
        // fuck yeah we've got our shit
        req.session.access_token = access_token;
        if (refresh_token) {
            req.session.refresh_token = refresh_token;
        }
        return { success: Boolean(access_token) };
    }
    else if (error) {
        // log in failed
    }
});
exports.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
    if (req.session.access_token) {
        res.redirect('/');
        return;
    }
    if (req.session.refresh_token) {
        // TODO work out the refresh token logic
    }
    // need to authenticate
    const scopes = [
        'user-modify-playback-state',
        'user-read-playback-state',
        'user-read-private',
        'playlist-read-private',
        'user-read-email'
    ].join(' ');
    const redirect_uri = 'http://localhost:5001/authenticate';
    res.redirect('https://accounts.spotify.com/authorize?'
        + 'response_type=code'
        + `&client_id=${process.env.SPOTIFY_CLIENT_ID || 'ughstupiddockersecrets'}`
        + `&scope=${encodeURIComponent(scopes)}`
        + `&redirect_uri=${encodeURIComponent(redirect_uri)}`);
});
