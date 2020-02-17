/*
缓存页组件:
    组件的主要能力是使用createDocumentFragment这个API将页面缓存为DOM片段.
    由于片段不在文档流内,所以不会影响当前HTML文档.组件的点击事件状态靠几个关键属性保证.
cache:
    缓存对象,键是每个页面对应的ID,值是DOM片段对象.对于当前显示的DOM,其值为null.
    在选项卡的添加减少切换时,都会将当前显示DOM的值置为null.
tabsDom:
    选项卡工具栏的DOM,包含选项卡栏和其它功能按钮.当前活动的选项卡只能有一个,以样式类active标明.
contDom:
    用于显示DOM的容器
 */
((win) => {
    // 帮助函数
    const $ = win.$ui;
    // 生成选项卡和功能区DOM,添加到容器内
    /* html内容:
        <a class="tabsbox-left"></a>
        <nav class="tabsbox-navbox">
          <div class="tabsbox-nav"></div>
        </nav>
        <a class="tabsbox-right"></a>
        <span class="tabsbox-menutitle">功能</span>
        <div class="tabsbox-menugroup">
          <span class="tabsbox-goto-active">定位当前页</span>
          <span class="tabsbox-close-all">关闭全部</span>
          <span class="tabsbox-close-other">关闭其它</span>
        </div>
     */
    let createTabDom = (tabsDom) => {
        let fragment = $.fragment();
        fragment.append($('<a>').addClass('tabsbox-left')[0]);
        fragment.append($('<nav>').addClass('tabsbox-navbox').append($('<div>').addClass('tabsbox-nav')[0])[0]);
        fragment.append($('<a>').addClass('tabsbox-right')[0]);
        fragment.append($('<span>').addClass('tabsbox-menutitle').text('功能')[0]);
        let menugroup = $('<div>').addClass('tabsbox-menugroup').append(
            $('<span>').addClass('tabsbox-goto-active').text('定位当前页')[0],
            $('<span>').addClass('tabsbox-close-all').text('关闭全部')[0],
            $('<span>').addClass('tabsbox-close-other').text('关闭其它')[0]
        )[0];
        fragment.append(menugroup);
        $(tabsDom).append(fragment).addClass('tabsbox');
    };
    // 建立cachepage实例
    // tabsDom:选项卡容器DOM,contDom:显示内容的容器DOM
    let cachePage = (tabsDom, contDom) => {
        //
        if (!tabsDom || !contDom) throw '必须传入DOM对象';
        // 缓存页对象
        let self = {};
        // 缓存器,{c_id:createDocumentFragment片断,c_id2:null},值为null的表示当前活动页,只能有一个
        let cache = {};
        // 生成选项卡工具dom
        createTabDom(tabsDom);

        //-----------------------------------------------------------------
        // 主要方法 载入新页面需要调用的方法,做了更新选项卡状态和DOM缓存状态.在菜单的点击事件上执行次方法.
        // 该方法第3个参数onload(loadType)是一个方法,可以根据loadType参数值判断是否要载入新的页面
        // loadType=1: 菜单是当前页面
        // loadType=2: 菜单之前载入过
        // loadType=3: 是新载入菜单,其对应的页面没有载入过,需要做载入新页面的操作
        //-----------------------------------------------------------------
        // {pid:菜单唯一标识,title:选项卡标题},点击左侧菜单时,调用此方法
        self.load = (pid, title,onload) => {
            if (!title) {
                throw 'tab title is empty!';
            }
            // (情形1) 如果载入的是当前活动的选项卡页,不动作
            if (cache[pid] === null) {
                //console.log('type1');
                if (typeof onload === 'function')
                    onload(1);
                return;
            }
            // (情形2)激活选项卡.如果pid已添加过,则到缓存中取出页面显示在contDom中,激活对应选项卡.
            if (cache[pid]) {
                // 切换活动选项卡状态
                let atabdom = activeTab(pid);
                // 选项卡位置调整到可见区域
                adjustPositionTab(atabdom);
                // 添加当前DOM到缓存
                cacheActiveTab();
                // 取出pid对应的DOM
                let cacheDom = cache[pid];
                // 标识为null,表示pid成为新的活动页
                cache[pid] = null;
                //console.log('type2');
                contDom.innerHTML = '';
                $(contDom).html(cacheDom);
                if (typeof onload === 'function')
                    onload(2);
                return;
            }
            // (情形3)新增加选项卡
            // 增加选项卡
            addTab(pid, title);
            // 选项卡框滚动条移动到最后
            scrollerTabs(1);
            // 当增加的是第1个选项卡时,没有活动页面,不需要缓存
            if (Object.getOwnPropertyNames(cache).length > 0) {
                cacheActiveTab();
            }
            // 添加到缓存.当前活动页缓存约定为null,不缓存
            cache[pid] = null;
            //console.log('type3');
            if (typeof onload === 'function')
                onload(3);
            //return;
        };

        //-----------------------------------------------------------------
        // Mehtod
        //-----------------------------------------------------------------
        // 新增选项卡
        let addTab = (pid, title) => {
            // 去掉当前活动的选项卡
            let activeTabDom = $(tabsDom).find('.tabsbox-tab.active');
            if (activeTabDom.length > 0) {
                activeTabDom.removeClass('active');
            }
            let tabdom = $('<label>').addClass('tabsbox-tab', 'active').prop({ 'title': title, 'val': pid })
                .html(title).append($('<a>').addClass('tabsbox-tabclose').prop('title', '关闭').text('×')[0])[0];
            // 绑定X关闭事件
            closeTab(tabdom);
            // 绑定点击事件
            selectedTab(tabdom);
            // 添加到选项卡容器
            $(tabsDom).find('.tabsbox-nav').append(tabdom);
        };
        // 切换激活选项卡.然后返回活动tab的Dom对象
        let activeTab = (pid) => {
            // 去掉当前活动的选项卡
            let activeTabDom = $(tabsDom).find('.tabsbox-tab.active');
            if (activeTabDom.length > 0) {
                activeTabDom.removeClass('active');
            }
            // 添加pid选项卡活动样式
            let tabDom = $(tabsDom).find(".tabsbox-tab[val='" + pid + "']").addClass('active')[0];
            return tabDom;
        };

        // 将活动页内容DOM添加到缓存.(缓存当前页面)
        let cacheActiveTab = () => {
            // 找到cache中null值的键,将显示容器div中的所有元素添加DOM片段后,赋值
            for (let prop in cache) {
                if (cache.hasOwnProperty(prop)) {
                    if (cache[prop] === null) {
                        let fragment = $.fragment();
                        fragment.append(...contDom.childNodes);
                        cache[prop] = fragment;
                        return;
                    }
                }
            }
        };
        // 调整选项卡框的滚动条值,使选项卡显示在合适的位置上
        // len:滚动距离,>0 : 向右滚此距离, <0 : 向左滚, 0 : 滚动到最左, 1 : 到最右,
        //              'left': 左滚固定距离, 'right': 右滚固定距离
        let scrollerTabs = (len) => {
            let navDom = $(tabsDom).find('.tabsbox-nav')[0];
            // 滚动条位置
            let sPosition = navDom.scrollLeft;
            // nav宽度
            let w = navDom.clientWidth;
            // nav文档长度
            let swidth = navDom.scrollWidth;
            // 需要滚动的新位置
            let toPosition = 0;
            //
            if (len == 0)
                toPosition = 0;
            else if (len == 1)
                toPosition = swidth;
            else if (len == 'left')
                toPosition = sPosition - (w / 4);
            else if (len == 'right')
                toPosition = sPosition + (w / 4);
            else
                toPosition = sPosition + len;
            // 移动滚动条, 此处无需判是否滚动到头或者尾.如果传入的滚动位置无效,则会自动设为0或最大
            navDom.scrollTo(toPosition, 0);
            // console.log('滚动位置: ' + toPosition);
            // console.log('文档长度: ' + swidth);
        };

        // 调整选项卡框的滚动条值,使指定选项卡处于中间位置.
        let adjustPositionTab = (tabDom) => {
            let navDom = $(tabsDom).find('.tabsbox-nav')[0];
            // 界限值89px,大致是一个按钮的宽度
            let tabLen = 89;
            // 滚动条位置
            // let sPosition = navDom.scrollLeft;
            // nav宽度
            let w = navDom.clientWidth;
            // nav文档长度
            // let swidth = navDom.scrollWidth;
            // 该选项卡离选项卡框左起位置
            let tabLeft = tabDom.offsetLeft;
            // 让tab位于navdom的中间位置,算法如下:定位到tab离左边距离,再减去navDom宽度的一半
            navDom.scrollTo(tabLeft - (w / 2), 0);
        };
        //------------------------------------------------------------------
        // Event 选项卡事件
        //------------------------------------------------------------------
        // 点击关闭选项卡
        let closeTab = (tabDom) => {
            $(tabDom).find('.tabsbox-tabclose')[0].onclick = (event) => {
                event.stopPropagation();
                // (情形1)关闭的是最后一个tab页,删除tab,清空缓存
                if (Object.getOwnPropertyNames(cache).length == 1) {
                    // 删除选项卡,删除缓存,清空显示容器
                    contDom.innerHTML = '';
                    cache = {};
                    $(tabDom).remove();
                    return;
                }
                // (情形2)关闭时,多于1个tab页时
                // 清除对应缓存,
                let cacheId = $(tabDom).prop('val');
                delete cache[cacheId];
                // 如果关闭的是活动页,将cache中最后一个id,对应的选项卡激活,对应DOM载入显示容器
                if ($(tabDom).hasClass('active')) {
                    let cacheId = Object.getOwnPropertyNames(cache).pop();
                    let lastTabDom = $(tabsDom).find(".tabsbox-tab[val='" + cacheId + "']").addClass('active');
                    contDom.innerHTML = '';
                    $(contDom).html(cache[cacheId]);
                    cache[cacheId] = null;
                }
                // 删除tab,
                $(tabDom).remove();
            };
        };
        // 点击选项卡
        let selectedTab = (tabDom) => {
            tabDom.onclick = () => {
                // 点击选项卡时,位置会相应调整,确保点击的选项卡完全显示在父级的可见区域.
                adjustPositionTab(tabDom);

                // (情形1)点击的是活动页面,退出
                if ($(tabDom).hasClass('active'))
                    return;

                // (情形2)非活动页面,即切换行为
                // 缓存当前DOM
                cacheActiveTab();
                // 去掉当前活动的选项卡活动状态
                let activeTabDom = $(tabsDom).find('.tabsbox-tab.active');
                if (activeTabDom.length > 0) {
                    activeTabDom.removeClass('active');
                }
                // 激活点击的选项卡,获取其缓存页加载到显示容器
                let cacheId = $(tabDom).addClass('active').prop('val');
                contDom.innerHTML = '';
                $(contDom).html(cache[cacheId]);
                cache[cacheId] = null;
                // console.log(cache);
            };
        };
        //------------------------------------------------------------------
        // Event 选项卡条功能事件
        //------------------------------------------------------------------
        // 向左滚动按钮
        $(tabsDom).find('.tabsbox-left')[0].onclick = () => {
            scrollerTabs('left');
        };
        // 向右滚动按钮
        $(tabsDom).find('.tabsbox-right')[0].onclick = () => {
            scrollerTabs('right');
        };

        // 定位当前按钮
        $(tabsDom).find('.tabsbox-goto-active')[0].onclick = () => {
            let activeTab = $(tabsDom).find('.active')[0];
            if (!activeTab) return;
            adjustPositionTab(activeTab);
        };
        // 关闭全部选项卡
        $(tabsDom).find('.tabsbox-close-all')[0].onclick = () => {
            // 删除选项卡,删除缓存,清空显示容器
            let navDom = $(tabsDom).find('.tabsbox-nav').empty();
            contDom.innerHTML = '';
            cache = {};
        };
        // 关闭除当前外所有选项卡
        $(tabsDom).find('.tabsbox-close-other')[0].onclick = () => {
            // 删除选项卡除活动的外
            let navDom = $(tabsDom).find('.tabsbox-nav .tabsbox-tab:not(.active)').remove();
            // 除了为null的都删除掉,null是当前页特征
            for (let prop in cache) {
                if (cache.hasOwnProperty(prop)) {
                    if (cache[prop] === null)
                        continue;
                    delete cache[prop];
                }
            }
        };
        return self;
    };
    win.cachepage = cachePage;
})(window);