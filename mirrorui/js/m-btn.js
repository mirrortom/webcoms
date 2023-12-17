// ====================================================================================
// m-btn 自定义标记
// ====================================================================================
((win) => {
  const $ = win.ns.domHelp || win.ns.jslib;
  win.customElements.define('m-btn', class extends HTMLElement {
    // =======
    // 构造函数
    // =======
    constructor() {
      // 必须首先调用 super 方法
      super();
      // 样式
      $(this).addClass('btn');
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
    // method
    // =======
    // 判断btn是否含有loading样式.如果没有会添加上等待样式
    isLoading() {
      let thisobj = $(this);
      if (thisobj.hasClass('loading'))
        return true;
      thisobj.addClass('loading');
      return false;
    }
    // 去掉btn的loading样式.time是豪秒数,表示经过此时间后去掉loading样式
    clsLoading(time) {
      let thisobj = $(this);
      if (time >= 0) {
        setTimeout(() => {
          thisobj.removeClass('loading');
        }, time);
      } else {
        thisobj.removeClass('loading');
      }
    }
  });
})(window);