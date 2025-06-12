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
  const $ = win.ns.domHelp || win.ns.jslib;
  /**
   * 生成遮罩并显示,生成并返回弹出层父级DOM对象
   * @returns {HTMLElement} 弹出层父级DOM对象
   */
  let createMsgBox = () => {
    // 添加遮罩层
    let shadow = $('<div>').addClass(shadowCls)[0];
    document.body.append(shadow);
    // 生成弹出框父级
    let parentDiv = $('<div>').addClass(modalCls)[0];
    return parentDiv;
  };
  /**
   * 显示弹出层
   * @param {string|HTMLElement} msgboxDom 弹出层html对象或者html字符串
   */
  let showMsgBox = (msgboxDom) => {
    document.documentElement.style.overflow = 'hidden';
    document.body.append(msgboxDom);
  };
  /**
   * 位置样式,分析参数值,生成位置样式名字数组
   */
  let positionClass = (position) => {
    // 位置样式
    let clsarr = [];
    // 默认居中-5
    if (!position) {
      clsarr.push(msgboxCls + '-r-c');
      clsarr.push(msgboxCls + '-c-c');
      return clsarr;
    }
    switch (position) {
      // 上中-2
      case 'top-center':
        clsarr.push(msgboxCls + '-r-c');
        break;
      // 上右-3
      case 'top-right':
        clsarr.push(msgboxCls + '-r-r');
        break;
      // 左中-4
      case 'left-center':
        clsarr.push(msgboxCls + '-c-c');
        break;
      // 右中-6
      case 'right-center':
        clsarr.push(msgboxCls + '-r-c');
        clsarr.push(msgboxCls + '-c-c');
        break;
      // 左下-7
      case 'left-bottom':
        clsarr.push(msgboxCls + '-c-b');
        break;
      // 下中-8
      case 'bottom-center':
        clsarr.push(msgboxCls + '-r-c');
        clsarr.push(msgboxCls + '-c-b');
        break;
      // 右下-9
      case 'right-bottom':
        clsarr.push(msgboxCls + '-r-r');
        clsarr.push(msgboxCls + '-c-b');
        break;
      // 上左-1(grid布局默认值),或者无效值
      case 'top-left':
      default:
        break;
    }
    return clsarr;
  }
  /**
   * 生成标准弹出层的外层div元素(容器),设置位置样式
   * @param {string} msg 要显示的信息
   * @param {string} position 位置(9宫格):top | bottom | left | right | center(默认),或者组合先行后列
   * @returns {HTMLElement} 返回外层div元素
   */
  let createOuterDiv = (msg, position) => {
    // 样式风格 msgboxCls类只加在3个标准框上
    let outerDiv = $('<div>').addClass(msgboxCls).addClass(...positionClass(position));
    // 标题
    outerDiv.append($('<div>').text(msg || '')[0]);
    return outerDiv[0];
  };
  /**
   * 生成标准按钮区域:确定,取消
   * @param {number} code 按钮种类 1=ok|2=ok+cancel
   * @param {string} theme 按钮主题样式(只用于确定按钮)
   * @returns {HTMLElement} 返回按钮区域的Div
   */
  let createBtn = (code, onOk, onCancel, theme) => {
    let okBtn = $('<span>').addClass('btn', theme).text('确定');
    let cancelBtn = $('<span>').addClass('btn', theme).text('取消');
    let btnArea = $('<div>').addClass('msgbox-btn-area');
    // 绑定事件
    okBtn[0].onclick = () => {
      // 删除弹出框
      msgBox.close();
      onOk();
    };
    cancelBtn[0].onclick = () => {
      // 删除弹出框
      msgBox.close();
      onCancel();
    };
    if (code == 2)
      btnArea.append($(cancelBtn));
    btnArea.append(okBtn[0]);
    return btnArea[0];
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
    // 去掉html滚动条样式
    document.documentElement.style.overflow = null;
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
    let alertDom = createOuterDiv(msg, position);
    // 按钮区域
    let btnArea = createBtn(1, () => {
      // 执行关闭事件
      if (typeof onClosed === 'function')
        onClosed();
    }, null, style);
    // 显示
    alertDom.appendChild(btnArea);
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
    let confirmDom = createOuterDiv(msg, position);
    // 按钮区域
    let btnArea = createBtn(2,
      () => {
        // 结果传回1表示点击OK
        if (typeof callback === 'function')
          callback(1);
      },
      () => {
        // 结果传回0表示点击取消
        if (typeof callback === 'function')
          callback(0);
      },
      style);
    // 显示
    confirmDom.appendChild(btnArea);
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
    let promptDom = createOuterDiv(msg, position);
    promptDom.classList.add('msgbox-prompt');
    // input框
    let inputE = $('<input>').addClass('input-text', 'mg-b-10').prop('type', 'text')[0];
    // 按钮区域
    let btnArea = createBtn(2,
      () => {
        // 输入传回
        if (typeof callback === 'function') {
          callback(inputE.value);
        }
      },
      () => {
        // 输入传回空字符串
        if (typeof callback === 'function')
          callback(inputE.value);
      },
      style);
    // 显示
    promptDom.appendChild(inputE);
    promptDom.appendChild(btnArea);
    parentDiv.appendChild(promptDom);
    showMsgBox(parentDiv);
  };

  /**
   * 弹出自定义HTML片段
   * @param {string|HTMLElement} html 自定义弹出层html片段
   * @param {Function} onBefore 显示前执行
   * @param {Function} onShow 显示后执行
   * @param {string} position 位置
   */
  msgBox.show = (html, onBefore, onShow, position) => {
    // 删除可能存在的弹出框
    msgBox.close();
    // 生成遮罩层和弹出层父级,并且加入到body直属
    let parentDiv = createMsgBox();
    if (typeof html === 'string')
      parentDiv.innerHTML = html;
    else
      parentDiv.appendChild(html);
    // 位置
    let posClsArr = positionClass(position);
    $(parentDiv.firstElementChild).addClass(...posClsArr);
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