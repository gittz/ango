(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() : typeof define === 'function' && define.amd ? define(factory) : factory();
})(this, function () {
    'use strict';

    var A = function A() {
        this.a = 1;
    };

    A.prototype.t = function t() {};

    A.prototype.render = function render() {
        return h('span', null, "123");
    };
});