import { createStore, applyMiddleware, compose } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducers';
import playlists from './sagas/playlists';
import search from './sagas/search';
import player from './sagas/player';

const sagaMiddleware = createSagaMiddleware();

export default createStore(
   rootReducer,
   compose(
      applyMiddleware(sagaMiddleware),
      composeWithDevTools(),
   ),
);

sagaMiddleware.run(playlists);
sagaMiddleware.run(search);
sagaMiddleware.run(player);


