// ====================================================================================
// m-mnavmenu 自定义标记 
// 底部导航菜单, 用于手机
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-mnavmenu', class extends HTMLElement {
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
            $(this).addClass('mnavmenu')
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
        create(menuItemClickE) {
            // 事件绑定
            // 1. 菜单组收起和展开
            $(this).find('.mnavmenu-label').each((item, i) => {
                item.onclick = () => {
                    let itemBoxCls = '.mnavmenu-itembox';
                    let menuItemIsClose = $(item).prev(itemBoxCls).hasClass('close');
                    $(this).find(itemBoxCls).addClass('close');
                    if (menuItemIsClose == true) {
                        $(item).prev(itemBoxCls).removeClass('close');
                    }
                }
            })
            // 2. 子菜单项点击
            $(this).find('.mnavmenu-item,.mnavmenu-menu').each((item, index) => {
                item.onclick = () => {
                    $(item).parent('.mnavmenu').find('.mnavmenu-itembox').addClass('close');
                    if (typeof menuItemClickE == 'function')
                        menuItemClickE(item, index);
                }
            });

        }

        // 程序点击一个菜单项
        // menuIndex: 菜单索引
        activeItem(menuIndex) {
            let activeMenuItem = $(this).find('.mnavmenu-item,.mnavmenu-menu')[menuIndex];
            activeMenuItem.click();
        }
    });
})(window);