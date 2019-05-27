/**
 * 侧边菜单
 */
((win) => {
    // 传入菜单nav标记的id,生成菜单 menuItemClickE(menuItemDom):菜单项点击事件
    let sideMenu = (menuboxId, menuItemClickE) => {
        // 菜单navDom
        let self = {};
        self.menuDom = document.getElementById(menuboxId);
        bindEvent_menuGroup(self.menuDom);
        bindEvent_menuItem(self.menuDom, menuItemClickE);
        // 程序操作点击菜单
        self.activeItem = (menuIndex) => {
            let activeMenuItem = self.menuDom.querySelectorAll('.sidemenu-item')[menuIndex];
            activeMenuItem.click();
        }
        return self;
    };
    // 菜单组收起和展开
    let bindEvent_menuGroup = (menuDom) => {
        let showClsN = 'sidemenu-arrdown',
            hideClsN = 'sidemenu-arrleft';
        menuDom.querySelectorAll('.sidemenu-label').forEach((item) => {
            item.onclick = () => {
                let arrowDom = item.parentNode.querySelector(`.${showClsN},.${hideClsN}`);
                if (arrowDom.classList.contains(showClsN)) {
                    arrowDom.classList.remove(showClsN);
                    arrowDom.classList.add(hideClsN);
                    // 找到ul
                    item.parentNode.parentNode.classList.add('sidemenu-group-close');
                } else {
                    arrowDom.classList.add(showClsN);
                    arrowDom.classList.remove(hideClsN);
                    item.parentNode.parentNode.classList.remove('sidemenu-group-close');
                }
            }
        });
    };
    // 菜单项点击
    let bindEvent_menuItem = (menuDom, menuItemClickE) => {
        let clsN = 'active';
        menuDom.querySelectorAll('.sidemenu-item').forEach((item) => {
            item.onclick = () => {
                menuDom.querySelectorAll('.sidemenu-item.active').forEach((item) => {
                    item.classList.remove(clsN);
                });
                item.classList.add(clsN);
                if (typeof menuItemClickE == 'function')
                    menuItemClickE(item);
            }
        });
    };
    // window上的引用名字
    win.sidemenu = sideMenu;
})(window);