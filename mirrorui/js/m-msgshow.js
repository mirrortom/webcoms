// ====================================================================================
// m-msgshow 自定义标记
// ====================================================================================
((win) => {
  const $ = win.ns.domHelp || win.ns.jslib;
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
      // 正在执行的关闭动画引用
      this._aniTimeOutArr = [];
      // 内置信息类型
      this._infoType = {
        success: { title: '✔ 成功', style: 'bg-lime-4' },
        error: { title: '❌ 错误', style: 'bg-red-4' },
        warning: { title: '⚠ 警告', style: 'bg-orange-4' },
        info: { title: '💬 提示', style: 'bg-sky-4' },
        notify: { title: '📢 公告', style: 'txt-rose-5' }
      };
      // 样式
      thisobj.addClass('msgshow');
      // title,msg属性
      let title = thisobj.prop('title') || '';
      let msg = thisobj.prop('msg') || '';
      // 内部标记 标题/内容/关闭按钮
      this.innerHTML = '<span class="title"></span><span class="msg"></span><span class="close">X</span>';
      // 关闭按钮事件
      $(this).find('.close')[0].onclick = () => {
        this.clear();
      }
      // 是否显示
      if (this.hasAttribute('show'))
        this.show(msg, title);
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
     * @param {string} styleOrTitle 标题/或者预定义风格
     * @param {Array|bool} styleOrKeep 样式数组或者是否保持开启
     * @param {bool} keep true保持开启
     */
    show(msg, styleOrTitle, styleOrKeep, keep) {
      // 清除所有动画:
      // 如果是反复使用一个msgshow组件,很大概率存在一种情况:就是自动关闭动画在进行中,但马上
      // 又要显示一个新的提示内容,这时如果不清除没有完成的关闭动画,那么新的内容显示出来后,而
      // 上次的动画刚好执行玩了,于是组件又马上关闭了.
      // 为了避免这种情况,需要在显示前清除所有未执行完的动画.动画是使用settimeout嵌套实现,
      // 用数组记录了每个settimeout的id,每次显示前全部clear掉.
      while (this._aniTimeOutArr.length > 0) {
        let timeOutId = this._aniTimeOutArr.pop();
        clearTimeout(timeOutId)
      }
      // 重新添加样式
      $(this).removeClass().addClass('msgshow');
      // 自定义样式
      if (styleOrKeep instanceof Array) {
        $(this).addClass(...styleOrKeep);
      }
      // 消息内容 必须
      if (msg)
        $(this).find('.msg').text(msg);
      // 预定义风格 设置标题和主题.如果不是预定义风格,视为标题
      let dfStyle = this._infoType[styleOrTitle];
      if (dfStyle) {
        $(this).find('.title').text(dfStyle.title);
        $(this).addClass(dfStyle.style);
      } else {
        $(this).find('.title').text(styleOrTitle);
      }

      // 显示
      this.style.opacity = 1;
      this.style.display = 'grid';
      // 自动关闭
      // 不自动关闭的情况:dom上有keep属性, 参数keep为true, 参数styleOrKeep为true
      if (this.hasAttribute('keep') || keep == true || (styleOrKeep instanceof Boolean && styleOrKeep == true))
        return;
      // 默认2s自动关闭:
      // 这个timeout也要加入清除数组,因为倒计时2秒关闭,如果下一个消息在2秒前要显示,那么
      // 这上次的timeout就不能再执行了,否则就会导致下个消息显示后马上又消失掉了.
      let stoId = setTimeout(() => { this.clear() }, 2000);
      this._aniTimeOutArr.push(stoId);
    }

    /**
     * 清空提示框内容,并且隐藏
     * */
    clear() {
      let opacity = 1;
      let ani = () => {
        let aniTimeOut = setTimeout(() => {
          opacity -= 0.1;
          // 结束退出
          if (opacity < 0) {
            this.style.display = 'none';
            return;
          }
          this.style.opacity = opacity;
          ani();
        }, 80);
        this._aniTimeOutArr.push(aniTimeOut);
        //console.log(this._aniTimeOutArr.length);
      }
      ani();
    }
  });
})(window);