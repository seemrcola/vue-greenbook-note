import { isObject } from "./utils.js";
import {reactive} from "./reactive.js";
import {track, trigger} from "./effect.js";

class RefImpl {
    constructor(val) {
        this.__isRef__ = true
        this.__val = val
    }
    get value() {
        track(this, 'ref-get', 'value')
        return this.__val
    }

    set value(val) {
        if(val !== this.__val) {
            this.__val = val
            trigger(this, 'ref-set', 'value')
        }
    }
}

export function isRef(val) {
    return !!(val && val.__isRef__)
}

export function ref(val) {
    if(isRef(val)) return val
    return new RefImpl(val)
}
function convert(val) {
    return isObject(val) ? reactive(val) : val
}
