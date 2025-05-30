// ====================================================================================
// m-inputwatch 自定义标记
// 扩展原生标记时,例如 HTMLInputElement,define需要有第三个参数 { extends: 'input' }
// ====================================================================================
((win) => {
  const $ = win.ns.domHelp || win.ns.jslib;
  win.customElements.define('m-inputwatch', class extends HTMLInputElement {
    // =======
    // 构造函数
    // =======
    constructor() {
      // 必须首先调用 super 方法
      super();
      // =======
      // init
      // =======
      // ===属性值===//
      // 监听改变时,执行的方法
      this._onChange = null;
      // 监听时间间隔(毫秒)
      this._timeout = 1000;
      // 监听状态值 1=监听中 0=停止监听
      this.watchStatus = 0;
      // 中文输入状态值 1=输入中 0=输入结束
      this.zhTyping = 0;

      // =======
      // event
      // =======
      // ===注册事件===//
      // 事件方法
      // 1.input获得焦点时开始监听
      let watchStart = () => {
        this.watchStatus = 1;
        this.lastValue = this.value;
        this.watch();
      }
      // 2.失去焦点,结束监听
      let watchEnd = () => {
        this.watchStatus = 0;
      }
      //  输入中文之前,设置标记为正在输入中,更具此标志,不执行input值比较
      let zhTypingStart = () => {
        this.zhTyping = 1;
      }
      //  输入中文之后.这时才执行input值的比较
      let zhTypingEnd = () => {
        this.zhTyping = 0;
      }
      // 事件注册
      this.addEventListener('focus', watchStart);
      this.addEventListener('blur', watchEnd);
      this.addEventListener('compositionstart', zhTypingStart);
      this.addEventListener('compositionend', zhTypingEnd);
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
    // 监听到改变时,要执行的方法
    set onChange(fn) {
      this._onChange = fn;
    }
    // 监听间隔时间,默认值1000毫秒
    set timeOut(time) {
      this._timeout = time;
    }
    // =======
    // method
    // =======
    // 开始监听
    watch() {
      if (this.watchStatus == 0) {
        //console.log('停止监听!');
        return;
      }
      let val = this.value.replace(/^\s*|\s*$/g, '');
      //console.log(`lastvalue: ${this.lastValue} value: ${val}`);
      if (this.zhTyping == 0 && val != this.lastValue) {
        this.lastValue = val;
        if (typeof this._onChange == 'function')
          this._onChange(val, this);
        //console.log('监听到变化');
      } else {
        //console.log('监听中...');
      }
      setTimeout(() => {
        this.watch()
      }, this._timeout);
    }
  }, { extends: 'input' });
})(window);