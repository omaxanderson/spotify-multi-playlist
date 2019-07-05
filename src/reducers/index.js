export default function reducer(state = {}, action) {
   switch (action.type) {
      case 'FETCH_PLAYLISTS_SUCCESS':
         return {
            ...state,
            playlists: action.payload,
         };
         break;
      case 'SEARCH_SUCCESS':
         return {
            ...state,
            searchResults: action.payload,
         };
         break;
      default:
         return state;
   }
}
