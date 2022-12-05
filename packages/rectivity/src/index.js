import { createReactive } from "./reactive";
export { effect } from "./effect";
export { computed } from './computed'
export function reactive(data) {
    return createReactive(data)
}
export function shallowReactive(data) {
    return createReactive(data, true)
}

