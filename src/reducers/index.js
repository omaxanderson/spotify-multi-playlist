import { combineReducers } from 'redux';
import search from './search';
import playlists from './playlists';

export default combineReducers({
   search,
   playlists,
});
