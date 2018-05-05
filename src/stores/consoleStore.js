import { observable, action } from 'mobx';

// nodejs connections
import request from '../utils/request'

class ConsoleStore 
{
    @observable sc_text = '';
    @observable tidal_text = '';

    constructor() {
      this.load();
    }

    @action onChangeSC(text) {
        this.sc_text = text;
    }
    @action onChangeTidal(text) {
        this.tidal_text = text;
    }

    submitSC(expression) {
        request.post('http://localhost:3001/console_sc', { 'pattern': expression })
          .then((response) => { 
            console.log("RESPONSE SC");
          }).catch(function (error) {
            console.error("ERROR", error);
          });
    }
    submitGHC(expression) {
        request.post('http://localhost:3001/console_ghc', { 'pattern': expression })
          .then((response) => { 
            console.log("RESPONSE GHC");
          }).catch(function (error) {
            console.error("ERROR", error);
          });
    }

    load() {
      request.get('http://localhost:3001/console')
            .then(action((response) => { 
              if ( response.data.sc !== undefined && response.data.tidal !== undefined) {
                  this.sc_text    = response.data.sc;
                  this.tidal_text = response.data.tidal;
                  console.log(" ## Console loaded: ");//, this.sc_text, this.tidal_text);
              }
            })).catch(function (error) {
                  console.error(" ## ConsoleStore errors: ", error);
            });
    };
    
    save() {
      request.post('http://localhost:3001/console', { 'sc':    this.sc_text, 
                                                      'tidal': this.tidal_text })
              .then((response) => {
                  console.log(" ## Console save response: ");
              }).catch(function (error) {
                  console.error(" ## ConsoleStore errors: ", error);
              });
    };
}

export default new ConsoleStore();
