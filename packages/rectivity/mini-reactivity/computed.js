import { effect, track, trigger } from './effect'
//用到的时候才计算
export function computed(getter) {
    let value
    let dirty = true

    let effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            //值改变了就置为true，下一次读取computed的时候就会拿到新值
            dirty = true
        }
    })
    //用户手动去拿obj.value,此时来判断是否计算effectFn
    let obj = {
        get value() {
            if(dirty) {
                dirty = false
                value = effectFn()
            }
            return value
        }
    }
    return obj
}
