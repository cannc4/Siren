import {
    observable,
    action,
    computed
} from 'mobx';
import _ from 'lodash';

import channelStore from './channelStore';
// import sceneStore from './sceneStore';
import {
    executionCssById
} from '../keyFunctions';

class CellStore {
    @observable select_state = false;
    @observable current_cell = [null, null];
    @observable init_selection_cell = [null, null];
    @observable last_selection_cell = [null, null];

    clipboard = [];

    // -- Getters
    @computed get isSelected() {
        return this.select_state;
    }

    // -- Clipboard operations
    copyCells() {
        if (this.select_state) {
            this.clipboard = [];

            let min_channel = _.min([this.init_selection_cell[0], this.last_selection_cell[0]]);
            let min_cell = _.min([this.init_selection_cell[1], this.last_selection_cell[1]]);
            let max_channel = _.max([this.init_selection_cell[0], this.last_selection_cell[0]]);
            let max_cell = _.max([this.init_selection_cell[1], this.last_selection_cell[1]]);

            for (let i = 0; i <= max_channel - min_channel; i++)
                for (let j = 0; j <= max_cell - min_cell; j++)
                    this.clipboard.push({
                        channel: i,
                        cell: j,
                        value: channelStore.getActiveChannels[i + min_channel].cells[j + min_cell]
                    });
        }
    }
    @action cutCells() {
        this.copyCells();
        this.deleteSelectedCells();
    }
    @action pasteCells() {
        for (let i = 0; i < this.clipboard.length; i++) {
            channelStore.overwriteCell(this.clipboard[i].channel + this.current_cell[0],
                this.clipboard[i].cell + this.current_cell[1],
                this.clipboard[i].value);
        }
    }
    @action deleteSelectedCells() {
        if (this.select_state) {
            let min_channel = _.min([this.init_selection_cell[0], this.last_selection_cell[0]]);
            let min_cell = _.min([this.init_selection_cell[1], this.last_selection_cell[1]]);
            let max_channel = _.max([this.init_selection_cell[0], this.last_selection_cell[0]]);
            let max_cell = _.max([this.init_selection_cell[1], this.last_selection_cell[1]]);

            for (let i = 0; i <= max_channel - min_channel; i++)
                for (let j = 0; j <= max_cell - min_cell; j++)
                    channelStore.getActiveChannels[i + min_channel].cells[j + min_cell] = '';
        }
    }

    // -- Compile single cell
    compileCell() {
        let channel_i = this.current_cell[0];
        let cell_i = this.current_cell[1];
        if (this.select_state) {
            channelStore.sendPattern(channelStore.getActiveChannels[channel_i], channelStore.getActiveChannels[channel_i].cells[cell_i]);
            executionCssById('cell_' + channel_i + '_' + cell_i, ' Executed');
            channelStore.updateTime(channel_i,cell_i);
        }
    }

    // -- Compile all cells in the selected step
    compileStep() {
        let cell_i = this.current_cell[1];
        _.each(channelStore.getActiveChannels, (ch, i) => { 
            channelStore.sendPattern(ch,ch.cells[cell_i]);
            executionCssById('cell_' + i + '_' + cell_i, ' Executed');
        });
    }
    
    
    // -- Updates
    @action updateSelectState(flag) {
        this.select_state = flag;
    }
    @action updateCellValue(channel_index, cell_index, cell_value) {
        let ch = channelStore.getActiveChannels[channel_index];
        if (ch !== undefined) {
            ch.cells[cell_index] = cell_value;
        }
    }
    @computed get updateCellSelectedClasses() { 
        // deselect all
        for (let i = 0; i < channelStore.getActiveChannels.length; i++) {
            const element = channelStore.getActiveChannels[i];
            for (let j = 0; j < element.cells.length; j++) {
                let dom_cell = document.getElementById('cell_' + i + '_' + j);
                if (dom_cell) { 
                    dom_cell.className = _.replace(dom_cell.className, ' selected', ''); 
                    dom_cell.className = _.replace(dom_cell.className, ' highlighted', ''); 
                }
            }
        }

        // select
        if (this.select_state) {
            let min_channel = _.min([this.init_selection_cell[0], this.last_selection_cell[0]]);
            let min_cell = _.min([this.init_selection_cell[1], this.last_selection_cell[1]]);
            let max_channel = _.max([this.init_selection_cell[0], this.last_selection_cell[0]]);
            let max_cell = _.max([this.init_selection_cell[1], this.last_selection_cell[1]]);

            // Highlight
            let dom_cell = document.getElementById('cell_' + this.current_cell[0] + '_' + this.current_cell[1]);
            if (dom_cell) dom_cell.className += ' highlighted'; 
            
            // Select
            for (let i = 0; i <= max_channel - min_channel; i++) {
                for (let j = 0; j <= max_cell - min_cell; j++) { 
                    dom_cell = document.getElementById('cell_' + (i + min_channel) + '_' + (j + min_cell));
                    if (dom_cell) dom_cell.className += ' selected'; 
                }
            }   
        }
    }

    // -- Select operations
    @action selectCell(channel_i, cell_i) {
        if (channel_i < 0 || channel_i >= channelStore.getActiveChannels.length ||
            cell_i < 0 || cell_i >= channelStore.getActiveChannels[channel_i].steps) {
            return false;
        }

        // works as a toggle
        if (this.select_state) {
            this.current_cell[0] = channel_i;
            this.current_cell[1] = cell_i;
            this.init_selection_cell[0] = channel_i;
            this.init_selection_cell[1] = cell_i;
            this.last_selection_cell[0] = channel_i;
            this.last_selection_cell[1] = cell_i;
            return true;
        } else {
            this.current_cell[0] = null;
            this.current_cell[1] = null;
            this.init_selection_cell[0] = null;
            this.init_selection_cell[1] = null;
            this.last_selection_cell[0] = null;
            this.last_selection_cell[1] = null;
            return false;
        }
    }
    @action selectMultipleCells(channel_i, cell_i) {
        if (channel_i < 0 || channel_i >= channelStore.getActiveChannels.length ||
            cell_i < 0 || cell_i >= channelStore.getActiveChannels[channel_i].steps) {
            return;
        }

        this.current_cell[0] = channel_i;
        this.current_cell[1] = cell_i;
        this.last_selection_cell[0] = channel_i;
        this.last_selection_cell[1] = cell_i;
    }

    // -- Navigation
    @action navigateCell(direction) {
        if (this.select_state) {
            switch (direction) {
                case 'left':
                    this.selectCell(this.current_cell[0] - 1, this.current_cell[1]);
                    break;
                case 'up':
                    this.selectCell(this.current_cell[0], this.current_cell[1] - 1);
                    break;
                case 'right':
                    this.selectCell(this.current_cell[0] + 1, this.current_cell[1]);
                    break;
                case 'down':
                    this.selectCell(this.current_cell[0], this.current_cell[1] + 1);
                    break;
                default:
                    break;
            }
        }
    }
    @action selectCellOnDirection(direction) {
        if (this.select_state) {
            switch (direction) {
                case 'left':
                    this.selectMultipleCells(this.current_cell[0] - 1, this.current_cell[1]);
                    break;
                case 'up':
                    this.selectMultipleCells(this.current_cell[0], this.current_cell[1] - 1);
                    break;
                case 'right':
                    this.selectMultipleCells(this.current_cell[0] + 1, this.current_cell[1]);
                    break;
                case 'down':
                    this.selectMultipleCells(this.current_cell[0], this.current_cell[1] + 1);
                    break;
                default:
                    break;
            }
        }
    }

    // /*------------------------------------------
    //     Render existing code
    // ------------------------------------------*/
    // $(document).on('ready', function(){
    //     hightlightSyntax();

    //     emmet.require('textarea').setup({
    //     pretty_break: true,
    //     use_tab: true
    //     });
    // });
    // /*------------------------------------------
    //     Capture text updates
    // ------------------------------------------*/
    // $(document).on('ready load keyup keydown change', '.editor', function(){
    //     correctTextareaHight(this);
    //     hightlightSyntax();
    // });


    /*------------------------------------------
        Resize textarea based on content  
    ------------------------------------------*/
    // correctTextareaHight(element)
    // {
    // var self = $(element),
    //     outerHeight = self.outerHeight(),
    //     innerHeight = self.prop('scrollHeight'),
    //     borderTop = parseFloat(self.css("borderTopWidth")),
    //     borderBottom = parseFloat(self.css("borderBottomWidth")),
    //     combinedScrollHeight = innerHeight + borderTop + borderBottom;

    //     if(outerHeight < combinedScrollHeight )
    //     {
    //         self.height(combinedScrollHeight);
    //     }
    // }


    /*------------------------------------------
        Run syntax hightlighter  
    ------------------------------------------*/
    // hightlightSyntax(){
    //     var me  = $('.editor');
    //     var content = me.val();
    //     var codeHolder = $('code');
    //     var escaped = this.escapeHtml(content);

    //     codeHolder.html(escaped);

    //     $('.syntax-highight').each(function(i, block) {
    //         hljs.highlightBlock(block);
    //     });
    // }


    /*------------------------------------------
        String html characters
    ------------------------------------------*/
    // escapeHtml(unsafe) {
    //     return unsafe
    //             .replace(/&/g, "&amp;")
    //             .replace(/</g, "&lt;")
    //             .replace(/>/g, "&gt;")
    //             .replace(/"/g, "&quot;")
    //             .replace(/'/g, "&#039;");
    // }

}

export default new CellStore();