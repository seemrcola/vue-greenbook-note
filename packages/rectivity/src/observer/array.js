import { getActiveEffect } from '../effect'
export function todoArrayTrigger( key, newValue, deps = {}) {
    //这里的value就是新的下标
    const { deps: depsMap, effectToRun, type} =  deps
    // 数组本质上是个对象
    // 当操作类型为 ADD 并且目标对象是数组时，应该取出并执行那些与 length 属性相关联的副作用函数
    // set本质上还是走对象的set处理
    if(type === 'ADD') {
        const lengthEffects = depsMap.get('length')
        if(lengthEffects) {
            lengthEffects.forEach(fn => {
                if(getActiveEffect() !== fn) {
                    effectToRun.add(fn)  //改变原set对象
                }
            })
        }
    }
    if(key === 'length') {
        depsMap.forEach((effects, key) => {
            if(key >= newValue) {
                effects.forEach(fn => {
                    if(getActiveEffect() !== fn) {
                        effectToRun.add(fn)
                    }
                })
            }
        })
    }
}
