let activeEffect
// effect 栈
const effectStack = [] // 新增
export const ITERATE_KEY = Symbol() // for in 操作的key

export function getActiveEffect() {
  return activeEffect
}
export function effect(fn, options = {}) {
  //这个写法在第一次完成初始化，在后续的时候又能保证每次都执行cleanup
  //！！！：该次执行已经执行，会再次收集依赖，无需收集的分支在这次之后不会收集
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn) // 入栈
    let res = fn()
    effectStack.pop() // 出栈
    activeEffect = effectStack[effectStack.length - 1] // 修改指向
    return res
  }
  effectFn.options = options //让用户可以配置一些属性来实现调度
  effectFn.deps = []
  // effectFn()
  if(!options.lazy) {
    effectFn()
  }
  return effectFn //如果lazy，则不会立即执行
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    let deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}


