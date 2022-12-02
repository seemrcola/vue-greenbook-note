
## 响应式Reactive

### track追踪
当我们访问某个属性的时候，可以知道当前的副作用函数需要这个属性，那么我们就帮助这个属性做一个**track（追踪）**，
追踪方法即：将该副作用函数收集到该属性对应的deps里。
### trigger触发
当我们设置某个属性的时候，我们需要通知所有读取过这个属性的副作用函数，告诉它们属性改变了。  
行为上就是将所有副作用函数重新执行一遍。

### computed实现
#### 懒执行配置
以前我们的副作用函数都是被**effect**包裹，然后直接执行，如下：
```js
export function effect(fn, options = {}) {
  //这个写法在第一次完成初始化，在后续的时候又能保证每次都执行cleanup
  //！！！：该次执行已经执行，会 再次收集依赖，无需收集的分支在这次之后不会收集
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn) // 入栈
    fn()
    effectStack.pop() // 出栈
    activeEffect = effectStack[effectStack.length - 1] // 修改指向
  }
  effectFn.options = options //让用户可以配置一些属性来实现调度
  effectFn.deps = []
  // effectFn()   =>>>>>>以前这里是最后一行代码，会直接执行
  if(!options.lazy) {
    effectFn()
  }
  return effectFn //如果lazy，则不会立即执行
}
```
现在为了实现懒执行，在判断出options.lazy属性为true的时候，我们直接返回这个函数，这样effectFn没有执行
fn也就没有执行。  (effectFn不执行则不会有副作用函数被收集)  

#### 手动执行
那么接下来，我们就可以获取到这个被返回的函数，来进行手动执行：
```js
let effctResult = effect(fn)
```
单纯的拿到这个返回值来进行手动执行，其实意义不大。

#### 确定方向=>传入getter=>获取需要的值
如果我们把effect传入的fn看作一个**getter**，如下：
```js
const effectFn = effect(
    // getter 返回 obj.foo 与 obj.bar 的和
   () => obj.foo + obj.bar,
   { lazy: true }
)
// value 是 getter 的返回值 
const value = effectFn()
```
由于effectFn目前是没有返回值的(返回undefined)，我们可以直接将fn执行一次拿到值然后返回：
```js
export function effect(fn, options = {}) {
  //这个写法在第一次完成初始化，在后续的时候又能保证每次都执行cleanup
  //！！！：该次执行已经执行，会再次收集依赖，无需收集的分支在这次之后不会收集
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn) // 入栈
    let res = fn()   // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>新增
    effectStack.pop() // 出栈
    activeEffect = effectStack[effectStack.length - 1] // 修改指向

    return res   //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>新增
  }
  effectFn.options = options //让用户可以配置一些属性来实现调度
  effectFn.deps = []
  // effectFn()
  if(!options.lazy) {
    effectFn()
  }
  return effectFn //如果lazy，则不会立即执行
}
```
如今我们实现了第一步：懒执行(手动执行并拿到值)。  
#### computed
接下来我们尝试实现computed方法:
```js
function computed(getter) {
    const effectFn = effect(getter, {
        lazy:true
    })
    const obj = {
        get value(value) {
            return effectFn()
        }
    }
    return obj
}
```
这只是一个在懒执行基础上完成的computed方法，只是可以根据getter来实现计算操作而已。computed还有一个重要功能，  
那就是缓存计算结果。
我们现在并没有缓存功能，每一次读取，都是又执行了一遍effectFn()

#### computed缓存
接下来实现缓存:
```js
function computed(getter) {
    let value
    let dirty = true //脏值检查,第一次设置为true，保证第一次读取能获取到值
    const effectFn = effect(getter, {
        lazy:true
    })
    const obj = {
        get value(value) {
            if(dirty) {
                value = effectFn()
                dirty = false
            }
            return value
        }
    }
    return obj
}
```

#### getter的依赖
在这里我们也应该发现了问题，我们自始至终在computed上做操作，但是computed传入的getter中的依赖有所改变  
比如 obj.bar & obj.foo改变了，我们却并不能知道。  
也就是说，即使这两个值改变了，computed返回的值依然还是最开始的值。  
我们之前有设计一个options.scheduler的属性(方法)，当存在scheduler这个属性(方法)的时候，scheduler就会执行。  
那么我们只需要加上这个属性(方法)即可：
```js
function computed(getter) {
    let value
    let dirty = true //脏值检查,第一次设置为true，保证第一次读取能获取到值
    const effectFn = effect(getter, {
        lazy:true,
        scheduler() {    // >>>>>>>>>>>新增
            dirty = true
        }
    })
    const obj = {
        get value(value) {
            if(dirty) {
                value = effectFn()
                dirty = false
            }
            return value
        }
    }
    return obj
}
```

#### computed的effect嵌套
此时我们的computed实现已经非常完善，但是还是有一些情况下computed无法正常执行。
这里我直接贴vitest代码

```ts
import {expect} from "vitest";

it('computed test: computed但是嵌套测试', () => {
    let count = 0
    let proxyData = reactive({bar: 1, foo: 2})
    const sumRes = computed(() => proxyData.foo + proxyData.bar)
    effect(() => {
        console.log('我执行了')
        count++
        // 在该副作用函数中读取 sumRes.value
        console.log('result:', sumRes.value)
    })
    // 修改 obj.foo 的值
    proxyData.foo++
    expect(count).toBe(2)
})
})
```
我们发现foo自加1的时候，传给effect的函数并没有执行。  
原因是sumRes.value执行的时候是收集的computed里面的effectFn。  
我们进行一波手动收集：(代码见computed.js)
```js
export function computed(getter) {
    let value
    let dirty = true //脏值检查,第一次设置为true，保证第一次读取能获取到值
    const effectFn = effect(getter, {
        lazy:true,
        scheduler() {    // >>>>>>>>>>>新增  trigger的时候生效
            dirty = true
            // 当计算属性依赖的响应式数据变化时，手动调用 trigger 函数触发响应
            trigger(obj, 'value') //新增
        }
    })
    const obj = {
        get value() {
            if(dirty) {
                value = effectFn()  //effectFn执行意味着getter执行
                dirty = false
            }
            // 当读取 value 时，手动调用 track 函数进行追踪
            track(obj, 'value') //新增
            return value
        }
    }
    return obj
}
```

### watch
#### 简易watch
接下来就是watch的实现。不难想象，watch肯定是需要依赖我们options中的scheduler方法的。  
我们先写一个最简单的watch
```js
import { effect } from './effect'
function watch(source, cb) {
    effect(
        () => source[propname],
        {
            scheduler() { cb() }
        }
    )
}
```

#### 扩大适用范围
实际上，我们上面的代码类似为代码，因为根本不存在propname这个变量，我们只是描述可以监听source下的某个属性。  
也不难想象，我们需要将source[propname]替换成一个工具函数，来帮助我们处理所需要监听的属性。  
所谓监听属性，就是把所有的要监听的值都读一遍，使其被track函数捕获，然后trigger的时候执行我们传入的cb。
```js
import { effect } from './effect'
export function watch(source, cb) {
    effect(
        () => traverse(source),
        {
            scheduler() { cb() }
        }
    )
}

function traverse(value, seen = new Set()) {
    // 如果要读取的数据是原始值，或者已经被读取过了，那么什么都不做
    if (typeof value !== 'object' || value === null || seen.has(value))
        return
    seen.add(value)
    for(const k in value) {
        traverse(value[key], seen)
    }
    return value
}
```
这样我们就实现了对value对象 (此时我们还没有考虑数组等情况)的监听。我们知道，watch的第一个参数，  
可以传一个类似getter的函数，如下：
```js
watch(
    () => obj.foo,
    () => {}
)
```
这种写法是为了解决直接监听obj.foo这种情况，如果直接写成watch(obj.foo,cb),那obj.foo就不再是一个响应式
数据。  
我们来解释一下这个问题，首先是watch的第一个参数执行了，即obj.foo执行，然后是在这里触发的obj.foo的读取，
但是此时这个读取还没来得及放入effect函数里，所以不是响应式的。而我们之前都是在effect函数中进行的读取。
我们继续调整代码：
```js
//在watch函数里加几行代码
export function watch(source, cb) {
    //新增-----------------------------------
    let getter
    if(typeof source === 'function') {
        getter = source
    }
    else {
        getter = () => traverse(source)
    }
    //--------------------------------------
    effect(
        () => getter(),
        {
            scheduler() { cb() }
        }
    )
}
```
#### 新值与旧值
watch中我们可以拿到被监听元素的新值和旧值。我们也实现一下这个功能。
```js
export function watch(source, cb) {
    let getter
    if(typeof source === 'function') {
        getter = source
    }
    else {
        getter = () => traverse(source)
    }
    let newValue , oldValue
    const effectFn = effect(
        () => getter(),
        {
            lazy: true,
            scheduler() {
                // 在 scheduler 中重新执行副作用函数，得到的是新值
                newValue = effectFn()
                cb(newValue, oldValue)
                oldValue = newValue
            }
        }
    )
    oldValue = effectFn()
}
```
#### 立即执行
```js
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
            scheduler: job
        }
    )
    if(options.immediate) {
        job()
    }
    else {
        oldValue = effectFn()
    }
}
```
我们需要给watch增加第三个参数，那就是配置项，options。当存在immediate属性且为true的时候，我们立即执行
一次，这时候的立即执行会使得oldValue为undefined，但这正合我们的意，因为立即执行就是没有旧值的。
#### 回调执行时机
watch的options配置中，又一个flush属性，有三个值可以传 'pre' ｜ 'post' ｜ 'sync'。
不传默认为pre，同步执行。  
pre 和 post分别代表组建更新前后。也就是是说，当值为  post   的时候，我们要将其放入一个微任务队列里面去。
那么继续完善：
```js
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
            scheduler: () => { //新增
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
```



