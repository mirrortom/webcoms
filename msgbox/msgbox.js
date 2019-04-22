/**
 * 模拟系统的弹出框 alert confirm prompt
 * 显示在上中下三个位置
 * 用于理解弹出框原理
 */
!((win) => {
    // 弹出框类
    let msgBox = {};
    // 删除遮罩和弹出层
    msgBox.close = () => {
        let body = document.body;
        let modal = body.querySelectorAll('.msgbox-modal');
        let shadow = body.querySelectorAll('.msgbox-shadow');
        modal.forEach((dom) => {
            dom.parentNode.removeChild(dom);
        })
        shadow.forEach((dom) => {
            dom.parentNode.removeChild(dom);
        })
        // 去掉body滚动条样式
        body.classList.remove('overflowhide');
    }
    // 功能1:弹出alert
    // {msg:要提示的信息,字符串,[position]:位置(top bottom),[onClosed]关闭后执行方法}
    msgBox.alert = (msg, onClosed, position) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成新框并且加入到body直属
        let msgDom = document.createElement('div');
        msgDom.classList.add('msgbox-modal');
        msgDom.innerHTML = `<div class="msgbox msgbox-${position || 'center'}">${msg || ''}
        <span class="msgbox-btn msgbox-ok">Ok</span></div>`;
        // 绑定事件
        msgDom.querySelector('.msgbox').onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 执行关闭事件
            if (typeof onClosed == 'function')
                onClosed();
        }
        // 显示
        document.body.classList.add('overflowhide');
        document.body.append(msgDom);
    };

    // 功能2:弹出confirm
    // {msg:要提示的信息,字符串,[position]:位置(top bottom),[callback(res)]关闭后执行方法}
    msgBox.confirm = (msg, callback, position) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成新框并且加入到body直属
        let msgDom = document.createElement('div');
        msgDom.classList.add('msgbox-modal');
        msgDom.innerHTML = `<div class="msgbox msgbox-${position || 'center'}">${msg || ''}
        <span class="msgbox-btn msgbox-ok">Ok</span><span class="msgbox-btn msgbox-cancel">Cancel</span></div>`;
        // 绑定事件
        msgDom.querySelector('.msgbox-ok').onclick = () => {
            // 恢复body滚动条
            document.body.style.overflow = null;
            // 删除弹出框
            msgBox.close();
            // 结果传回1表示点击OK
            if (typeof callback == 'function')
                callback(1);
        }
        msgDom.querySelector('.msgbox-cancel').onclick = () => {
            // 恢复body滚动条
            document.body.style.overflow = null;
            // 删除弹出框
            msgBox.close();
            // 结果传回0表示点击取消
            if (typeof callback == 'function')
                callback(0);
        }
        // 显示
        document.body.classList.add('overflowhide');
        document.body.append(msgDom);
    }

    // 功能3:弹出prompt
    // {msg:要提示的信息,字符串,[position]:位置(top bottom),[callback(res)]关闭后执行方法}
    msgBox.prompt = (msg, callback, position) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成新框并且加入到body直属
        let msgDom = document.createElement('div');
        msgDom.classList.add('msgbox-modal');
        msgDom.innerHTML = `<div class="msgbox msgbox-${position || 'center'}">${msg || ''}<input class="msgbox-input" type="text"/>
<span class="msgbox-btn msgbox-ok">Ok</span><span class="msgbox-btn msgbox-cancel">Cancel</span></div>`;
        // 绑定事件
        msgDom.querySelector('.msgbox-ok').onclick = () => {
            // 恢复body滚动条
            document.body.style.overflow = null;
            // 删除弹出框
            msgBox.close();
            // 输入传回
            if (typeof callback == 'function') {
                let msg = msgDom.querySelector('.msgbox-input').value;
                callback(msg);
            }
        }
        msgDom.querySelector('.msgbox-cancel').onclick = () => {
            // 恢复body滚动条
            document.body.style.overflow = null;
            // 删除弹出框
            msgBox.close();
            // 输入传回空字符串
            if (typeof callback == 'function')
                callback('');
        }
        // 显示
        document.body.classList.add('overflowhide');
        document.body.append(msgDom);
    }

    // 功能4:弹出自定义HTML片段
    // {msgboxhtml:自定义弹出层html片段,onBefore:显示前执行,onshow:显示后执行,[position]:位置(top bottom)}
    msgBox.show = (msgboxhtml, onBefore, onShow) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成新框并且加入到body直属
        let msgDom = document.createElement('div');
        msgDom.classList.add('msgbox-modal');
        msgDom.innerHTML = msgboxhtml;
        //
        if (typeof onBefore == 'function')
            onBefore();
        // 显示
        document.body.classList.add('overflowhide');
        document.body.append(msgDom);
        //
        if (typeof onShow == 'function')
            onBefore();
    };

    // 引用名称可在此修改
    win.msgbox = msgBox;
})(window);
// 弹出信息提示框