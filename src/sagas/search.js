import { all, put, takeEvery } from 'redux-saga/effects';

export default function* watchAll() {
   yield all([
      takeEvery('SEARCH', search),
   ]);
}

function* search(action) {
   const results = yield fetch(`/search?q=${action.payload}`);
   const payload = yield results.json();

   yield put({
      type: 'SEARCH_SUCCESS',
      payload,
   });

   return true;
}

