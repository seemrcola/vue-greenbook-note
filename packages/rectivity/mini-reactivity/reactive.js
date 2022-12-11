import { mutableHandlers, shallowHandlers } from './baseHandlers'

/**
 * reactiveMap 用于存储已经被代理的对象
 * 用于避免重复代理同一个对象
 * 如下：
 * reactive(obj)
 * reactive(obj) //连续执行两次代理obj
 */

export const reactiveMap = new WeakMap()

export function reactive(data) {
    return createReactive(data, reactiveMap, mutableHandlers)
}

export function shallowReactive(data) {
    return createReactive(data, reactiveMap, shallowHandlers)
}

export function createReactive(target, proxyMap, proxyHandlers) {
    // 如果代理的不是对象，抛出错误提示
    if(typeof target !== 'object')
        return console.error('[vue error] reactive only use for object')
    // 查看对象是否已经被代理过
    const proxy = new Proxy(target, proxyHandlers)
    proxyMap.set(target, proxy)
    return proxy
}

