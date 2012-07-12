define(['/js/ember.js.gz','app'],function(Ember,Radar){
    Ember = window.Ember;
    Radar.Base = Ember.Object.extend({
        path: null,
        name:null,
        parent: null,                    
        selected: false,
        init: function(){
            var parentNodes;
            var parent = this.get('path').substring(0,this.path.lastIndexOf('.'))
            this.set('name',this.get('path').split('.').pop());
            this.set('parent',parent);  
            if(parent !== '' ) {                
                parentNodes = Radar.nodesController.content.filterProperty('path',this.parent);
                if(parentNodes && parentNodes[0]) {
                    if( parentNodes[0].get('selected') ) {
                        this.set('selected',true);
                    }
                    parentNodes[0].addObserver('selected',this,function(sender,key,value,rev){
                        this.set('selected',value);
                    });
                }
            }          
            if(Radar.urlController.get('selectedFromURL').indexOf(this.path) != -1) {
                this.set('selected',true);
            }
        },
        urlObserver: function() {
            if(Radar.urlController.get('selectedFromURL').indexOf(this.path) != -1) {
                this.set('selected',true);
            }
            else {
                this.set('selected',false);
            }
        }.observes('Radar.urlController.selectedFromURL')
    });

    Radar.Method = Radar.Base.extend({
        schema: null,
        init: function(){
            this._super();
        },
        call: function(args,callbacks) {
            Radar.callMethod(this.get('path'),args,callbacks);
        },
    });

    Radar.State = Radar.Base.extend({
        schema: null,
        prev: null,                    
        value: Ember.computed(function(key,value) {
            var date;
            var prev = this.get('prev');
            if(arguments.length===1) {
                return prev.value;
            }
            else {
                if(prev) {
                    this.get('history').add(prev);
                }    
                date = new Date();
                var days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];                
                this.set('prev',{
                    date:{
                        time: date.toLocaleTimeString(),
                        day: days[date.getDay()-1]
                    },
                    value:value
                });
                return value;
            }
        }),
        init: function(){
            this.history = Ember.ArrayProxy.create({
                content: [],
                updateCount: 0,
                add: function(obj) {  
                    var histItem = {
                        date: obj.date,
                        value: JSON.stringify(obj.value,null,2)
                    }
                    if(this.content.length > 3) {
                        this.popObject();
                    }
                    this.incrementProperty('updateCount');
                    this.unshiftObject(Ember.Object.create(histItem));
                }
            });
            this._super();
        },
        change: function(new_val,callbacks) {    
            Radar.changeState(this.get('path'),new_val,{
                success: function() {                            
                    console.log('SET SUCCEEDED');
                    if(callbacks.success) {
                        callbacks.success();
                    }
                },
                error: function(err) {
                    console.log('SET FAILED',err);
                    if(callbacks.error) {
                        callbacks.error(err);
                    }
                }
            });
        },
    });

    Radar.Node = Radar.Base.extend({
        states: [],
        methods: [],
        nodes: [],
        init: function(){
            this._super();
        },
    });
    return Radar;
});
