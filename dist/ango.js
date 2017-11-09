(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() : typeof define === 'function' && define.amd ? define(factory) : factory();
})(this, function () {
    'use strict';

    var B = function B() {};

    var A = function A() {
        this.a = 1;
    };

    A.prototype.t = function t() {};

    A.prototype.render = function render() {
        return h(B, null, "123");
    };
});