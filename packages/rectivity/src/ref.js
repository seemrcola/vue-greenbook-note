import { reactive } from './reactive'
export function toRef(obj, key) {
    const wrapper = {
        get value() {
            return obj[key]
        },
        set value(val) {
            obj[key] = val
        }
    }
    return wrapper
}
export function toRefs(obj) {
    const ret = {}
    for(let prop in obj) {
        ret[prop] = toRef(obj, prop)
    }
    Object.defineProperty(ret, '__v_ref', {
        value: true
    })
    return ret
}
