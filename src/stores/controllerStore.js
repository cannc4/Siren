import {
    observable,
    action,
    computed
} from 'mobx';
import io from 'socket.io-client';
import _ from 'lodash';
import rollStore from './rollStore';

const max_param_no = 10;

class controllerStore {

    sc_log_socket = io('http://localhost:4002/');
    @observable value = 20;
    @observable params = [{}]
    @observable scmsg;

    constructor(){
        let ctx = this;    
        // this.sc_log_socket.on("/sclog", action((data) => {
        //     ctx.sc = data.trigger;
        //     _.each(_.keys(ctx.sc), (k) => {
        //     if (!ctx.params.hasOwnProperty(k)){
        //         ctx.params.push (k);

        //     }
        // });

        // }))
    }
    @observable params = _.fill(Array(max_param_no), [])

    @action
    changeVal(val){this.value = val}
    
    @computed get latestPatterns() {
        return this.channels_history.filter(h => h.length !== 0);
    }

    @action updateParameters(){

        rollStore.treeRoot.walk({
            strategy: 'post'
        }, (n) => {
            // leaf node
            if (!n.hasChildren()) {


                // _.each(n.model, (param) => {
                //     console.log(param);
                //     model.type
                // })
            }
        });
    }


}
export default new controllerStore();