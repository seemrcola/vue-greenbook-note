import { getActiveEffect, ITERATE_KEY } from './effect'

let bucket = new WeakMap() //用于存储

export function createReactive(obj, shallowRef = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if(key === 'raw') return target
      const res = Reflect.get(target, key, receiver)
      track(target, key)
      // 如果是浅响应，则直接返回
      if(shallowRef) return res
      if (typeof res === 'object' && res !== null) {
        return reactive(res)
      }
      return res
    }
  })
}

export function reactive(data, isShallow= false) {
  return new Proxy(data, {
    get(target, key, receiver) {
      if(key === 'raw') return target

      track(target, key)

      const res = Reflect.get(target, key, receiver)
      // 如果是浅响应，则直接返回
      if(isShallow) return res
      // 深响应，则直接递归
      if (typeof res === 'object' && res !== null) {
        return reactive(res)
      }
      return res
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      // 如果属性不存在，则说明是在添加新属性，否则是设置已有属性
      const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
      //先修改
      const res = Reflect.set(target, key, value, receiver)
      //再通知所有副作用函数
     if(target === receiver.raw) {
       if(oldValue !== value) {
         trigger(target, key, type)
       }
     }
      return res
    },
    has(target, key) {
      track(target, key)
      return Reflect.has(target, key)
    },
    ownKeys(target) {
      track(target, ITERATE_KEY)
      return Reflect.ownKeys(target)
    },
    deleteProperty(target, key) {
      // 检查被操作的属性是否是对象自己的属性
      const hadKey = Object.prototype.hasOwnProperty.call(target, key)
      // 使用 Reflect.deleteProperty 完成属性的删除
      const res = Reflect.deleteProperty(target, key)
      if (res && hadKey) {
        // 只有当被删除的属性是对象自己的属性并且成功删除时，才触发更新
        trigger(target, key, 'DELETE')
      }
      return res
    }
  })
}

export function track(target, key) {
  let activeEffect = getActiveEffect()
  //如果没有副作用函数，直接return即可
  if (!activeEffect) return
  //如果存在副作用函数，则按如下情况：
  let depsMap = bucket.get(target)
  // ！未获取到对应target的存储 则建立存储
  if (!depsMap) bucket.set(target, (depsMap = new Map()))

  let deps = depsMap.get(key)
  // ！未获取到对应key的存储 则建立存储
  if (!deps) depsMap.set(key, (deps = new Set()))
  // 添加依赖
  deps.add(activeEffect)

  // deps 就是一个与当前副作用函数存在联系的依赖集合
  // 将其添加到 activeEffect.deps 数组中
  activeEffect.deps.push(deps)
  // console.log('effect run')
}

export function trigger(target, key, type) {
  let deps = bucket.get(target)
  if (!deps) return
  // 普通相关联的副作用函数
  const effects = deps.get(key)

  let effectToRun = new Set()
  // 常规关联的副作用函数添加
  effects && effects.forEach(effectFn => {
    // 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
    if (effectFn !== getActiveEffect()) { // 新增
      effectToRun.add(effectFn)
    }
  })
  // 将与 ITERATE_KEY 相关联的副作用函数也添加到 effectsToRun
  if(type === 'ADD' || type === 'DELETE') {
    // 取得与 ITERATE_KEY 相关联的副作用函数
    const iterateEffects = deps.get(ITERATE_KEY)
    iterateEffects && iterateEffects.forEach(effectFn => {
      if (effectFn !== getActiveEffect()) {
        effectToRun.add(effectFn)
      }
    })
  }


  effectToRun.forEach(effectFn => {
    if(effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    }
    else {
      effectFn()
    }
  })
  // effects && effects.forEach(effectFn => effectFn())
}



