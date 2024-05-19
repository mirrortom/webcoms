// ====================================================================================
// m-docmenu 自定义标记
// ====================================================================================
((win) => {
  const $ = win.ns.domHelp || win.ns.jslib;
  win.customElements.define('m-docmenu', class extends HTMLElement {

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
    }
    #clsRoot = 'docmenu';
    #cls = {
      dom: this.#clsRoot,// 根样式名
      item: this.#clsRoot + '-item',// 菜单项
      gTitle: this.#clsRoot + '-title',// 菜单组标题
      gDiv: this.#clsRoot + '-group',// 菜单组容器
      gOpenIco: this.#clsRoot + '-open', // 菜单组打开图标
      gCloseIco: this.#clsRoot + '-close',// 菜单组收起图标
      gClose: this.#clsRoot + '-group-close'// 菜单组关闭
    };

    // ========
    // 钩子函数
    // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
    // ========
    connectedCallback() {

    }

    // =======
    // prop
    // =======
    get Cls() {
      return this.#cls;
    }
    // =======
    // method
    // =======

    // 主要方法: 生成文档菜单
    /* json数据说明:
    [
      {title: '菜单标题1', props: { }, styles: []}
      {title: '组标题1', props: {}, styles: [],
         menus:[
                 { title: '菜单标题', props: { }, styles: [] },
                 { title: '菜单标题', props: { }, styles: [],
                     menus:[{}] 
                 }
               ]
      }
    ]
    一个数组,每个菜单是一个对象,除了title必须.props是加到菜单或组上的属性,styles是样式名字.都可省略.
    如果对象里包含menus数组,那么视为菜单组,title是组标题.menus里还是菜单对象,可以嵌套menus.
      dom结构说明
    <m-docmenu>

    </m-docmenu>
    */
    create(json, menuItemClickE) {
      let cls = this.Cls;
      // 添加样式
      let thisobj = $(this);
      thisobj.addClass(cls.dom);
      // 
      if (json) {
        // 生成菜单项
        let createMenuItem = (data) => {
          let a = $('<a>').addClass(cls.item).text(data.title);
          data.styles && a.addClass(...data.styles);
          data.props && a.prop(data.props);
          return a[0];
        };
        // 生成菜单组
        let createMenuGroupItem = (data) => {
          let group = $('<div>').addClass(cls.gDiv, cls.gClose);
          let span = $('<span>').addClass(cls.gTitle).html('<i class="' + cls.gCloseIco + '"></i>' + data.title);
          data.styles && span.addClass(...data.styles);
          data.props && span.prop(data.props);
          return group.append(span[0])[0];
        };

        // 递归生成菜单项dom,
        let createDocMenuDom = (itemData, domBox) => {
          if (itemData.menus) {
            // 包含menus,生成菜单组
            let groupUl = createMenuGroupItem(itemData);
            // 递归调用,处理menus数组里的菜单对象
            for (var i = 0; i < itemData.menus.length; i++) {
              createDocMenuDom(itemData.menus[i], groupUl);
            }
            domBox.append(groupUl);
          } else {
            // 否则是菜单项
            domBox.append(createMenuItem(itemData));
          }
        }

        // 循环json,生成菜单
        for (var i = 0; i < json.length; i++) {
          createDocMenuDom(json[i], thisobj);
        }
      }

      // 事件绑定
      // 1.菜单组收起和展开
      $(this).find('.' + cls.gTitle).each((item) => {
        item.onclick = () => {
          let iconDom = $(item).find(`.${cls.gOpenIco},.${cls.gCloseIco}`);
          if (iconDom.hasClass(cls.gOpenIco)) {
            iconDom.removeClass(cls.gOpenIco);
            iconDom.addClass(cls.gCloseIco);
            // 找到组容器,添加收起样式
            $(item).parent('.' + cls.gDiv).addClass(cls.gClose)
          } else {
            iconDom.addClass(cls.gOpenIco);
            iconDom.removeClass(cls.gCloseIco);
            $(item).parent('.' + cls.gDiv).removeClass(cls.gClose)
          }
        }
      })

      // 2.绑定菜单项点击
      $(this).find('.' + cls.item).each((item, index) => {
        item.onclick = () => {
          // 添加活动状态样式
          $(this).find('.' + cls.item + '.active').removeClass('active');
          $(item).addClass('active');
          // 执行点击事件
          let menuIndex = index;
          if (typeof menuItemClickE == 'function')
            menuItemClickE(item, menuIndex);
        }
      })
    }

    // 程序点击一个菜单项
    // menuIndex: 菜单索引
    activeItem(menuIndex) {
      let cls = this.Cls;
      let activeMenuItem = $(this).find('.' + cls.item)[menuIndex];
      activeMenuItem.click();
    }
    // 打开/关闭菜单组
    // index:索引.为-1时打开所有组
    // 打开时注意:必须从祖先组依次打开到指定组,否则打开了子组,但没打开父级或者祖先组,那还是不可见的.
    openGroups(index = -1) {
      let cls = this.Cls;
      if (index == -1) {
        $(this).find('.' + cls.gDiv).removeClass(cls.gClose);
        $(this).find('.' + cls.gCloseIco).removeClass(cls.gCloseIco).addClass(cls.gOpenIco);
        return;
      }
      let group = $(this).find('.' + cls.gDiv).eq(index);
      if (group.length == 1) {
        // 去除隐藏
        group.removeClass(cls.gClose);
        // 图标修改
        group.find(':scope > .' + cls.gTitle).find('.' + cls.gCloseIco).removeClass(cls.gCloseIco).addClass(cls.gOpenIco);
      }
    }
    // 关闭菜单组
    // index:索引.为-1时关闭所有组
    closeGroups(index = -1) {
      let cls = this.Cls;
      if (index == -1) {
        $(this).find('.' + cls.gDiv).addClass(cls.gClose);
        $(this).find('.' + cls.gOpenIco).removeClass(cls.gOpenIco).addClass(cls.gCloseIco);
        return;
      }
      let group = $(this).find('.' + groupCls).eq(index);
      if (group.length == 1) {
        group.addClass(cls.gClose);
        group.find(':scope > .' + cls.gOpenIco).removeClass(cls.gOpenIco).addClass(cls.gCloseIco);
      }
    }
  });
})(window);