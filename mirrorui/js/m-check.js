// ====================================================================================
// m-check 自定义标记
// ====================================================================================
((win) => {
  const $ = win.ns.domHelp || win.ns.jslib;
  win.customElements.define('m-check', class extends HTMLElement {
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
      this.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (this.hasAttribute('disabled')) return;
        let thisobj = $(this);
        if (thisobj.hasClass('checked')) {
          thisobj.removeClass('checked');
        } else {
          thisobj.addClass('checked');
        }
        //
        //console.log(this.checked);
        // 点击切换后执行方法
        if (typeof this._onClick == 'function')
          this._onClick(this);
      }

      // ==================
      // init set prop
      // ==================
      let thisobj = $(this);
      // 样式
      thisobj.addClass('input-check');
      // 复选框
      thisobj.append($('<span>').addClass('check')[0]);
      // 标题
      let tag = thisobj.prop('tag') || '';
      thisobj.append($('<label>').addClass('form-label').text(tag)[0]);
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
    // checked属性.勾选返回true,未勾选返回false
    get checked() {
      return $(this).hasClass('checked');
    }

    set checked(value) {
      if (value == true)
        $(this).addClass('checked');
      else
        $(this).removeClass('checked');
    }

    // 获取tag属性
    get tag() {
      return $(this).prop('tag') || '';
    }

    // 设置tag属性
    set tag(value) {
      $(this).prop('tag', value);
      $(this).find('.form-label').text(value);
    }

    // =======
    // method
    // =======
    // 点击切换后执行方法
    set onClicked(fn) {
      this._onClick = fn;
    }
  });
})(window);