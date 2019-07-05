import get from 'lodash/get';

const initialState = {
   results: {},
   loading: false,
}

export default function (state = initialState, action) {
   switch (action.type) {
      case 'PLAY_SUCCESS':
         return {
            ...state,
            results: action.payload,
            loading: false,
         };
      case 'PLAY_ERROR':
         console.log('action', action);
         let error = get(action, 'error.message', '');
         if (!error) {
            error = get(action, 'message', '');
         }
         if (error === 'Invalid access token') {
            error = `${error}. This likely means you haven't used the page in a while, so try refreshing!`;
         }
         return {
            ...state,
            error,
            loading: false,
         }
      case 'ON_PLAY':
         return {
            ...state,
            loading: true,
         };
   }

   return state;
}
