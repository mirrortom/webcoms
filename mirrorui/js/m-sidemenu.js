// ====================================================================================
// m-sidemenu 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-sidemenu', class extends HTMLElement {
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
            // 添加样式
            let thisobj = $(this);
            thisobj.addClass('sidemenu');
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

        // 主要方法: 生成侧边菜单
        // json结构: 一个数组,元素是一个对象,每个对象是一组菜单.props是菜单dom属性键值对.styles是样式数组
        // [
        //    {
        //        title: '组标题',
        //        props: { k: 'v', k1: 'v1' },
        //        styles: ['class1', 'class2'],
        //        menus: [
        //            {
        //              title: '菜单标题', props: { k1: v1,k2:v2 }, styles:[class1, class2]
        //            },
        //            { title: '-' 加一条分割线 }
        //        ]
        //    },
        //    ...
        // ]
        // menuItemClickE(item,index): 菜单点击事件.item: 菜单dom对象,index:菜单索引
        //
        create(json, menuItemClickE) {
            // 菜单项dom生成
            if (json) {
                this.innerHTML = '';
                this.innerText = '';
                for (let i = 0, len = json.length; i < len; i++) {
                    let groupItem = json[i];
                    // 菜单组
                    let mgroup = $('<ul>').addClass('sidemenu-group');
                    let menugroupTitle = $('<span>').addClass('sidemenu-label').html(groupItem.title + '<i class="sidemenu-arrdown"></i>');
                    //menugroupTitle.prop('title', groupItem.title);
                    groupItem.styles && menugroupTitle.addClass(...groupItem.styles);
                    groupItem.props && menugroupTitle.prop(groupItem.props);
                    mgroup.append($('<li>').append(menugroupTitle[0])[0]);
                    // 菜单项
                    for (let j = 0, len = groupItem.menus.length; j < len; j++) {
                        let menuItem = groupItem.menus[j];
                        // 分割线
                        if (menuItem.title == '-') {
                            mgroup.append($('<li>').html('<b class="sidemenu-split"></b>')[0]);
                            continue;
                        }
                        // 属性和样式
                        let menu = $('<a>').addClass('sidemenu-item').text(menuItem.title);
                        //menu.prop('title', menuItem.title);
                        menuItem.styles && menu.addClass(...menuItem.styles);
                        menuItem.props && menu.prop(menuItem.props);
                        mgroup.append($('<li>').append(menu[0])[0]);
                    }
                    //
                    this.append(mgroup[0]);
                }
            }

            // 事件绑定
            // 1. 菜单组收起和展开
            $(this).find('.sidemenu-label').each((item) => {
                item.onclick = () => {
                    let showClsN = 'sidemenu-arrdown', hideClsN = 'sidemenu-arrleft';
                    let arrowDom = $(item).find(`.${showClsN},.${hideClsN}`);
                    if (arrowDom.hasClass(showClsN)) {
                        arrowDom.removeClass(showClsN);
                        arrowDom.addClass(hideClsN);
                        // 找到ul,添加收起样式
                        $(item).parent('.sidemenu-group').addClass('sidemenu-group-close')
                    } else {
                        arrowDom.addClass(showClsN);
                        arrowDom.removeClass(hideClsN);
                        $(item).parent('.sidemenu-group').removeClass('sidemenu-group-close')
                    }
                }
            })
            // 2. 菜单项点击
            $(this).find('.sidemenu-item').each((item, index) => {
                item.onclick = () => {
                    // 添加活动状态样式
                    $(this).find('.sidemenu-item.active').removeClass('active');
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
            let activeMenuItem = $(this).find('.sidemenu-item')[menuIndex];
            activeMenuItem.click();
        }
    });
})(window);