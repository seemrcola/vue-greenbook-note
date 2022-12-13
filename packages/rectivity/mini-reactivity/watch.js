import { effect } from './effect'
import { isObject, isNull } from "./utils.js";

//用到的时候才计算
export function watch(source, callback, options = {}) {
    let getter
    if(typeof source === 'function') {
        getter = source
    }
    else {
        getter = () => traverse(source)
    }
    effect(
        () => getter(),
        {
            scheduler() {
                callback()
            }
        }
    )
}

//这是一个通用的读取操作，读取操作会触发依赖收集
function traverse(source, seen = new Set()) {
    if(isNull(source) || !isObject(source) || seen.has(source)) {
        //null 非object 以及被收集过，都将不触发任何操作
        return
    }
    seen.add(source)
    for(let key in source) {
        traverse(source[key], seen)
    }
    return source
}
