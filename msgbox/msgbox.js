/**
 * 模拟系统的弹出框 alert confirm prompt
 * 显示在上中下三个位置
 * 用于理解弹出框原理
 */
; ((win) => {
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

$.fn.extend({
    // 模态框 {beforeShow:fun,afterShow:fun,afterClose:fun,escClose:false,backClose:false,location:''}
    modal: function (config) {
        //=== 弹出层父级类名:为方便引用()
        let modalClsName = 'msgbox-modal';
        //=== init config
        let cfg = {};
        if (config) {
            // 显示之前执行
            cfg.BeforeShow = config.beforeShow || null;
            // 显示后执行
            cfg.AfterShow = config.afterShow || null;
            // 关闭后执行
            cfg.AfterClose = config.afterClose || null;
            // 按esc关闭
            cfg.EscClose = config.escClose || false;
            // 点击背景(弹出层父级)关闭
            cfg.BackClose = config.backClose || false;
            // 位置
            cfg.Location = config.location || '';
        }

        //===
        // body禁用滚动条
        // 删除旧的遮罩层
        $('body').addClass('overflowhide').find('.msgbox-shadow,.msgbox-modal').remove();

        //=== 弹出层准备: dom生成,相关事件执行
        // 将弹出层包含在弹出层父级DOM中
        let modal = $('<div class="' + modalClsName + ' ' + cfg.Location + '" tabindex="-1"></div>');
        modal.append($(this));
        // x按钮事件:点击关闭弹出框
        modal.find('.msgbox-close').on('click', function () {
            $.msgboxClear(cfg.AfterClose);
        })
        // 按ESC关闭
        if (cfg.EscClose == true) {
            modal.on("keyup", function (event) {
                //alert(event.target.className + event.which );
                if (event.which != 27 || event.target.className.indexOf(modalClsName) == -1)
                    return;
                $.msgboxClear(cfg.AfterClose);
            });
        }
        // 点击背景关闭
        if (cfg.BackClose == true) {
            modal.on('click', function (event) {
                if (event.target.className.indexOf(modalClsName) == -1)
                    return;
                $.msgboxClear(cfg.AfterClose);
            });
        }
        // 显示之前执行
        if (typeof cfg.BeforeShow == 'function') {
            cfg.BeforeShow($(this));
        }
        // 显示遮罩
        $('body').append('<div class="msgbox-shadow"></div>');
        // 显示弹出框
        $('body').append(modal);
        // 让弹出层父级获得焦点
        modal.focus();
        // 显示之后执行
        if (typeof cfg.AfterShow == 'function') {
            cfg.AfterShow($(this));
        }
    }
})