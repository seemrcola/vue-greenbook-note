## ref实现
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
