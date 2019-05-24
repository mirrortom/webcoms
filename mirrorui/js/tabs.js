// 选项卡页插件
((win) => {
    // tabsId:容器DomId, [activeIndex默认激活索引0], [changeType:切换方式1=点击 2=鼠标移入]
    let tabs = (tabsId, activeIndex, changeType) => {
        // 选项卡对象
        let self = {};
        // 配置对象
        let cfg = { changeType: changeType || 1, activeIndex: activeIndex || 0 };
        // 选项卡容器DOM对象
        let tabsDom = document.getElementById(tabsId);
        // 选项卡上指定激活项,默认第1个是激活的.
        let selectedTab = tabsDom.querySelectorAll('.tabs-label')[cfg.activeIndex];
        selectedTab.classList.add('active');
        let selectedPanel = tabsDom.querySelectorAll('.tabs-panel')[cfg.activeIndex];
        selectedPanel.classList.add('active');

        // 切换选项卡方法 activeTabIndex:要激活的选项卡索引
        let changeTab = (activeTabIndex) => {
            // 如果已是激活的,或者无效,则不动作
            let activeTab = tabsDom.querySelectorAll('.tabs-label')[activeTabIndex];
            if (!activeTab || activeTab.classList.contains('active')) {
                return;
            }
            // 去掉其它选项卡激活状态,将当前选项卡置为活动
            // 隐藏其它面板,激活一个面板.选项卡与面板由索引位置相关联.
            // 例如:激活第2个选项卡时,则激活第2个面板
            let tablabels = tabsDom.querySelectorAll('.tabs-label.active');
            let tabpanels = tabsDom.querySelectorAll('.tabs-panel.active');
            tablabels.forEach((item) => {
                item.classList.remove('active');
            });
            activeTab.classList.add('active');

            tabpanels.forEach((item) => {
                item.classList.remove('active');
            });
            let activeTabPanel = tabsDom.querySelectorAll('.tabs-panel')[activeTabIndex];
            activeTabPanel.classList.add('active');
        }

        // 绑定切换事件
        let tablabels = tabsDom.querySelectorAll('.tabs-label');
        if (cfg.changeType == 1) {
            tablabels.forEach((item, index) => {
                item.onclick = () => {
                    changeTab(index);
                }
            });
        } else if (cfg.changeType == 2) {
            tablabels.forEach((item, index) => {
                item.onmouseenter = () => {
                    changeTab(index);
                }
            });
        }
        //
        return self;
    };
    // window引用名
    win.tabs = tabs;
})(window);