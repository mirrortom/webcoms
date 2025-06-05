// ====================================================================================
// m-range 自定义标记
// ====================================================================================
((win) => {
  const $ = win.ns.domHelp || win.ns.jslib;
  win.customElements.define('m-range', class extends HTMLElement {
    // =======
    // fields
    // =======

    // =======
    // 构造函数
    // =======
    constructor() {
      // 必须首先调用 super 方法
      super();

      // 成员变量
      // 范围边界小值
      this._min;
      // 范围边界大值
      this._max;
      // 滑块当前值
      this._val = 0;
      // 滑条长度(px)
      this._barLen = 0;
      // 鼠标拖动前的起始位置
      this._mStart = { x: 0, y: 0 };
      // 滑块滑动前的起始位置
      this._btnBegin = { x: 0, y: 0 };
      // 滑块dom
      this._rBtn;
      // 滑块文字dom
      this._rTxt;
      // 滑条dom
      this._rBar;
      // 如果触发了滑动事件,为true
      this._isMoveEvent = false;
      // 滑块位置改变事件
      this._changeFun;
      // ==================
      // init set prop
      // ==================
      this._init();
    }

    // ========
    // 钩子函数
    // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
    // ========
    connectedCallback() {
      // 滑条长度, 在constructor()里,offsetwidth属性值为0,无法使用
      // 自定义标记放入documentFragment后再取出.也会触发connectedCallback()方法
      // 所以,此方法里最好不用
      // 宜: 元素初始化后不再改变的量,可以读取使用.每次加入dom时,都要呈现新状态,丢弃旧状态的.
      // 不可: 添加子元素,修改变量,其它会导致元素状态改变的行为.
      //this._barLen = this.offsetWidth - this._rBtn.offsetWidth;
    }


    // =======
    // prop
    // =======
    // 获取/设置滑块当前值
    get Value() {
      return this._val;
    }
    set Value(val) {
      // 设置的值必须在max和min之间(含)
      let v = parseInt(val) || 0;
      if (v < this._min)
        v = this._min;
      else if (v > this._max)
        v = this._max;
      // 调整滑块/显示文字位置
      let offsetLeft = v / this._max * this._barLen;
      this._rTxt.style.marginLeft = offsetLeft + 'px';
      this._rBar.style.borderLeftWidth = offsetLeft + 'px';
      // 赋值,显示值
      this._val = v;
      this._rTxt.innerText = v;
    }
    // 滑动事件,fun(val),val:当前滑块值
    set onChange(fun) {
      if (typeof fun === 'function')
        this._changeFun = fun;
    }

    // =======
    // method
    // =======
    // 生成
    _init() {
      // 样式
      $(this).addClass('range-box');
      // 长度:默认320px
      let width = parseInt(this.getAttribute('width')) || 320;
      // 子元素
      let innerHtml = '<span class="range-txt"></span><div class="range-bar"><span class="range-btn"></span></div>';
      this.innerHTML = innerHtml;
      // 总长度要减去滑块dom的宽度(1.6rem是在css里设置的)
      let remFontSize = getComputedStyle(document.documentElement).fontSize;
      this._barLen = width - 1.6 * parseInt(remFontSize);
      this.style.width = width + 'px';

      // 属性设置
      // 滑块
      this._rBtn = this.querySelector('.range-btn');
      // 标签
      this._rTxt = this.querySelector('.range-txt');
      // 滑条
      this._rBar = this.querySelector('.range-bar');
      // 最小值 默认0
      this._min = parseInt(this.getAttribute('min')) || 0;
      // 最大值 默认100
      this._max = parseInt(this.getAttribute('max')) || 100;
      if (this._min > this._max) {
        this._min = 0;
        this._max = 100;
      }

      // 滑块初始设置值
      this.Value = parseInt(this.getAttribute('val'));
      // 事件绑定
      this._bindEvent();
    }

    // 事件注册
    // 事件绑定在容器元素上,没用绑定在滑块按钮上,为了实现当鼠标不在按钮上时,也能触发滑动事件.
    _bindEvent() {
      // PC端鼠标拖动事件
      this.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this._start(e.x);
      });
      this.addEventListener('mousemove', (e) => {
        e.stopPropagation();
        e.preventDefault();
        // buttons表示鼠标按下时的键0=无1=左键2=邮件4=滚轮,同时按下时,值是和值.
        if (e.buttons == 1) {
          this._move(e.x);
        }
      });
      this.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this._end();
      });

      // 手机端触摸事件
      this.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        e.preventDefault();
        let touch = e.targetTouches[0];
        this._start(touch.pageX);
      });
      this.addEventListener('touchmove', (e) => {
        e.stopPropagation();
        e.preventDefault();
        let touch = e.targetTouches[0];
        this._move(touch.pageX);
      });
      this.addEventListener('touchend', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this._end();
      });

      // 对滑条dom点击事件,PC端和移动端都用click
      $(this).find('.range-bar')[0].addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this._click(e.x);
      })
    }

    // --事件方法--
    // 开始拖动
    _start(x) {
      this._mStart.x = x;
      this._btnBegin.x = parseInt(this._rBar.style.borderLeftWidth.replace('px', '')) || 0;
      $(this._rBtn).addClass('active');
      // 重置是否触发滑动事件标识
      this._isMoveEvent = false;
    }
    // 拖动中
    _move(x) {
      let barLen = this._barLen;
      let dX = x - this._mStart.x;
      let targetDist = this._btnBegin.x + dX;
      // 更新滑块值
      this.Value = targetDist / barLen * this._max;
      // 修改滑动已触发标识
      this._isMoveEvent = true;
      // 执行改变事件
      if (this._changeFun)
        this._changeFun(this._val);

    }
    // 结束拖动
    _end() {
      $(this._rBtn).removeClass('active');
    }

    // 点击滑条时,将滑块设置到点击位置
    _click(x) {
      // x:点击处的left值
      // 如果是滑动结束导致的点击事件触发,不处理.click事件会触发mouseDown(按下)和mouseUp(弹起),然后才是click事件.
      if (this._isMoveEvent) return;
      // 滑条当前位置
      let bar = $(this).find('.range-bar')[0];
      let barLeft = bar.offsetLeft;
      // barLeft>=x,在滑条范围内点击,x值一定大于等于滑条Left值
      let targetX = x - barLeft;
      // 更新滑块位置
      this.Value = targetX / this._barLen * this._max;
      // 执行改变事件
      if (this._changeFun)
        this._changeFun(this._val);
    }
  });
})(window);