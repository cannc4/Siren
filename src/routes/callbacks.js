export const FETCH_PLAYLISTS = 'FETCH_PLAYLISTS';
import { fbauth } from '../actions';
import { fbfetch, fbfetchscenes} from '../actions';
import store from '../store'

export function handleEnterHome() {
  store.dispatch(fbfetch('Accounts'));
  store.dispatch(fbfetch('Patterns'));
  store.dispatch(fbfetchscenes('Matrices'));
  store.dispatch(fbauth());
}
