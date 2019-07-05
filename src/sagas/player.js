import { all, put, takeEvery } from 'redux-saga/effects';

export default function* watchAll() {
   yield all([
      takeEvery('PLAY', play),
   ]);
}

function* play(action) {
   yield put({
      type: 'ON_PLAY',
   });

   console.log('attempting to play');
   const results = yield fetch('/play', {
      method: 'PUT',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify(action.payload),
   });

   // just check for 200 status code
   const { status } = results;

   if (status === 200) {
      yield put({
         type: 'PLAY_SUCCESS',
      });
   } else {
      const json = yield results.json();
      console.log(json);
      yield put({
         type: 'PLAY_ERROR',
         error: json.error,
      });
   }

   return true;
}
