export const FETCH_PLAYLISTS = 'FETCH_PLAYLISTS';
import { fbauth, fbfetch, fbfetchlayout, fbfetchscenes } from '../actions';
import store from '../store'

export function handleEnterHome() {
  store.dispatch(fbfetch('Accounts'));
  store.dispatch(fbfetchlayout('Accounts'));
  store.dispatch(fbfetchscenes('Matrices'));
  store.dispatch(fbauth());
}
