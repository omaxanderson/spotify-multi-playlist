import get from 'lodash/get';

const initialState = [];

export default function (state = initialState, action) {
   let selected = state.slice();
   switch (action.type) {
      case 'ON_SELECT':
         const alreadySelected = selected.find(i => i.id === action.payload.id);
         if (alreadySelected) {
            return selected.filter(i => i.id !== action.payload.id);
         } else {
            selected.push(action.payload);
            console.log('selected', selected);
            return selected;
         }
      case 'PLAY_SUCCESS':
         // Clear out selected after play success
         return [];
   }

   return state;
}
