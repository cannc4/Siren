import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import reducers from './reducers';
const createStoreWithMiddleware = applyMiddleware(reduxThunk)(createStore);
export default createStoreWithMiddleware(reducers)


// import { createStore, applyMiddleware } from 'redux'
// import reduxThunk from 'redux-thunk'
// import reducers from './reducer'
// import socketMiddleware from './socketMiddleware'
//
// export default function configureStore(initialState) {
//   return createStore(reducers, initialState,
//       applyMiddleware(reduxThunk, socketMiddleware)
//   )
// }
