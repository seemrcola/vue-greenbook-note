// proxy set get delete
import  { track, trigger } from './effect.js'
import { isObject } from "./utils.js";
import { reactive } from "./reactive.js";

function createGetter(isShallow) {
    return function get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver)
        track(target, 'get', key)
        if(isObject(res)) {
            return isShallow ? res : reactive(res)
        }
        return res
    }
}
function set(target, key, val, receiver) {
    Reflect.set(target, key, val, receiver)
    trigger(target, 'set', key, val)
    return true
}
export const mutableHandlers = {
    get: createGetter(false),
    set
}

export const shallowHandlers = {
    get: createGetter(true),
    set
}
