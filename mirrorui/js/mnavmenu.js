/*
 * 底部导航菜单,用于手机
 * let menu = mnavmenu(domId,menuItemClickEvent);
 */
((win) => {
    // 帮助函数
    const M = win.$ui;
    // 传入菜单nav标记的id,生成菜单 menuItemClickE(menuItemDom):菜单项点击事件
    let mnavMenu = (menuboxId, menuItemClickE) => {
        // 菜单navDom
        let self = {};
        self.menuDom = document.getElementById(menuboxId);
        bindEvent_menuGroup(self.menuDom);
        bindEvent_menuItem(self.menuDom, menuItemClickE);
        // 程序操作点击菜单
        self.activeItem = (menuIndex) => {
            let activeMenuItem = self.menuDom.querySelectorAll('.mnavmenu-item')[menuIndex];
            activeMenuItem.click();
        }
        return self;
    };

    // 菜单组收起和展开
    let bindEvent_menuGroup = (menuDom) => {
        M(menuDom).find('.mnavmenu-label').each((item, i) => {
            item.onclick = () => {
                let itemBoxCls = '.mnavmenu-itembox';
                let menuItemIsClose = M(item).prev(itemBoxCls).hasClass('close');
                M(menuDom).find(itemBoxCls).addClass('close');
                if (menuItemIsClose == true) {
                    M(item).prev(itemBoxCls).removeClass('close');
                }
            }
        })
    };

    // 菜单项点击
    let bindEvent_menuItem = (menuDom, menuItemClickE) => {
        M(menuDom).find('.mnavmenu-item').each((item, index) => {
            item.onclick = () => {
                M(item).parent('.mnavmenu').find('.mnavmenu-itembox').addClass('close');
                if (typeof menuItemClickE == 'function')
                    menuItemClickE(item, index);
            }
        });
    };

    // window上的引用名字
    win.mnavmenu = mnavMenu;
})(window);