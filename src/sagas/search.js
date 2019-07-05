import { all, put, takeEvery } from 'redux-saga/effects';

export default function* watchAll() {
   yield all([
      takeEvery('SEARCH', search),
   ]);
}

function* search(action) {
   yield put({
      type: 'ON_SEARCH',
   });

   const results = yield fetch(`/search?q=${action.payload}`);
   const payload = yield results.json();

   if (results.status === 200) {
      yield put({
         type: 'SEARCH_SUCCESS',
         payload,
      });
   } else {
      yield put({
         type: 'SEARCH_ERROR',
         payload,
      });
   }

   return true;
}

