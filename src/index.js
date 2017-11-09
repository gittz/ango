import {
    h,
    createElement,
    cloneElement,
    Component as C,
    render,
    rerender,
    options
} from './preact/preact'
import {defineReactive, observerState} from "./vue/observer/index";
import Watcher from "./vue/observer/watcher";
import {extend} from "./preact/util";
import {noop} from "./vue/shared/util";

//配置
options.beforeUnmount = function (component) {
    const watchers = component._watchers.concat([component._watcher])
    for (let i = 0, len = watchers; i < len; i++) {
        watchers[i]()
    }
}

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}

function proxy(target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

export class Component extends C {
    constructor(props, context) {
        super(props, context)
        this._watchers = []
        props = extend({}, this.props)
        for (const key in this.props) {
            defineReactive(this.props, key, props[key])
            proxy(this, 'props', key)
        }
        const state = this.state()
        for (const key in state) {
            defineReactive(this, key, state[key])
        }
        this._watcher = new Watcher(this, () => {
            this.forceUpdate()
        })
    }

    state() {
    }

    shouldComponentUpdate() {
        return false
    }
}

export {
    h,
    createElement,
    cloneElement,
    render,
    rerender
}

export default {
    Component,
    h,
    createElement,
    cloneElement,
    render,
    rerender
}
