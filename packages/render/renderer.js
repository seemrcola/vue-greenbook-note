
function createRenderer() {
    function mountElement(vnode, container) {
        const el = document.createElement(vnode.type)
        if(typeof vnode.children === 'string') {
            el.textContent = vnode.children
        }
        container.appendChild(el)
    }
    function patch(oldvnode, newvnode, container) {
        //不存在旧的vnode， 则意味着挂载
        if(!oldvnode) {
            mountElement(newvnode, container)
        }
        else {
            //打补丁 todo
        }
    }
    function render(vnode, container) {
        if(vnode) {
            //打补丁
            patch(container._vnode, vnode, container)
        }
        else {
            if(container._vnode) {
                container.innerHTML = ''
            }
        }
        container._vnode = vnode
    }

    return {
        render
    }
}
