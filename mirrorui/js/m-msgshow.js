// ====================================================================================
// m-msgshow 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-msgshow', class extends HTMLElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            // =======
            // event
            // =======

            // ==================
            // init set prop
            // ==================
            let thisobj = $(this);
            // 添加样式
            $(this).addClass('msgshow');
            
            // title,msg属性
            let title = thisobj.prop('title') || '';
            let msg = thisobj.prop('msg') || '';

            // 如果设置了才生成里面的内容
            if (title) {
                let titleDom = $('<span>').addClass('title').text(title);
                thisobj.append(titleDom[0]);
            }
            if (msg) {
                let msgDom = $('<span>').addClass('msg').text(msg);
                thisobj.append(msgDom[0]);
            }
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
        }

        // =======
        // prop
        // =======
       
        // =======
        // method
        // =======
        /**
         * 在页面上提示自定义信息.
         * @param {string} msg 信息内容
         * @param {string} title 标题
         * @param {string} style 主题类
         */
        show(msg, title, ...style) {
            let thisobj = $(this);
            let tpl = `<span class="title">${title}</span><span class="msg">${msg}</span><b class="close">x</b>`;
            thisobj.html(tpl);
            thisobj.removeClass().addClass('msgshow');
            style && thisobj.addClass(...style);
            //
            thisobj.html(tpl).find('.close')[0].onclick = () => {
                this.clear();
            }
        }

        /**
         * 显示 "成功" 风格提示框
         * @param {any} msg
         */
        ok(msg) {
            let thisobj = $(this);
            let tpl = `<span class="title">\u2714 成功</span><span class="msg">${msg}</span><b class="close">x</b>`;
            thisobj.html(tpl);
            thisobj.removeClass().addClass('msgshow', 'success');
            //
            thisobj.find('.close')[0].onclick = () => {
                this.clear();
            }
        }

        /**
         * 显示 一般信息 风格提示框
         * @param {any} msg
         */
        info(msg) {
            let thisobj = $(this);
            let tpl = `<span class="title">i 提示</span><span class="msg">${msg}</span><b class="close">x</b>`;
            thisobj.html(tpl);
            thisobj.removeClass().addClass('msgshow', 'info');
            //
            thisobj.find('.close')[0].onclick = () => {
                this.clear();
            }
        }

        /**
         * 显示 错误信息 风格提示框
         * @param {any} msg
         */
        err(msg) {
            let thisobj = $(this);
            let tpl = `<span class="title">\u2716 错误</span><span class="msg">${msg}</span><b class="close">x</b>`;
            thisobj.html(tpl);
            thisobj.removeClass().addClass('msgshow', 'danger');
            //
            thisobj.find('.close')[0].onclick = () => {
                this.clear();
            }
        }

        /**
         * 显示 警示 风格提示框
         * @param {any} msg
         */
        warn(msg) {
            let thisobj = $(this);
            let tpl = `<span class="title">\u26A0 警示</span><span class="msg">${msg}</span><b class="close">x</b>`;
            thisobj.html(tpl);
            thisobj.removeClass().addClass('msgshow', 'warning');
            //
            thisobj.find('.close')[0].onclick = () => {
                this.clear();
            }
        }

        /**
         * 清空提示框内容,并且隐藏
         * */
        clear() {
            this.innerHTML = '';
            this.innerText = '';
            $(this).addClass('d-none');
        }
    });
})(window);