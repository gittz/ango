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
import {isPlainObject, noop} from "./vue/shared/util";
import Dep from "./vue/observer/dep";
import {nativeWatch} from "./vue/util/env";

//配置
options.beforeUnmount = function (component) {
    if (component._watcher) {
        component._watcher.teardown()
    }
    let i = component._watchers.length
    while (i--) {
        component._watchers[i].teardown()
    }
}

const computedWatcherOptions = {lazy: true}

function initComputed(vm, computed) {
    const watchers = vm._computedWatchers = Object.create(null)
    // computed properties are just getters during SSR

    for (const key in computed) {
        const userDef = computed[key]
        const getter = typeof userDef === 'function' ? userDef : userDef.get
        // create internal watcher for the computed property.
        watchers[key] = new Watcher(
            vm,
            getter || noop,
            noop,
            computedWatcherOptions
        )

        // component-defined computed properties are already defined on the
        // component prototype. We only need to define computed properties defined
        // at instantiation here.
        if (!(key in vm)) {
            defineComputed(vm, key, userDef)
        }
    }
}

export function defineComputed(target, key, userDef) {
    const shouldCache = true
    if (typeof userDef === 'function') {
        sharedPropertyDefinition.get = shouldCache
            ? createComputedGetter(key)
            : userDef
        sharedPropertyDefinition.set = noop
    } else {
        sharedPropertyDefinition.get = userDef.get
            ? shouldCache && userDef.cache !== false
                ? createComputedGetter(key)
                : userDef.get
            : noop
        sharedPropertyDefinition.set = userDef.set
            ? userDef.set
            : noop
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

function createComputedGetter(key) {
    return function computedGetter() {
        const watcher = this._computedWatchers && this._computedWatchers[key]
        if (watcher) {
            if (watcher.dirty) {
                watcher.evaluate()
            }
            if (Dep.target) {
                watcher.depend()
            }
            return watcher.value
        }
    }
}

function initWatch(vm, watch) {
    for (const key in watch) {
        const handler = watch[key]
        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler[i])
            }
        } else {
            createWatcher(vm, key, handler)
        }
    }
}

function createWatcher(vm,
                       keyOrFn,
                       handler,
                       options) {
    if (isPlainObject(handler)) {
        options = handler
        handler = handler.handler
    }
    if (typeof handler === 'string') {
        handler = vm[handler]
    }
    return vm.$watch(keyOrFn, handler, options)
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
        if (this.computed) initComputed(this, this.computed)
        if (this.watch && this.watch !== nativeWatch) {
            initWatch(this, this.watch)
        }
        this._watcher = new Watcher(this, () => {
            this.forceUpdate()
        })
    }

    $watch(expOrFn, cb, options) {
        const vm = this
        if (isPlainObject(cb)) {
            return createWatcher(vm, expOrFn, cb, options)
        }
        options = options || {}
        options.user = true
        const watcher = new Watcher(vm, expOrFn, cb, options)
        if (options.immediate) {
            cb.call(vm, watcher.value)
        }
        return function unwatchFn() {
            watcher.teardown()
        }
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
