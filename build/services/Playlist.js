"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const lodash_1 = require("lodash");
const tracksEndpoint = 'https://api.spotify.com/playlist';
class Playlist {
}
Playlist.getPlaylistTracks = (playlistId, accessToken) => {
    try {
        const result = axios_1.default.get(`${tracksEndpoint}/${playlistId}/tracks?access_token=${accessToken}`);
        return lodash_1.get(result, 'data.items', []);
    }
    catch (e) {
        return e;
    }
};
exports.default = Playlist;
