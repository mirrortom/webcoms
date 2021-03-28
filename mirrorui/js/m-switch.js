// ====================================================================================
// m-switch 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-switch', class extends HTMLElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            // =======
            // event
            // =======
            // 点击切换
            this.onclick = () => {
                let thisobj = $(this);
                if (this.onoff == true) {
                    this.onoff = false;
                    thisobj.removeClass('checked');
                    thisobj.text(this.offTag);
                } else {
                    this.onoff = true;
                    thisobj.addClass('checked');
                    thisobj.text(this.onTag);
                }
                //
                //console.log(this.checked);
            }
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
            let thisobj = $(this);
            // ==================
            // init set prop
            // ==================
            // 开关属性标题可以设置,默认是ON/OFF
            this.onoff = thisobj.hasClass('checked') ? true : false;
            this.onTag = thisobj.prop('on') || 'ON';
            this.offTag = thisobj.prop('off') || 'OFF';
            thisobj.text(this.onoff ? this.onTag : this.offTag);
        }

        // =======
        // prop
        // =======
        // checked属性.开返回true,关返回false
        get checked() {
            return this.onoff;
        }

        // =======
        // method
        // =======
    });
})(window);