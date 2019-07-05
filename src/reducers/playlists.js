const initialState = {
   results: {},
   loading: false,
}

export default function (state = initialState, action) {
   switch (action.type) {
      case 'FETCH_PLAYLISTS_SUCCESS':
         return {
            ...state,
            results: action.payload,
            loading: false,
         };
         break;
      case 'ON_FETCH_PLAYLISTS':
         return {
            ...state,
            loading: true,
         }
   }
   return state;
}
