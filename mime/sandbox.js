var Sandbox, vm, fs, code,
    requireLike = require('require-like');

vm = require('vm');
fs = require('fs');

Sandbox = function() {
    this.globals = {
        Object: Object,
        Function: Function,
        Array: Array,
        String: String,
        Boolean: Boolean,
        Number: Number,
        Date: Date,
        RegExp: RegExp,
        Error: Error,
        EvalError: EvalError,
        RangeError: RangeError,
        ReferenceError: ReferenceError,
        SyntaxError: SyntaxError,
        TypeError: TypeError,
        URIError: URIError,
        module : {
            exports : {}
        },
        require: undefined
    };
};

Sandbox.prototype.addGlobal = function(name, value) {
    this.globals[name] = value;
};

Sandbox.prototype.require = function(filename) {
    var code = fs.readFileSync(filename);
    if (!this.globals.require) {
        this.globals.require = requireLike(filename, true);
    }
    vm.runInContext(code, vm.createContext(this.globals), filename);
    return this.globals.module.exports;
};

module.exports.Sandbox = Sandbox;
