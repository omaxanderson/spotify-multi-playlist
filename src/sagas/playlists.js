import { all, put, takeEvery } from 'redux-saga/effects';

export default function* watchAll() {
   yield all([
      takeEvery('FETCH_PLAYLISTS', fetchPlaylists),
   ]);
}

function* fetchPlaylists(action) {
   // to tell the loader to fire
   yield put({
      type: 'ON_FETCH_PLAYLISTS',
   });

   const results = yield fetch(`/playlists`);
   const payload = yield results.json();

   yield put({
      type: 'FETCH_PLAYLISTS_SUCCESS',
      payload,
   });

   return true;
}
