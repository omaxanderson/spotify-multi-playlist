import { combineReducers } from 'redux';
import search from './search';
import playlists from './playlists';
import player from './player';

export default combineReducers({
   search,
   playlists,
   player,
});
