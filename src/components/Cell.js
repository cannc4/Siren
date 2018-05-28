import React from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';

import { save, timer } from '../keyFunctions'

// import Prism from 'prismjs'

import '../styles/Cell.css'

@inject('cellStore')
@observer
export default class Cell extends React.Component {
    
    handleKeys = (event, channel_index, cell_index) => {

        // console.log(event.keyCode);
        // 8 -> backspace
        // 46 -> del
        // 27 esc

        // start timer
        if((event.metaKey || event.ctrlKey) && event.keyCode === 13) {
            timer();
            event.preventDefault();
        }

        //compile pattern with the parsed parameters + channel props cmd + enter
        else if(event.altKey && event.keyCode === 13) {
            this.props.cellStore.compileCell();
            event.preventDefault();            
        }

        // deselect with esc    
        else if (event.keyCode === 27) {
            this.props.cellStore.updateSelectState(false);
            let elem = document.getElementById('cell_'+this.props.cellStore.current_cell[0]+"_"+
                                                       this.props.cellStore.current_cell[1]);
            if (elem)
                elem.focus();
            this.props.cellStore.selectCell(channel_index, cell_index);
            this.nameInput.readOnly = false;

            event.preventDefault();            
        }
        
        //select with enter
        else if(event.keyCode === 13) {
            if(!this.props.cellStore.isSelected) {
                this.props.cellStore.updateSelectState(true);
                this.props.cellStore.selectCell(channel_index, cell_index);
                this.nameInput.readOnly = true;
            }
            else {
                this.props.cellStore.updateSelectState(false);
                let elem = document.getElementById('cell_'+this.props.cellStore.current_cell[0]+"_"+
                    this.props.cellStore.current_cell[1]);
                
                if (elem)
                    elem.focus();
                this.props.cellStore.selectCell(channel_index, cell_index);
                this.nameInput.readOnly = false;
            }
            event.preventDefault();
        }
        // copy cells
        else if((event.metaKey || event.ctrlKey) && event.key === 'c') {
            if(this.props.cellStore.isSelected){
                event.preventDefault();
                this.props.cellStore.copyCells();
            } 
        }
        // paste cells
        else if((event.metaKey || event.ctrlKey) && event.key === 'v') {
            if(this.props.cellStore.isSelected) {
                event.preventDefault();
                this.props.cellStore.pasteCells();
            }
        }
        // cut Cells
        else if( (event.metaKey || event.ctrlKey)&& event.key === 'x' ) {
            if(this.props.cellStore.isSelected) {
                this.props.cellStore.cutCells();
                event.preventDefault();
            }
        }
        //delete selected cells (backspace or del)
        else if((this.props.cellStore.isSelected && (event.keyCode === 8 || event.keyCode === 46) )) {
            this.props.cellStore.deleteSelectedCells();
            event.preventDefault();
        }
        
        // shift + left-up-right-down
        else if(event.keyCode === 37 && event.shiftKey) {
            this.props.cellStore.selectCellOnDirection('left');
            if(this.props.cellStore.isSelected) event.preventDefault();
        }
        else if(event.keyCode === 38 && event.shiftKey){
            this.props.cellStore.selectCellOnDirection('up');
            if(this.props.cellStore.isSelected) event.preventDefault();
        }
        else if(event.keyCode === 39 && event.shiftKey){
            this.props.cellStore.selectCellOnDirection('right');
            if(this.props.cellStore.isSelected) event.preventDefault();
        }
        else if(event.keyCode === 40 && event.shiftKey){
            this.props.cellStore.selectCellOnDirection('down');
            if(this.props.cellStore.isSelected) event.preventDefault();   
        }
        // left-up-right-down
        else if(event.keyCode === 37) {
            this.props.cellStore.navigateCell('left');
            if(this.props.cellStore.isSelected) event.preventDefault();
        }
        else if(event.keyCode === 38){
            this.props.cellStore.navigateCell('up');
            if(this.props.cellStore.isSelected) event.preventDefault();
        }
        else if(event.keyCode === 39){
            this.props.cellStore.navigateCell('right');
            if(this.props.cellStore.isSelected) event.preventDefault();
        }
        else if(event.keyCode === 40){
            this.props.cellStore.navigateCell('down');   
            if(this.props.cellStore.isSelected) event.preventDefault();
        }
        // global save
        else if(event.key === 's' && (event.metaKey || event.ctrlKey) ) {
            save();
            event.preventDefault();
        }
        
    }

    render() {
        console.log('RENDER CELL');

        const value = this.props.value;
        const cell_index = this.props.index;
        const channel_index = this.props.channel_index;

        var className = "GridItem";
        className += (cell_index % 2 === 0) ? ' even' : ' odd'; 
        // TODO 
        // Replace with more efficient checking system
        if(this.props.cellStore.isCellActive(channel_index, cell_index)){
            className += ' active';
        }
        if(this.props.cellStore.isCellSelected(channel_index, cell_index)) {
            className += ' selected';
        }
        if(this.props.cellStore.isCellHighlighted(channel_index, cell_index)) {
            className += ' highlighted';
        }
        return (<div>
            <textarea id={'cell_' + channel_index + "_" + cell_index}
                ref={(input) => { this.nameInput = input; }}
                className={className +" draggableCancel"} type="text"
                placeholder={cell_index % 2 === 1 ? _.toString(cell_index+1) : ''}
                value={value}
                onChange={() => 
                    (this.props.cellStore.updateCell(channel_index, cell_index, this.nameInput.value))}
                onKeyDown={(event) => (this.handleKeys(event, channel_index, cell_index))}
                onClick={() => {
                    this.props.cellStore.updateSelectState(false);
                    this.nameInput.focus();
                }}/>
            </div>);

        // return (<div className={"editor-holder"}>
        //     <div className={"scroller"}>    
        //         <textarea
        //             className={"GridItem-core draggableCancel"}    
        //             id={'cell_' + channel_index + "_" + cell_index}
        //             ref={(input) => { this.nameInput = input; }}
        //             placeholder={cell_index % 2 === 1 ? _.toString(cell_index + 1) : ''}
        //             value={value}
        //             onInput={() =>
        //                 (this.props.cellStore.updateCell(item.name, cell_index, this.nameInput.value))}
        //             onKeyDown={(event) => (this.handleKeys(event, channel_index, cell_index))}
        //             onClick={() => {
        //                 this.props.cellStore.updateSelectState(false);
        //                 this.nameInput.focus();
        //             }}/>
        //         <pre><code className={className + " draggableCancel"}
        //             dangerouslySetInnerHTML={{ __html: Prism.highlight(value, Prism.languages.javascript, 'javascript') }}></code></pre>
        //     </div>
        // </div>);
    }
}