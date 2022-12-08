import { reactive } from './reactive'
export function ref(val) {
    const wrapper = {
        value: val
    }
    Object.defineProperty(wrapper, '__v_ref', {
        value: true
    })
    return reactive(wrapper)
}
