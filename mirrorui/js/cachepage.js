/*
缓存页组件:
组件的主要能力是使用createDocumentFragment这个API将页面缓存为DOM片段.由于片段不在文档流内,所以不会影响当前HTML文档.
组件的点击事件状态靠几个关键属性保证.
cache:缓存对象,键是每个页面对应的ID,值是DOM片段对象.对于当前显示的DOM,其值为null.在选项卡的添加减少切换时,都会将当前显示DOM
的值置为null.
tabsDom:选项卡工具栏的DOM,包含选项卡栏和其它功能按钮.当前活动的选项卡只能有一个,以样式类active标明.
contDom:用于显示DOM的容器
 */
((win) => {
    //----帮助函数----帮助函数----帮助函数---帮助函数------------------------------------------------------------ //
    // 获取DOM上的自定义属性的值
    let getAttr = (dom, attrName) => {
        if (!attrName)
            attrName = 'val';
        return dom.attributes[attrName].nodeValue;
    };
    // 设置DOM上的自定义属性值
    let setAttr = (dom, attrVal, attrName) => {
        if (!attrName)
            attrName = 'val';
        dom.setAttribute(attrName, attrVal); // 设置 
    };
    // 删除DOM
    let delDom = (doms) => {
        if (!doms.forEach) {
            // 这是单个DOM的情况
            doms.parentNode.removeChild(doms);
            return;
        }
        doms.forEach((dom) => {
            dom.parentNode.removeChild(dom);
        })
    };

    // 建立cachepage实例
    // tabsDom:选项卡DOM,contDom:显示内容的DOM
    let cachePage = (tabsDom, contDom) => {
        //
        if (!tabsDom || !contDom) throw '必须传入DOM对象';
        // 缓存页对象
        let self = {};
        // 缓存器,{c_id:createDocumentFragment片断,c_id2:null},值为null的表示当前活动页,只能有一个
        let cache = {};

        //--主要方法----主要方法----主要方法----主要方法----主要方法----主要方法--//   
        // {id:页面标识,title:选项卡标题},点击左侧菜单时,调用此方法
        self.load = (pid, title) => {
            // (情形1) 如果载入的是当前活动的选项卡页,不动作
            if (cache[pid] === null) {
                console.log('type1');
                return null;
            }
            // (情形2)激活选项卡.如果pid已添加过,则到缓存中取出页面,并且激活对应选项卡.
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
                console.log('type2');
                return cacheDom;
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
            console.log('type3');
            return null;
        };


        // 新增选项卡
        let addTab = (pid, title) => {
            // 去掉当前活动的选项卡
            let activeTabDom = tabsDom.querySelector('.tabsbox-tab.active');
            if (activeTabDom) {
                activeTabDom.classList.remove('active');
            }
            let tabdom = document.createElement('label');
            tabdom.classList.add('tabsbox-tab');
            tabdom.classList.add('active');
            setAttr(tabdom, title, 'title');
            setAttr(tabdom, pid);
            tabdom.innerHTML = `${title}<a class="tabsbox-tabclose" title="关闭">×</a>`;
            // 绑定X关闭事件
            closeTab(tabdom);
            // 绑定点击事件
            selectedTab(tabdom);
            // 添加到选项卡容器
            let navDom = tabsDom.querySelector('.tabsbox-nav');
            navDom.append(tabdom);
        };
        // 切换激活选项卡.然后返回活动tab的Dom对象
        let activeTab = (pid) => {
            // 去掉当前活动的选项卡
            let activeTabDom = tabsDom.querySelector('.tabsbox-tab.active');
            if (activeTabDom) {
                activeTabDom.classList.remove('active');
            };
            // 添加pid选项卡活动样式
            let tabDom = tabsDom.querySelector(`.tabsbox-tab[val='${pid}']`);
            tabDom.classList.add('active');
            return tabDom;
        };

        // 将活动页内容DOM添加到缓存.(缓存当前页面)
        let cacheActiveTab = () => {
            // 找到cache中null值的键,将显示DIV中的所有元素添加DOM片段后,赋值
            for (let prop in cache) {
                if (cache.hasOwnProperty(prop)) {
                    if (cache[prop] === null) {
                        let docFragment = document.createDocumentFragment();
                        contDom.childNodes.forEach((item) => {
                            docFragment.append(item);
                        })
                        cache[prop] = docFragment;
                        return;
                    }
                }
            }
        };
        // 调整选项卡框的滚动条值,使用选项卡显示在合适的位置上
        // len:滚动距离,>0 : 向右滚此距离, <0 : 向左滚, 0 : 滚动到最左, 1 : 到最右,
        //              'left': 左滚固定距离, 'right': 右滚固定距离
        let scrollerTabs = (len) => {
            let navDom = tabsDom.querySelector('.tabsbox-nav');
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
            let navDom = tabsDom.querySelector('.tabsbox-nav');
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
        //--选项卡事件------选项卡事件------选项卡事件------选项卡事件------选项卡事件------选项卡事件------选项卡事件----//
        // 点击关闭选项卡
        let closeTab = (tabDom) => {
            tabDom.querySelector('.tabsbox-tabclose').onclick = (event) => {
                event.stopPropagation();
                // (情形1)关闭的是最后一个tab页,删除tab,清空缓存与
                if (Object.getOwnPropertyNames(cache).length == 1) {
                    // 删除选项卡,删除缓存,清空显示容器
                    contDom.innerHTML = '';
                    cache = {};
                    delDom(tabDom);
                    return;
                }
                // (情形2)关闭时,多于1个tab页时
                // 清除对应缓存,
                let cacheId = getAttr(tabDom);
                delete cache[cacheId];
                // 如果关闭的是活动页,将cache中最后一个id,对应的选项卡激活,对应DOM载入显示容器
                if (tabDom.classList.contains('active')) {
                    let cacheId = Object.getOwnPropertyNames(cache).pop();
                    let lastTabDom = tabsDom.querySelector(`.tabsbox-tab[val='${cacheId}']`);
                    lastTabDom.classList.add('active');
                    contDom.innerHTML = '';
                    contDom.append(cache[cacheId]);
                    cache[cacheId] = null;
                }
                // 删除tab,
                delDom(tabDom);
            };
        };
        // 点击选项卡
        let selectedTab = (tabDom) => {
            tabDom.onclick = () => {
                // 点击选项卡时,位置会相应调整,确保点击的选项卡完全显示在父级的可见区域.
                adjustPositionTab(tabDom);

                // (情形1)点击的是活动页面,退出
                if (tabDom.classList.contains('active'))
                    return;

                // (情形2)非活动页面,即切换行为
                // 缓存当前DOM
                cacheActiveTab();
                // 去掉当前活动的选项卡活动状态
                let activeTabDom = tabsDom.querySelector('.tabsbox-tab.active');
                if (activeTabDom) {
                    activeTabDom.classList.remove('active');
                }
                // 激活点击的选项卡,获取其缓存页加载到显示容器
                tabDom.classList.add('active');
                let cacheId = getAttr(tabDom);
                contDom.innerHTML = '';
                contDom.append(cache[cacheId]);
                cache[cacheId] = null;
                // console.log(cache);
            };
        };
        //--选项卡条功能事件--绑定事件--------绑定事件--------绑定事件--------绑定事件--------绑定事件--------绑定事件----// 
        // 向左滚动按钮
        tabsDom.querySelector('.tabsbox-left').onclick = () => {
            scrollerTabs('left');
        };
        // 向右滚动按钮
        tabsDom.querySelector('.tabsbox-right').onclick = () => {
            scrollerTabs('right');
        };

        // 定位当前按钮
        tabsDom.querySelector('.tabsbox-goto-active').onclick = () => {
            let activeTab = tabsDom.querySelector('.active');
            if (!activeTab) return;
            adjustPositionTab(activeTab);
        };
        // 关闭全部选项卡
        tabsDom.querySelector('.tabsbox-close-all').onclick = () => {
            // 删除选项卡,删除缓存,清空显示容器
            let navDom = tabsDom.querySelector('.tabsbox-nav');
            navDom.innerHTML = '';
            contDom.innerHTML = '';
            cache = {};
        };
        // 关闭除当前外所有选项卡
        tabsDom.querySelector('.tabsbox-close-other').onclick = () => {
            // 删除选项卡除活动的外
            let navDom = tabsDom.querySelector('.tabsbox-nav');
            let otherTabs = navDom.querySelectorAll('.tabsbox-tab:not(.active)');
            if (otherTabs) {
                otherTabs.forEach((item) => {
                    navDom.removeChild(item);
                });
            }
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