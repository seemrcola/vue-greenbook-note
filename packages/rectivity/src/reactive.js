import {getActiveEffect} from './effect'

let bucket = new WeakMap() //用于存储
export function reactive(data) {
  //proxy代理
  //返回代理对象
  return new Proxy(data, {
    get(target, key, receiver) {
      track(target, key)
      //返回值
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      //先修改
      Reflect.set(target, key, value, receiver)
      //再通知所有副作用函数
      trigger(target, key)
      //必须返回一个布尔值
      return true
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

export function trigger(target, key) {
  let deps = bucket.get(target)
  if (!deps) return
  let effects = deps.get(key)

  let effectToRun = new Set()
  effects && effects.forEach(effectFn => {
    // 如果 trigger 触发执行的副作用函数与当前正在执行的副作用函数相同，则不触发执行
    if (effectFn !== getActiveEffect()) { // 新增
      effectToRun.add(effectFn)
    }
  })
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



