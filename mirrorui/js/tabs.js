// 选项卡页插件
((win) => {
    // 激活时样式名
    const activeCls = 'active';
    // 标题样式名
    const tabLabelCls = 'tabs-label';
    // 面板样式名
    const tabPanelCls = 'tabs-panel';
    // 标题与面板关联属性名
    const relkey = 'pid';
    // 帮助函数
    const $ = win.ns.domHelp;
    /**
     * 生成一个新的pid
     * @param {Array} pids 现有的pid数组,不能与已有的pid重复
     * @returns {number} 返回新的pid值
     */
    let newPid = (pids) => {
        let newpid = pids.length;
        while (pids.indexOf(newpid) > 0) {
            newpid++;
        }
        return newpid;
    };
    /**
     * 切换激活选项卡
     * @param {any} self tabs对象
     * @param {number|HTMLElement} activeTab 要激活的选项卡索引或者对象.如果索引无效或者超过选项卡个数,则激活第0个.
     */
    let _activeTab = (self, activeTab) => {
        // 要切换到这个选项卡
        let labelNow = activeTab;
        if (!activeTab)
            labelNow = self.tabsLabels[0];
        if (typeof activeTab === 'number') {
            if (activeTab >= self.tabsLabels.length)
                labelNow = self.tabsLabels[0];
            else
                labelNow = self.tabsLabels[activeTab];
        }
        // console.log(labelNow);
        // 去掉其它选项卡激活状态,将当前选项卡置为活动
        // 隐藏其它面板,激活对应面板.选项卡与面板由pid属性关联.选项卡标签pid值与面板pid值相等
        let pidOld = $(self.tabsDom).find('.' + activeCls).removeClass(activeCls).prop(relkey);
        $(self.tabsDom).find(`.${tabPanelCls}[${relkey}='${pidOld}']`).removeClass(activeCls);
        //
        let pidNow = $(labelNow).addClass(activeCls).prop(relkey);
        $(self.tabsDom).find(`.${tabPanelCls}[${relkey}='${pidNow}']`).addClass(activeCls);

        // 执行激活后方法
        if (typeof self.onTabActive === 'function')
            self.onTabActive(labelNow);
    };
    /**
     * 绑定选项卡标签切换事件.每个选项卡标签单独绑定
     * @param {any} self tabs对象
     * @param {any} tabLabel tablabel对象
     */
    let bindEvent_onChange = (self, tabLabel) => {
        if (self.changeType == 2) {
            tabLabel.onmouseenter = () => {
                _activeTab(self, tabLabel);
            };
        } else {
            tabLabel.onclick = () => {
                _activeTab(self, tabLabel);
            };
        }
    };
    /**
     * 增加一个选项卡
     * @param {any} self tabs对象
     * @param {string} title 选项卡标题
     * @param {number} index 添加到这个索引位置,原有位置的选项卡后移.如果索引无效,加到最后.
     * @returns {number} 新面板id值
     */
    let _addTab = (self, title, index) => {
        let count = self.getCount();
        let addIndex = index;
        if (!addIndex || addIndex < 0 || addIndex >= count)
            addIndex = count;
        // 生成pid
        let pid = newPid(self.tabsLabelsPids);
        self.tabsLabelsPids.push(pid);
        // 生成选项卡标签和面板.
        let label = $('<span>').addClass(tabLabelCls).text(title).prop(relkey, pid)[0];
        //
        let panel = $('<div>').addClass(tabPanelCls).prop(relkey, pid)[0];
        // 绑定标签的点击事件
        bindEvent_onChange(self, label);
        // 标签加入
        if (addIndex == count) {
            $(self.tabsLabels[self.tabsLabels.length-1]).after(label);
        } else {
            // 如果是插入添加,原有位置的标签后移
            $(self.tabsLabels[addIndex]).before(label);
        }
        // 面板加入
        $(self.tabsDom).append(panel);
        return pid;
    };
    /**
     * 删除一个选项卡pid
     * @param {any} self tabs对象
     * @param {number} index 要删除的选项卡索引或者pid
     * @param {string} tagType index=索引(默认) | pid=pid
     */
    let _delTab = (self, index, tagType) => {
        if (tagType === 'pid') {
            // pid有效时做删除
            if (self.tabsLabelsPids.contains(index)) {
                let panel = $(self.tabsDom).find(`.${tabPanelCls}[${relkey}='${index}']`).remove();
                let label = $(self.tabsDom).find(`.${tabLabelCls}[${relkey}='${index}']`).remove();
                // pids列表更新
                let pidIndex = self.tabsLabelsPids.indexOf(index);
                self.tabsLabelsPids.splice(pidIndex, 1);
            }
        } else {
            // index有效时做删除
            if (!index || index < 0 || index >= self.tabsLabels.length)
                return;
            let label = self.tabsLabels[index];
            let pid = $(label).prop(relkey);
            $(label).remove();
            let panel = $(self.tabsDom).find(`.${tabPanelCls}[${relkey}='${pid}']`).remove();
            // pids列表更新
            let pidIndex = self.tabsLabelsPids.indexOf(parseInt(pid));
            self.tabsLabelsPids.splice(pidIndex, 1);
        }
    };
    //--------------------------------------------------------------------------//
    /**
     * 初始化选项卡(工厂函数)
     * @param {string|HTMLElement} tabsId 容器DomId,或者dom对象
     * @param {number} activeIndex 默认活动页索引 0
     * @param {number} changeType 切换方式:1=点击(默认) 2=鼠标移入
     * @returns {any} 选项卡对象
     */
    let tabs = (tabsId, activeIndex, changeType) => {
        // 选项卡对象
        let self = {};

        /**** Prop ****/
        // event:激活某个选项卡后执行方法 
        self.onTabActive = null;
        // 切换方式
        self.changeType = changeType || 1;

        // 选项卡容器DOM对象
        self.tabsDom = typeof tabsId === 'string' ? document.getElementById(tabsId) : tabsId;
        // 选项卡所有标签dom列表
        // (*注意)这里要用getElementsByClassName(),这个方法取得的dom列表, 会随着选项卡dom的加减而自动刷新(动态的),而querySelectorAll()取得的列表不会(静态的).)
        self.tabsLabels = self.tabsDom.getElementsByClassName(tabLabelCls);
        // 选项卡pid数组
        self.tabsLabelsPids = [];

        /**** Init ****/
        // 设置每个标签的pid属性
        for (let i = 0; i < self.tabsLabels.length; i++) {
            let pid = newPid(self.tabsLabelsPids);
            $(self.tabsLabels[i]).prop(relkey, pid);
            self.tabsLabelsPids.push(pid);
        }
        // 设置每个面板的pid属性
        let panels = self.tabsDom.getElementsByClassName(tabPanelCls);
        for (let i = 0; i < self.tabsLabelsPids.length; i++) {
            let pid = self.tabsLabelsPids[i];
            if (i >= panels.length) break;
            $(panels[i]).prop(relkey, pid);
        }
        // 给默认激活的选项卡标签,设置活动样式.如果传入的索引超过选项卡个数,忽略
        let _index = activeIndex;
        if (!activeIndex || activeIndex < 0 || activeIndex >= self.tabsLabels.length)
            _index = 0;
        $(self.tabsLabels[_index]).addClass(activeCls);
        if (_index < panels.length)
            $(panels[_index]).addClass(activeCls);

        /**** Method ****/
        // 切换选项卡方法 index: 要激活的选项卡索引
        self.activeTab = (index) => {
            _activeTab(self, index);
        };
        // 删除一个选项卡. index:要删除的选项卡索引.tagType:'index'(默认) | 'pid'
        self.delTab = (index, tagType) => {
            _delTab(self, index, tagType);
        };
        // 添加一个选项卡. title:选项卡标题, index:添加到这个索引位置
        self.addTab = (title, index) => {
            _addTab(self, title, index);
        };
        // 返回选项卡个数
        self.getCount = () => {
            return self.tabsLabels.length;
        };

        /**** Event ****/
        // 绑定选项卡标签的切换事件
        for (var i = 0; i < self.tabsLabels.length; i++) {
            let item = self.tabsLabels[i];
            bindEvent_onChange(self, item);
        }

        //
        return self;
    };
    // window引用名
    win.ns.tabs = tabs;
})(window);