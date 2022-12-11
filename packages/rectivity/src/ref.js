import { reactive } from './reactive'
export function ref(val) {
    const wrapper = {
        value: val
    }
    Object.defineProperty(wrapper, '__v_isRef', {
        value: true
    })
    return reactive(wrapper)
}

//单个
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
//多个
export function toRefs(obj) {
    const ret = {}
    for(let prop in obj) {
        ret[prop] = toRef(obj, prop)
    }
    Object.defineProperty(ret, '__v_isRef', {
        value: true
    })
    return ret
}

/*自动脱ref*/
export function proxyRefs(target) {
    return new Proxy(target, {
        get(target, key, receiver) {
            const value = Reflect.get(target, key, receiver)
            return value.__v_isRef ? value.value : value
        },
        set(target, key, newValue, receiver) {
            const value = target[key]
            if (value.__v_isRef) {
                value.value = newValue
                return true
            }
            return Reflect.set(target, key, newValue, receiver)
        }
    })
}
