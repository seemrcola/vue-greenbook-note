import { track, trigger } from './observer'
import { ITERATE_KEY } from './effect'

export function createReactive(data, isShallow = false, isReadonly = false) {
  return new Proxy(data, {
    get(target, key, receiver) {
      if(key === 'raw') return target
      if(isReadonly) {
        console.warn(`property ${key} is readonly`)
        return true
      }
      //只有非只读才会追踪 同时我们页不追踪symbol属性
      if(!isReadonly && typeof key !== 'symbol') {
        track(target, key)
      }
      const res = Reflect.get(target, key, receiver)
      // 如果是浅响应，则直接返回
      if(isShallow) return res
      // 深响应，则直接递归
      if (typeof res === 'object' && res !== null) {
        return isReadonly ? readonly(res) : reactive(res)
      }
      return res
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      // 如果属性不存在，则说明是在添加新属性，否则是设置已有属性
      let type
      if(Array.isArray(target)) {
        type = Number(key) < target.length ? 'SET' : 'ADD'
      }
      else {
        type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
      }

      //先修改
      const res = Reflect.set(target, key, value, receiver)
      //再通知所有副作用函数
      if(target === receiver.raw) {
        if(oldValue !== value) {
          trigger(target, key, type, value)
        }
      }
      return res
    },
    has(target, key) {
      track(target, key)
      return Reflect.has(target, key)
    },
    ownKeys(target) {
      // 数组
      if(Array.isArray(target)) {
        track(target, 'length')
      }
      // 对象
      else {
        track(target, ITERATE_KEY)
      }

      return Reflect.ownKeys(target)
    },
    deleteProperty(target, key) {
      if(isReadonly) {
        console.warn(`property ${key} is readonly`)
        return true
      }
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

export function reactive(data) {
  return createReactive(data)
}
export function shallowReactive(data) {
  return createReactive(data, true)
}

export function readonly(data) {
  return createReactive(data, false, true)
}

export function shallowReadonly(data) {
  return createReactive(data, true, true)
}

