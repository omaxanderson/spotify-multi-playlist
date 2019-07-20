import { combineReducers } from 'redux';
import search from './search';
import playlists from './playlists';
import player from './player';
import selected from './selected';

export default combineReducers({
   search,
   playlists,
   player,
   selected,
});
