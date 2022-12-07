import { effect } from './effect'
export function watch(source, cb, options = {}) {
    let getter
    if(typeof source === 'function') {
        getter = source
    }
    else {
        getter = () => traverse(source)
    }
    let newValue , oldValue
    const job = () => {
        // 在 scheduler 中重新执行副作用函数，得到的是新值
        newValue = effectFn()
        cb(newValue, oldValue)
        oldValue = newValue
    }
    const effectFn = effect(
        () => getter(),
        {
            lazy: true,
            scheduler: () => {
                if(options.flush === 'post') {
                    const p = new Promise.resolve()
                    p.then(job)
                }
                else {
                    job()
                }
            }
        }
    )
    if(options.immediate) {
        job()
    }
    else {
        oldValue = effectFn()
    }
}

function traverse(value, seen = new Set()) {
    // seen用来去重，没什么别的用
    // 如果要读取的数据是原始值，或者已经被读取过了，那么什么都不做
    if (typeof value !== 'object' || value === null || seen.has(value))
        return
    seen.add(value)
    for(const k in value) {
        traverse(value[key], seen)
    }
    return value
}
