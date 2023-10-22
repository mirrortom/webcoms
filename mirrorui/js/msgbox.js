// ==============================================
// 模拟系统的弹出框 alert confirm prompt
// 显示在上中下三个位置
// 用于理解弹出框原理
// ==============================================
((win) => {
    // 遮罩样式命
    const shadowCls = 'msgbox-shadow';
    // 弹出层父级样式名
    const modalCls = 'msgbox-modal';
    // 弹出层样式名
    const msgboxCls = 'msgbox';
    // 帮助函数
    const $ = win.ns.domHelp;
    /**
     * 生成遮罩并显示,生成并返回弹出层父级DOM对象
     * @returns {HTMLElement} 弹出层父级DOM对象
     */
    let createMsgBox = () => {
        // 添加遮罩层
        let shadow = $('<div>').addClass(shadowCls)[0];
        document.body.append(shadow);
        // 生成弹出框
        let parentDiv = $('<div>').addClass(modalCls)[0];
        return parentDiv;
    };
    /**
     * 显示弹出层
     * @param {string|HTMLElement} msgboxDom 弹出层html对象或者html字符串
     */
    let showMsgBox = (msgboxDom) => {
        document.body.style.overflow = 'hidden';
        document.body.append(msgboxDom);
    };
    /**
     * 生成标准弹出层的外层div元素,设置位置样式
     * @param {string} msg 要显示的信息
     * @param {string} position 位置:top | bottom
     * @returns {HTMLElement} 返回外层div元素
     */
    let createOuterDiv = (msg, position) => {
        // 样式风格,位置样式
        let outerDiv = $('<div>').addClass(msgboxCls, msgboxCls + '-' + (position || 'center'));
        // 内容
        outerDiv.text(msg || '');
        return outerDiv[0];
    };
    /**
     * 生成标准按钮:确定,取消
     * @param {string} name 按钮种类 ok|cancel
     * * @param {string} theme 按钮风格
     * @returns {HTMLElement} 返回按钮dom
     */
    let createBtn = (name, theme) => {
        let btn = $('<span>').addClass('btn', msgboxCls + '-' + name, theme).text(name === 'ok' ? '确定' : '取消');
        return btn[0];
    };
    // 弹出框类
    let msgBox = {};
    /**
     * 删除(关闭)遮罩和弹出层
     */
    msgBox.close = () => {
        let body = document.body;
        let modal = body.querySelectorAll('.' + modalCls);
        let shadow = body.querySelectorAll('.' + shadowCls);
        modal.forEach((dom) => {
            dom.parentNode.removeChild(dom);
        });
        shadow.forEach((dom) => {
            dom.parentNode.removeChild(dom);
        });
        // 去掉body滚动条样式
        document.body.style.overflow = null;
    };
    /**
     * alert 弹出框
     * @param {string} msg 要提示的信息
     * @param {Function} onClosed 关闭后执行方法
     * @param {string} style 按钮样式
     * @param {string} position 位置:top | bottom
     */
    msgBox.alert = (msg, onClosed, style, position) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成遮罩层和弹出层父级,并且加入到body直属
        let parentDiv = createMsgBox();
        // 生成alertDom: 
        // <div class="msgbox 样式? 位置?">内容<span class="btn msgbox-ok">OK</span></div>
        let alertDom = createOuterDiv(msg, position);
        // 按钮
        let okBtn = createBtn('ok', style);
        // 按钮事件
        okBtn.onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 执行关闭事件
            if (typeof onClosed === 'function')
                onClosed();
        };
        // 显示
        alertDom.appendChild(okBtn);
        parentDiv.appendChild(alertDom);
        showMsgBox(parentDiv);
    };

    /**
     * confirm 弹出框
     * @param {string} msg 要提示的信息
     * @param {Function} callback 回调函数
     * @param {string} style 按钮样式
     * @param {string} position 位置:top | bottom
     */
    msgBox.confirm = (msg, callback, style, position) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成遮罩层和弹出层父级,并且加入到body直属
        let parentDiv = createMsgBox();
        // 生成confirmDom:
        // <div class="msgbox 样式? 位置?">内容<span class="msgbox-btn msgbox-ok">OK</span>
        //                    <span class="msgbox-btn msgbox-cancel">Cancel</span></div >
        let confirmDom = createOuterDiv(msg, position);
        // 按钮
        let okBtn = createBtn('ok', style);
        let cancelBtn = createBtn('cancel');
        // 绑定事件
        okBtn.onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 结果传回1表示点击OK
            if (typeof callback === 'function')
                callback(1);
        };
        cancelBtn.onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 结果传回0表示点击取消
            if (typeof callback === 'function')
                callback(0);
        };
        // 显示
        confirmDom.innerText = msg;
        confirmDom.appendChild(okBtn);
        confirmDom.appendChild(cancelBtn);
        parentDiv.appendChild(confirmDom);
        showMsgBox(parentDiv);
    };

    /**
     * prompt 弹出框
     * @param {string} msg 要提示的信息
     * @param {Function} callback 回调函数
     * @param {string} style 确定按钮样式
     * @param {string} position 位置:top | bottom
     */
    msgBox.prompt = (msg, callback, style, position) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成遮罩层和弹出层父级,并且加入到body直属
        let parentDiv = createMsgBox();
        // 生成promptDom:
        // <div class="msgbox 样式? 位置?">内容<input class="msgbox-input" type="text"/>
        // <span class="msgbox-btn msgbox-ok">Ok</span><span class="msgbox-btn msgbox-cancel">Cancel</span></div>
        let promptDom = createOuterDiv(msg, position);
        promptDom.classList.add('msgbox-prompt');
        // input框
        let inputE = $('<input>').addClass('input-text','mg-tb-10').prop('type', 'text')[0];
        // 按钮
        let okBtn = createBtn('ok', style);
        let cancelBtn = createBtn('cancel');
        // 绑定事件
        okBtn.onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 输入传回
            if (typeof callback === 'function') {
                callback(inputE.value);
            }
        };
        cancelBtn.onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 输入传回空字符串
            if (typeof callback === 'function')
                callback('');
        };
        // 显示
        promptDom.innerText = msg;
        promptDom.appendChild(inputE);
        promptDom.appendChild(okBtn);
        promptDom.appendChild(cancelBtn);
        parentDiv.appendChild(promptDom);
        showMsgBox(parentDiv);
    };

    /**
     * 弹出自定义HTML片段
     * @param {string|HTMLElement} customBox 自定义弹出层html片段
     * @param {Function} onBefore 显示前执行
     * @param {Function} onShow 显示后执行
     */
    msgBox.show = (customBox, onBefore, onShow) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成遮罩层和弹出层父级,并且加入到body直属
        let parentDiv = createMsgBox();
        if (typeof customBox === 'string')
            parentDiv.innerHTML = customBox;
        else
            parentDiv.appendChild(msgboxhtml);
        //
        if (typeof onBefore === 'function')
            onBefore();
        // 显示
        showMsgBox(parentDiv);
        //
        if (typeof onShow === 'function')
            onShow();
    };

    // 引用名称可在此修改
    win.ns.msgbox = msgBox;
})(window);