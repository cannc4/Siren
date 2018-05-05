import { observable, action } from 'mobx';
// import _ from 'lodash';

// nodejs connections
import request from '../utils/request'

class PathStore 
{
    isLoading = false;
    @observable paths = {
        userpath : '',
        ghcipath: '',
        sclang: '',
        scsynth: '',
        sclang_conf: '',
        tidal_boot: '',
        scd_start: ''
    };

    constructor() {
      this.load();
    }

    load() {
      const ctx = this;
      console.log(" ## LOADING PATHS...");
      ctx.isLoading = true;
      request.get('http://localhost:3001/paths')
            .then(action((response) => { 
              if ( response.data.paths ) {
                ctx.paths = response.data.paths;
                console.log(" ## Paths loaded: ", this.paths);
              }
              ctx.isLoading = false;
            })).catch(function (error) {
              console.error(" ## Paths errors: ", error);
              ctx.isLoading = false;
            });
    };
    
    save() {
      request.post('http://localhost:3001/paths', { 'paths': this.paths })
            .then((response) => {
              if (response.status === 200) console.log(" ## Paths saved.");
              else                         console.log(" ## Paths save failed.");
            }).catch(function (error) {
              console.error(" ## Paths errors: ", error);
            });
    };
      
    @action updateValue(key, value) {
      this.paths[[key]] = value; 
    }
}

export default new PathStore();
