import {
  observable,
  action,
  computed
} from 'mobx';
import _ from 'lodash';

// nodejs connections
import request from '../utils/request'
import rollStore from './rollStore';
import { save } from '../keyFunctions';

class LayoutStore {
  isLoading;
  @observable layouts;
  @observable customs;

  constructor() {
    this.layouts = [];
    this.customs = [
      [],
      [],
      [],
      []
    ];
    this.isLoading = true;
    this.load();

    window.onload = function () {
      rollStore.reloadRoll();
    };
  }

  @action showLayout(specifier) {
    this.layouts.forEach(l => {
      if (l.i === specifier) l.isVisible = true;
    });
  };
  @action hideLayout(specifier) {
    this.layouts.forEach(l => {
      if (l.i === specifier) l.isVisible = false;
    });
  };

  isSlotEmpty(i) {
    return this.customs[i] !== undefined && this.customs[i].length === 0;
  }
  @action loadCustom(i) {
    if (this.customs[i].length > 0) {
      this.layouts = this.customs[i];
      _.delay(() => rollStore.reloadRoll(), 100);
    }
  };
  @action saveCustom(i) {
    this.customs[i] = this.layouts;
  };
  @action deleteCustom(i) {
    if (this.customs[i])
      this.customs[i] = [];
  };

  @computed get visibleLayouts() {
    return this.layouts.filter(l => l.isVisible === true);
  };
  @computed get allLayouts() {
    return this.layouts;
  };

  @action onLayoutChange(layout, layouts) {

    if (!this.isLoading) {
      let hidden_items = _.differenceBy(this.layouts, layout, 'i');

      // Invisible Layouts
      _.forEach(hidden_items, (i) => {
        i['isVisible'] = false;
      });

      // Visible Layouts
      _.forEach(layout, (i) => {
        i['isVisible'] = true;
      });

      this.layouts = _.concat(layout, hidden_items);

      rollStore.reloadRoll(false);
    }
  };

  load() {
    //load layouts
    const ctx = this;
    console.log(" ## LOADING LAYOUTS...");
    ctx.isLoading = true;
    request.get('http://localhost:3001/layouts')
      .then(action((response) => {
        if (response.data.layouts && response.data.customs) {
          ctx.layouts = response.data.layouts;
          ctx.customs = response.data.customs;
          console.log(" ## Layouts loaded: ", this.layouts, this.customs);
        }
        ctx.isLoading = false;
      })).catch(function (error) {
        console.error(" ## LayoutStore errors: ", error);
        ctx.isLoading = false;
      });
  };

  save() {
    //save layouts
    request.post('http://localhost:3001/layouts', {
        'layouts': this.layouts,
        'customs': this.customs
      })
      .then((response) => {
        if (response.status === 200) console.log(" ## Layout saved.");
        else console.log(" ## Layout save failed.");
      }).catch(function (error) {
        console.error(" ## LayoutStore errors: ", error);
      });
  };

  @action reset() {
    this.layouts = [{
        i: "scenes",
        x: 0,
        y: 0,
        w: 3,
        h: 20,
        isVisible: true
      },
      {
        i: 'tracker',
        x: 3,
        y: 0,
        w: 13,
        h: 13,
        isVisible: true
      },
      {
        i: 'patterns',
        x: 16,
        y: 0,
        w: 8,
        h: 20,
        isVisible: true
      },
      {
        i: 'playback',
        x: 3,
        y: 13,
        w: 13,
        h: 3,
        isVisible: false
      },
      {
        i: 'tidal_history',
        x: 3,
        y: 13,
        w: 13,
        h: 3,
        isVisible: true
      },
      {
        i: 'controller',
        x: 3,
        y: 13,
        w: 13,
        h: 3,
        isVisible: true
      },
      {
        i: 'tidal_globals',
        x: 6,
        y: 16,
        w: 5,
        h: 4,
        isVisible: false
      },
      {
        i: 'sc_console',
        x: 11,
        y: 16,
        w: 5,
        h: 4,
        isVisible: true
      },
      {
        i: 'tidal_console',
        x: 11,
        y: 16,
        w: 5,
        h: 4,
        isVisible: true
      },
      {
        i: 'tidal_log',
        x: 8,
        y: 21,
        w: 7,
        h: 13,
        isVisible: true
      },
      {
        i: 'config_paths',
        x: 0,
        y: 21,
        w: 7,
        h: 13,
        isVisible: true
      },
      {
        i: 'tidal_roll',
        x: 0,
        y: 21,
        w: 7,
        h: 13,
        isVisible: true
      },
      {
        i: 'graphics',
        x: 0,
        y: 21,
        w: 7,
        h: 13,
        isVisible: true
      }
    ];
  };

  @action matFullscreen() { 
    this.layouts = [
      {
        "w": 17,
        "h": 20,
        "x": 0,
        "y": 0,
        "i": "tracker",
        "moved": false,
        "static": false,
        "isVisible": true
      },
      {
        "w": 7,
        "h": 20,
        "x": 17,
        "y": 0,
        "i": "patterns",
        "moved": false,
        "static": false,
        "isVisible": true
      },
      {
        "w": 6,
        "h": 4,
        "x": 13,
        "y": 9,
        "i": "playback",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 24,
        "h": 8,
        "x": 0,
        "y": 20,
        "i": "tidal_roll",
        "moved": false,
        "static": false,
        "isVisible": true
      },
      {
        "w": 9,
        "h": 7,
        "x": 15,
        "y": 28,
        "i": "tidal_history",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 9,
        "h": 7,
        "x": 15,
        "y": 28,
        "i": "controller",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 9,
        "h": 13,
        "x": 15,
        "y": 28,
        "i": "tidal_console",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 2,
        "h": 20,
        "x": 0,
        "y": 0,
        "i": "scenes",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 14,
        "h": 10,
        "x": 0,
        "y": 0,
        "i": "graphics",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 9,
        "h": 14,
        "x": 0,
        "y": 20,
        "i": "sc_console",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 6,
        "h": 4,
        "x": 13,
        "y": 9,
        "i": "tidal_globals",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 6,
        "h": 12,
        "x": 18,
        "y": 0,
        "i": "tidal_log",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 15,
        "h": 6,
        "x": 0,
        "y": 29,
        "i": "config_paths",
        "moved": false,
        "static": false,
        "isVisible": false
      }
    ];
  }

  @action graphicsFullscreen() { 
    this.layouts = [
      {
        "w": 24,
        "h": 6,
        "x": 0,
        "y": 14,
        "i": "tidal_roll",
        "moved": false,
        "static": false,
        "isVisible": true
      },
      {
        "w": 24,
        "h": 14,
        "x": 0,
        "y": 0,
        "i": "graphics",
        "moved": false,
        "static": false,
        "isVisible": true
      },
      {
        "w": 7,
        "h": 20,
        "x": 17,
        "y": 17,
        "i": "patterns",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 6,
        "h": 4,
        "x": 13,
        "y": 9,
        "i": "playback",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 17,
        "h": 20,
        "x": 0,
        "y": 0,
        "i": "tracker",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 9,
        "h": 7,
        "x": 15,
        "y": 28,
        "i": "tidal_history",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 9,
        "h": 13,
        "x": 15,
        "y": 28,
        "i": "tidal_console",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 2,
        "h": 20,
        "x": 0,
        "y": 0,
        "i": "scenes",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 9,
        "h": 14,
        "x": 0,
        "y": 20,
        "i": "sc_console",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 6,
        "h": 4,
        "x": 13,
        "y": 9,
        "i": "tidal_globals",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 6,
        "h": 12,
        "x": 18,
        "y": 0,
        "i": "tidal_log",
        "moved": false,
        "static": false,
        "isVisible": false
      },
      {
        "w": 15,
        "h": 6,
        "x": 0,
        "y": 29,
        "i": "config_paths",
        "moved": false,
        "static": false,
        "isVisible": false
      }
    ];
  }

  @action fullscreen(modelName) {
      if (this.layouts !== undefined) {
        let found = false;
        _.forEach(this.layouts, (item, i) => {
          if (item.i === modelName) {
            item.x = 0;
            item.y = 0;
            item.w = 24;
            item.h = 20;
            item.isVisible = true;
            found = true;
          } else {
            item.isVisible = false;
          }
        });

        if (!found) {
          this.layouts = _.concat(this.layouts, {
            i: modelName,
            x: 0,
            y: 0,
            w: 24,
            h: 20,
            isVisible: true
          });
        }
      }
    }
}

export default new LayoutStore();