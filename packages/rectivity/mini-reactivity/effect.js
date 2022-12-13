/**
 * targetMap 格式大致如下：
 * {
 *     obj1: {
 *       prop1: [effect1, effect2],
 *       prop2: [effect1, effect2]
 *     },
 *     obj2: {
 *       prop1: [effect1, effect2],
 *       prop2: [effect1, effect2]
 *     }
 * }
 */
const targetMap = new WeakMap()

let activeEffect = null
const effectStack = []

export function effect(fn, options = {}) {
    const effectFn = () => {
        try {
            cleanup(effectFn)
            activeEffect = effectFn
            effectStack.push(activeEffect)
            fn()
        } finally {
            activeEffect = null
        }
    }
    //这里为了实现cleanup我们需要反过来知道副作用函数被哪些属性依赖
    effectFn.deps = []
    effectFn.options = options
    effectFn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return effectFn
}

/**
 * 我们首先依靠deps中存储的所有属性及其依赖，即targetMap[objName][propName]['deps']
 * 我们依靠这个信息删除掉属性中的当前函数（依赖）
 */
function cleanup(effectFn) {
    for(let i = 0; i< effectFn.deps.length; i++) {
        // deps里存放的全是依赖了这个副作用函数的属性，现在将这些属性中的这个副作用函数的依赖删除
        effectFn.deps[i].delete(effectFn)
    }
    // 再清空这个队列
    effectFn.deps.length = 0
}

/*get操作触发track进行收集*/
export function track(target, type, key) {
    let depsMap = targetMap.get(target)
    if(!depsMap)
        targetMap.set(target, depsMap = new Map())
    let deps = depsMap.get(key)
    if(!deps)
        depsMap.set(key, deps = new Set())
    if(activeEffect) {
        deps.add(activeEffect)
        activeEffect.deps.push(deps)
    }
}

/*set操作触发trigger执行副作用函数*/
export function trigger(target, type, key ,newv) {
    let depsMap = targetMap.get(target)
    if(!depsMap) return
    let deps = depsMap.get(key)
    if(!deps) return
    // 防止set delete和add两个操作同时出现，导致set遍历无限执行
    const effectToRun = new Set(deps)
    effectToRun.forEach(effect => {
        if(effect.options.scheduler) {
            effect.options.scheduler(effect)
        }
        else {
            effect()
        }
    })
}
