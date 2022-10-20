// ====================================================================================
// m-docmenu 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
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
            // 添加样式
            let thisobj = $(this);
            thisobj.addClass('docmenu');
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

        // 主要方法: 生成文档菜单
        // json结构: 一个数组,元素是一个对象.{title:'菜单组标题',menus:['菜单项1','菜单项2',..,{}]}
        // menus里可以嵌套子菜单组
        // [
        //    {
        //        title: '组标题',
        //        menus: ['菜单项1','菜单项2',
        //                 {
        //                  title: '子菜单组标题',menus:[]]
        //                 }
        //               ]
        //    },
        //    ...
        // ]
        //
        create(json, menuItemClickE) {
            // 菜单项dom生成
            if (json) {

                // 按每个菜单组生成dom,组是一个对象.对象的menus属性是菜单项数组,可能还包含菜单组
                // 所以需要递归,但第一级菜单组都是平级的,不存在一个根菜单.
                let createDocMenuGroup = (group, domBox) => {
                    // 菜单组标题
                    let ul = $('<ul>').addClass('docmenu-group', 'docmenu-group-close');
                    let span = $('<span>').addClass('docmenu-title').html('<i class="docmenu-close"></i>' + group.title);
                    ul.append($('<li>').append(span[0])[0]);

                    // 菜单项标题
                    for (let i = 0; i < group.menus.length; i++) {
                        let menuItem = group.menus[i];
                        // 子级
                        if (typeof menuItem === 'object') {
                            let li = $('<li>')[0];
                            createDocMenuGroup(menuItem, li);
                            ul.append(li);
                        } else {
                            // 属性和样式
                            let menu = $('<a>').addClass('docmenu-item').text(menuItem);
                            ul.append($('<li>').append(menu[0])[0]);
                        }
                    }
                    domBox.append(ul[0]);
                }

                // 循环json,生成菜单
                let tmpDom = $.fragment();
                for (var i = 0; i < json.length; i++) {
                    createDocMenuGroup(json[i], tmpDom);
                }
                this.append(tmpDom);
            }

            // 事件绑定
            // 1. 菜单组收起和展开
            $(this).find('.docmenu-title').each((item) => {
                item.onclick = () => {
                    let openClsN = 'docmenu-open', closeClsN = 'docmenu-close';
                    let iconDom = $(item).find(`.${openClsN},.${closeClsN}`);
                    if (iconDom.hasClass(openClsN)) {
                        iconDom.removeClass(openClsN);
                        iconDom.addClass(closeClsN);
                        // 找到ul,添加收起样式
                        $(item).parent('.docmenu-group').addClass('docmenu-group-close')
                    } else {
                        iconDom.addClass(openClsN);
                        iconDom.removeClass(closeClsN);
                        $(item).parent('.docmenu-group').removeClass('docmenu-group-close')
                    }
                }
            })
            // 2. 菜单项点击
            $(this).find('.docmenu-item').each((item, index) => {
                item.onclick = () => {
                    // 添加活动状态样式
                    $(this).find('.docmenu-item.active').removeClass('active');
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
            let activeMenuItem = $(this).find('.docmenu-item')[menuIndex];
            activeMenuItem.click();
        }
        // 打开/关闭所有菜单组
        // tag=-1 关闭
        openGroups(tag) {
            let openClsN = 'docmenu-open', closeClsN = 'docmenu-close',
                groupCloseClsN = 'docmenu-group-close';
            if (tag == -1) {
                $(this).find('.docmenu-group').addClass(groupCloseClsN);
                $(this).find(`.${openClsN}`).removeClass(openClsN).addClass(closeClsN);
                return;
            }
            $(this).find('.docmenu-group').removeClass(groupCloseClsN);
            $(this).find(`.${closeClsN}`).removeClass(closeClsN).addClass(openClsN);
        }
    });
})(window);