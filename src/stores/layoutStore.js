import { observable, action, computed} from 'mobx';
import _ from 'lodash';

// nodejs connections
import request from '../utils/request'
import rollStore from './rollStore';

class LayoutStore 
{
  isLoading;
  @observable layouts;
  @observable customs;

  constructor() {
    this.layouts = [];
    this.customs = [[], [], [], []];
    this.isLoading = true;
    this.load();
  }

  @action showLayout(specifier) {
    this.layouts.forEach(l => {if(l.i === specifier) l.isVisible = true;});
  };
  @action hideLayout(specifier) {
    this.layouts.forEach(l => {if(l.i === specifier) l.isVisible = false;});
  };

  isSlotEmpty(i) { 
    return this.customs[i] !== undefined && this.customs[i].length === 0;
  }
  @action loadCustom(i) {
    if (this.customs[i].length > 0) { 
      this.layouts = this.customs[i];
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

  // REMOVE
  @action gridParameters(specifier) {
    let item = this.layouts.filter(l => l.i === specifier)[0];
    return {i: item.i, x: item.x, y: item.y, h: item.h, w: item.w, isVisible: item.isVisible}
  };

  @action onLayoutChange(layout, layouts) {
    
    if (!this.isLoading) {
      let hidden_items = _.differenceBy(this.layouts, layout, 'i');
    
      // Invisible Layouts
      _.forEach(hidden_items, (i) => { i['isVisible'] = false; });
    
      // Visible Layouts
      _.forEach(layout,       (i) => { i['isVisible'] = true; });
    
      this.layouts = _.concat(layout, hidden_items);
      
      rollStore.reloadRoll();
    }
  };

  load() {
    //load layouts
    const ctx = this;
    console.log(" ## LOADING LAYOUTS...");
    ctx.isLoading = true;
    request.get('http://localhost:3001/layouts')
          .then(action((response) => { 
            if ( response.data.layouts && response.data.customs ) {
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
    request.post('http://localhost:3001/layouts', { 'layouts': this.layouts, 'customs': this.customs })
          .then((response) => {
            if (response.status === 200) console.log(" ## Layout saved.");
            else                         console.log(" ## Layout save failed.");
          }).catch(function (error) {
            console.error(" ## LayoutStore errors: ", error);
          });
  };

  @action reset() {
    this.layouts = [{i: "scenes", x: 0, y: 0, w: 3, h: 20, isVisible: true},
                    {i: 'tracker', x: 3, y: 0, w: 13, h: 13, isVisible: true},
                    {i: 'patterns', x: 16, y: 0, w: 8, h: 20, isVisible: true},
                    {i: 'tidal_history', x: 3, y: 13, w: 13, h: 3, isVisible: true},
                    {i: 'tidal_globals', x: 6, y: 16, w: 5, h: 4, isVisible: false},
                    {i: 'sc_console', x: 11, y: 16, w: 5, h: 4, isVisible: true },
                    {i: 'tidal_console', x: 11, y: 16, w: 5, h: 4, isVisible: true},
                    {i: 'tidal_log', x: 8, y: 21, w: 7, h: 13, isVisible: true},
                    {i: 'config_paths', x: 0, y: 21, w: 7, h: 13, isVisible: true},
                    {i: 'tidal_roll', x: 0, y: 21, w: 7, h: 13, isVisible: true},
                    {i: 'graphics', x: 0, y: 21, w: 7, h: 13, isVisible: true}
    ];
  };

  @action matrixFullscreen() {
    if(this.layouts !== undefined) {
      let found = false;
      _.forEach(this.layouts, (item, i) => {
        if (item.i === 'tracker') {
          item.x = 0;
          item.y = 0;
          item.w = 24;
          item.h = 20;
          item.isVisible = true;
          found = true;
        }
        else {
          item.isVisible = false;
        }
      });

      if (!found) {
        this.layouts = _.concat(this.layouts, {i: 'tracker', x: 0, y: 0, w: 24, h: 20, isVisible: true});
      }
    }
  }
}

export default new LayoutStore();
