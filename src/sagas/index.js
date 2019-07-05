import { all, put, takeEvery } from 'redux-saga/effects';

export default function* watchAll() {
   yield all([
      takeEvery('TEST_SAGA', testSaga),
   ]);
}

function* testSaga(action) {
   console.log('in testsaga');

   return 'max';
}
