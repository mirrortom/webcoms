// ====================================================================================
// m-inputwatch 自定义标记
// 扩展原生标记时,例如 HTMLInputElement,define需要有第三个参数 { extends: 'input' }
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-inputwatch', class extends HTMLInputElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            // =======
            // event
            // =======

        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
            // ==================
            // init set prop
            // ==================

        }

        // =======
        // prop
        // =======

        // =======
        // method
        // =======
        // 初始化,fn: 监听改变时执行的方法
        init(fn, time) {
            // 监听改变时,执行的方法
            this.changeE = fn;
            // 监听时间间隔
            this.timeout = time || 1000;
            // 监听状态值 1=监听中 0=停止监听
            this.stopListen = 0;
            // 中文输入状态值 1=输入中 0=输入结束
            this.zhTyping = 0;

            // ==event function==
            // 1.input获得焦点时开始监听
            let watchStartE = () => {
                this.stopListen = 1;
                this.lastValue = this.value;
                this.watch();
            }
            // 2.失去焦点,结束监听
            let watchEndE = () => {
                this.stopListen = 0;
            }
            //  输入中文之前,设置标记为正在输入中,更具此标志,不执行input值比较
            let zhTypingStart = () => {
                this.zhTyping = 1;
            }
            //  输入中文之后.这时才执行input值的比较
            let zhTypingEnd = () => {
                this.zhTyping = 0;
            }

            // bind event
            this.addEventListener('focus', watchStartE);
            this.addEventListener('blur', watchEndE);
            this.addEventListener('compositionstart', zhTypingStart);
            this.addEventListener('compositionend', zhTypingEnd);

            // == fun ==
            // 删除监听并且解绑所有事件
            //this.clear = () => {
            //    this.removeEventListener('focus', watchStartE);
            //    this.removeEventListener('blur', watchEndE);
            //    this.removeEventListener('compositionstart', zhTypingStart);
            //    this.removeEventListener('compositionend', zhTypingEnd);
            //    this.stopListen = 0;
            //}
        }
        watch() {
            if (this.stopListen == 0) {
                //console.log('停止监听!');
                return;
            }
            let val = this.value.replace(/^\s*|\s*$/g, '');
            //console.log(`lastvalue: ${this.lastValue} value: ${val}`);
            if (this.zhTyping == 0 && val != this.lastValue) {
                this.lastValue = val;
                if (typeof this.changeE == 'function')
                    this.changeE(val, this);
                //console.log('监听到变化');
            } else {
                //console.log('监听中...');
            }
            setTimeout(() => {
                this.watch()
            }, this.timeout);
        }
    }, { extends: 'input' });
})(window);