## ref实现

### 基本思路
proxy代理的目标是非原始值，也就是说我们现在还没有任何方式可以代理原始值。
我们知道ref是需要一个value来访问的，我们可否设计成这样：
```js
function ref(val) {
    const wrapper = {
        value: val
    }
    return reactive(wrapper)
}
```
这样其实有一个风险, 那就是如果我真的有一个 {value: 5} 这样的对象的时候，要怎么区分。  
也就是说，我们需要能够判断，这个属性是不是一个ref。
```js
function ref(val) {
    const wrapper = {
        value: val
    }
    Object.defineProperty(wrapper, '__v_ref', {
        value: true
    })
    return reactive(wrapper)
}
```
我们以一个不可枚举不可写的属性v_ref来判断其是不是ref。

### 响应式丢失问题
我们经常遇到reactive带来的响应式丢失
```js
const a = reactive([1, 2, 3])
a = [...a, 4] //此时响应式丢失
```
如何解决这个问题：
```js
// obj 是响应式数据
const obj = reactive({ foo: 1, bar: 2 })
const newObj = {
    foo:{
        get value() {
            return obj.foo
        }
    },
    bar:{
        get value() {
            return obj.bar
        }
    }
}
effect(() => {
    // 在副作用函数内通过新的对象 newObj 读取 foo 属性 
    console.log(newObj.foo.value)
 })
//此时可以触发响应
obj.foo = 100 
```
我们进一步将其封装成函数
```js
function toRef(obj, key) {
    const wrapper = {
        get value() {
            return obj[key]
        },
        set value(val) {
            obj[key] = val
        }
    }
    return wrapper
}
```
使用如下：
```js
const newObj = {
   foo: toRef(obj, 'foo'),
   bar: toRef(obj, 'bar')
}
```
但是这个函数还是有一个问题，我们只能一个属性一个属性来处理，还是有点慢，那我们做一个批量处理函数：
```js
function toRefs(obj) {
    const ret = {}
    for(let prop in obj) {
        ret[prop] = toRef(obj, prop)
    }
    Object.defineProperty(ret, '__v_ref', {
        value: true
    })
    return ret
}
```
如今我们只需要一步就可以完成全部转换
```js
const newObj = { ...toRefs(obj) }
```



