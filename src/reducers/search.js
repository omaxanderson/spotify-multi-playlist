import get from 'lodash/get';

const initialState = {
   results: {},
   loading: false,
}

export default function (state = initialState, action) {
   switch (action.type) {
      case 'SEARCH_SUCCESS':
         return {
            ...state,
            results: action.payload,
            loading: false,
         };
      case 'SEARCH_ERROR':
         let error = get(action, 'payload.error.message', '');
         if (!error) {
            error = get(action, 'payload.message', '');
         }
         if (error === 'Invalid access token') {
            error = `${error}. This likely means you haven't used the page in a while, so try refreshing!`;
         }
         return {
            ...state,
            error,
            loading: false,
         }
      case 'ON_SEARCH':
         return {
            ...state,
            loading: true,
         };
   }

   return state;
}
