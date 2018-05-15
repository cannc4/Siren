import { observable, action, computed} from 'mobx';
import _ from 'lodash';

import channelStore from './channelStore'; 
import sceneStore from './sceneStore';

class CellStore 
{   
    @observable select_state = false;
    @observable current_cell = [null, null];
    @observable init_selection_cell = [null, null];
    @observable last_selection_cell = [null, null];
    
    clipboard = [];

    @computed get isSelected() {
        return this.select_state;
    }

    @action updateSelectState(flag) {
        this.select_state = flag;
    }

    compileCell(){
        let channel_i = this.current_cell[0];
        let cell_i = this.current_cell[1];
        if(this.select_state)
        channelStore.sendPattern(channelStore.getActiveChannels[channel_i], channelStore.getActiveChannels[channel_i].cells[cell_i]);
    }

    isCellSelected(channel_i, cell_i) {
        if(this.select_state) {
            if (channel_i <= _.max([this.init_selection_cell[0], this.last_selection_cell[0]]) && 
                channel_i >= _.min([this.init_selection_cell[0], this.last_selection_cell[0]]) && 
                cell_i <= _.max([this.init_selection_cell[1], this.last_selection_cell[1]]) && 
                cell_i >= _.min([this.init_selection_cell[1], this.last_selection_cell[1]])) 
            {
                return true;
            }
        }
        return false;
    }
    isCellHighlighted(channel_i, cell_i) {
        if(this.select_state) {
            return this.current_cell[0] === channel_i && this.current_cell[1] === cell_i;
        }
        return false;
    }

    @action cutCells(){
        this.copyCells();
        this.deleteSelectedCells();

    }
    copyCells() {
        if(this.select_state) {
            this.clipboard = [];

            let min_channel = _.min([this.init_selection_cell[0], this.last_selection_cell[0]]);
            let min_cell    = _.min([this.init_selection_cell[1], this.last_selection_cell[1]]);
            let max_channel = _.max([this.init_selection_cell[0], this.last_selection_cell[0]]);
            let max_cell    = _.max([this.init_selection_cell[1], this.last_selection_cell[1]]);

            for (let i = 0; i <= max_channel-min_channel; i++)
                for (let j = 0; j <= max_cell-min_cell; j++)
                    this.clipboard.push({channel: i, cell: j, 
                            value: channelStore.getActiveChannels[i+min_channel].cells[j+min_cell]});
        }
        // console.log(this.clipboard);
    }

    pasteCells() {
        for (let i = 0; i < this.clipboard.length; i++) {
            channelStore.overwriteCell(this.clipboard[i].channel + this.current_cell[0], 
                                       this.clipboard[i].cell + this.current_cell[1], 
                                       this.clipboard[i].value);
        }
    }
    @action deleteSelectedCells(){
        if(this.select_state) {

            let min_channel = _.min([this.init_selection_cell[0], this.last_selection_cell[0]]);
            let min_cell    = _.min([this.init_selection_cell[1], this.last_selection_cell[1]]);
            let max_channel = _.max([this.init_selection_cell[0], this.last_selection_cell[0]]);
            let max_cell    = _.max([this.init_selection_cell[1], this.last_selection_cell[1]]);


            for (let i = 0; i <= max_channel-min_channel; i++)
                for (let j = 0; j <= max_cell-min_cell; j++)
                    channelStore.getActiveChannels[i+min_channel].cells[j+min_cell] = '';
            
        }
    }


    @action selectCell(channel_i, cell_i) {
        if (channel_i < 0 || channel_i >= channelStore.getActiveChannels.length ||
            cell_i < 0 || cell_i >= channelStore.getActiveChannels[channel_i].steps) 
        {
            return false;
        }

        if (this.select_state) {
            this.current_cell[0] = channel_i;            this.current_cell[1] = cell_i;
            this.init_selection_cell[0] = channel_i;     this.init_selection_cell[1] = cell_i;
            this.last_selection_cell[0] = channel_i;     this.last_selection_cell[1] = cell_i;
            return true;
        }
        // deselect case
        else {
            this.current_cell[0] = null;            this.current_cell[1] = null;
            this.init_selection_cell[0] = null;     this.init_selection_cell[1] = null;
            this.last_selection_cell[0] = null;     this.last_selection_cell[1] = null;
            return false;
        }
    }
    @action selectMultipleCells(channel_i, cell_i) {
        if (channel_i < 0 || channel_i >= channelStore.getActiveChannels.length ||
            cell_i < 0 || cell_i >= channelStore.getActiveChannels[channel_i].steps) 
        {
            return ;
        }

        this.current_cell[0] = channel_i;            this.current_cell[1] = cell_i;
        this.last_selection_cell[0] = channel_i;     this.last_selection_cell[1] = cell_i;
    }

    @action navigateCell(direction) {
        if(this.select_state) {
            switch (direction) {
                case 'left':
                    this.selectCell(this.current_cell[0]-1, this.current_cell[1]);
                    break;
                case 'up':
                    this.selectCell(this.current_cell[0], this.current_cell[1]-1);
                    break;
                case 'right':
                    this.selectCell(this.current_cell[0]+1, this.current_cell[1]);
                    break;
                case 'down':
                    this.selectCell(this.current_cell[0], this.current_cell[1]+1);
                    break;
                default:
                    break;
            }
        }
    }

    @action selectCellOnDirection(direction) {
        if(this.select_state) {
            switch (direction) {
                case 'left':
                    this.selectMultipleCells(this.current_cell[0]-1, this.current_cell[1]);
                    break;
                case 'up':
                    this.selectMultipleCells(this.current_cell[0], this.current_cell[1]-1);
                    break;
                case 'right':
                    this.selectMultipleCells(this.current_cell[0]+1, this.current_cell[1]);
                    break;
                case 'down':
                    this.selectMultipleCells(this.current_cell[0], this.current_cell[1]+1);
                    break;
                default:
                    break;
            }
        }
    }

    //////////////////////////////
    @action updateCell(channel, cell_index, cell_value) {
        let ch = _.find(channelStore.getActiveChannels, { 'name': channel, 'scene': sceneStore.active_scene });
        if(ch !== undefined) {
            ch.cells[cell_index] = cell_value;
        }
    }

    isCellActive(channel, index) {
        let ch = _.find(channelStore.getActiveChannels, { 'name': channel, 'scene': sceneStore.active_scene });
        if(ch !== undefined) {
            return ch.time % ch.steps === index;
        }
    }
}

export default new CellStore();
