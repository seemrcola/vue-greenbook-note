import { effect } from "./effect.js";
import { track, trigger } from './reactive'

export function computed(getter) {
    let value
    let dirty = true //脏值检查,第一次设置为true，保证第一次读取能获取到值
    const effectFn = effect(getter, {
        lazy:true,
        scheduler() {    // >>>>>>>>>>>新增  trigger的时候生效
            dirty = true
            // 当计算属性依赖的响应式数据变化时，手动调用 trigger 函数触发响应
            trigger(obj, 'value')
        }
    })
    const obj = {
        get value() {
            if(dirty) {
                value = effectFn()  //effectFn执行意味着getter执行
                dirty = false
            }
            // 当读取 value 时，手动调用 track 函数进行追踪
            track(obj, 'value')
            return value
        }
    }
    return obj
}
// Q：收集的能力是哪里来的：
// A：effect，effect的第一个参数(fn)会被(他所依赖的属性)收集

// Q：收集到的是哪个副作用函数
// A：收集到的是EffectFn，只是getter在effectFn内执行
