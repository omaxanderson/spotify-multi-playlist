import { all, put, takeEvery } from 'redux-saga/effects';

export default function* watchAll() {
   yield all([
      takeEvery('FETCH_PLAYLISTS', fetchPlaylists),
   ]);
}

function* fetchPlaylists(action) {
   console.log('in testsaga');
   const results = yield fetch(`/playlists`);
   const payload = yield results.json();

   yield put({
      type: 'FETCH_PLAYLISTS_SUCCESS',
      payload,
   });

   return true;
}
