export const FETCH_PLAYLISTS = 'FETCH_PLAYLISTS';
import { fbauth } from '../actions';
import { fbfetch } from '../actions';
import store from '../store'

export function handleEnterHome() {
  store.dispatch(fbfetch('Accounts'));
  store.dispatch(fbfetch('Commands'));
  store.dispatch(fbfetch('Matrices'));
  store.dispatch(fbauth());
}
