// ====================================================================================
// m-radio 自定义标记
// ====================================================================================
((win) => {
  const $ = win.ns.domHelp || win.ns.jslib;
  win.customElements.define('m-radio', class extends HTMLElement {
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
          // 再次点击选中的单选按钮时,取消选中
          thisobj.removeClass('checked');
          return;
        }
        thisobj.addClass('checked');
        // 取消同级的(在同一个父元素下的),name属性值相同的单选按钮的选中状态
        this.clearChecked();
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
      // 单选框
      thisobj.append($('<span>').addClass('radio')[0]);
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
    // 获取checked属性.选中true
    get checked() {
      return $(this).hasClass('checked');
    }

    // 设置checked属性
    set checked(value) {
      if (value == true) {
        $(this).addClass('checked');
        // 同时要去掉同组的其它选中状态
        this.clearChecked();
      }
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

    // 点击切换后执行方法
    set onClicked(fn) {
      this._onClick = fn;
    }
    // =======
    // method
    // =======

    // 取消同组其它按钮选中状态
    clearChecked() {
      let thisobj = $(this);
      thisobj.siblings('m-radio[name=' + thisobj.prop('name') + ']').removeClass('checked');
    }
  });
})(window);