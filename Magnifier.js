function Magnifier() {

    let
        events = {
            AfterInit: [],
            BeforeDisable: [],
            BeforeDestroy: [],
            AfterDestroy: [],
            OnShow: [],
            OnHide: [],
        },
        id,
        isEnabled = false
    ;

    this.uiObj;
    this.cfg;

    Object.defineProperty(this,'id',{
        get: function(){
            return id;
        },
    });

    Object.defineProperty(this,'isEnabled',{
        get: function(){
            return isEnabled;
        },
    });
 
    function IsObject(param) {
        return param instanceof Object && param.constructor === Object;
    }

    function Extend(param1,param2){

        if (!IsObject(param1) || !IsObject(param2))
            return param2;

        for (let key in param2){
            if (!(key in param1))
                param1[key] = param2[key];
            else
                param1[key] = Extend(param1[key],param2[key]);
        }

        return param1;
    };

    this.PushEvent = function(eventName, funcs) {
        events[eventName].push(funcs);
        return this;
    }

    this.TriggerEvents = function(eventName, scope, params) {
        for (let i in events[eventName])
            if (events[eventName][i].apply(scope, params) === false)
                return false;
        return true;
    }

    this.Disable = function(){
        this.TriggerEvents('BeforeDisable',this);
        Magnifier.prototype.currentMagnifierId = null;
        isEnabled = false;
        return this;
    }

    this.Enable = function(){
        Magnifier.prototype.currentMagnifierId = id;
        isEnabled = true;
        return this;
    }

    this.Show = function(){
        this.TriggerEvents('OnShow',this);
    }

    this.Hide = function(){
        this.TriggerEvents('OnHide',this);
    }

    this.Destroy = function(){
        this.TriggerEvents('BeforeDestroy',this);
    }

    this.Init = function(cfg) {

        this.cfg = Extend({
            events: {},
            uiCfg: {},
            uiConstructorFunc: this.uiConstructorFunc,
        }, IsObject(cfg) ? cfg: {});

        id = 'magnifier-id-' + Magnifier.prototype.uniqueId++;

        this.cfg = cfg;

        if(this.uiConstructorFunc) {
            this.uiObj = new this.uiConstructorFunc(this);
            this.uiObj.Init(this.cfg.uiCfg);
            delete this.cfg.uiConstructorFunc;
        }

        for(let eventName in this.cfg.events)
            this.PushEvent(eventName, this.cfg.events[eventName]);

        this.TriggerEvents('AfterInit',this);
    }
}

Magnifier.prototype.uniqueId = 0;
Magnifier.prototype.currentMagnifierId = null;