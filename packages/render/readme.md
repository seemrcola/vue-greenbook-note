## 渲染器
我们先实现一个合格且简单的渲染器
```js
function renderer(domString, container) {
    container,innerHTML = domString
}
renderer('<h1>Hello</h1>', document.getElementById('app'))


const count = ref(1)
effect(() => {
    renderer(
        `<h1>${count.value}</h1>`, 
        document.getElementById('app')
    )
})
```
