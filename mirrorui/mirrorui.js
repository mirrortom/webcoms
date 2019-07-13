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
/*====================================================================================*
 * 处理表单元素的一些辅助方法.例如文件选择框选中文件时,将文件名显示在文件框标题上,
 * 使用这些方法时,一般是绑定到表单元素的事件上,例如change,blur等事件.
 * 所有辅助方法都绑定到$ui这个对象上,调用时 $ui.fn(参数);
 *====================================================================================*/
((win) => {
    let ui = {};
    // 文件选择框选择后,将文件名显示在标签上.可绑定到input-file的onchange方法,传参this
    ui.inputFileChange = (inputfileDom) => {
        let fnlist = '';
        [].forEach.call(inputfileDom.files, (item) => {
            fnlist += item.name + ',';
            //console.dir(item);
        })
        fnlist = fnlist.substr(0, fnlist.length - 1);
        let labelDom = inputfileDom.parentNode.querySelector('.input-file-label');
        labelDom.innerHTML = fnlist;
    }
    // 清空文件选择框
    ui.clsInputFile = (inputfileDom) => {
        // 标签清空一定要先执行,然后再执行文件框清空.
        // 如果反过来执行,那么inputfileDom就会找不到对象,因为outterHTML相当于换一个input
        let labelDom = inputfileDom.parentNode.querySelector('.input-file-label');
        labelDom.innerHTML = ''; 
        inputfileDom.outerHTML = inputfileDom.outerHTML;
    }
    // 判断btn是否含有loading样式.如果没有会添加上等待样式
    ui.isBtnLoading =  (btn)=> {
        if (btn.classList.contains('loading'))
            return true;
        btn.classList.add('loading');
        return false;
    }
    // 去掉btn的loading样式.time是豪秒数,表示经过此时间后去掉loading样式
    ui.clsBtnLoading =  (btn, time)=> {
        if (time >= 0) {
            setInterval( ()=> {
                btn.classList.remove('loading');
            }, time);
        } else {
            btn.classList.remove('loading');
        }
    }
    // window上的名称
    win.$ui = ui;
})(window);
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
/**
 * 模拟系统的弹出框 alert confirm prompt
 * 显示在上中下三个位置
 * 用于理解弹出框原理
 */
((win) => {
    // 生成遮罩和弹出层,返回弹出层DOM对象
    let createMsgBox = () => {
        // 添加遮罩层
        let shadow = document.createElement('div');
        shadow.classList.add('msgbox-shadow');
        document.body.append(shadow);
        // 生成弹出框
        let msgDom = document.createElement('div');
        msgDom.classList.add('msgbox-modal');
        return msgDom;
    };
    // 显示弹出层
    let showMsgBox = (msgboxDom) => {
        document.body.style.overflow = 'hidden';
        document.body.append(msgboxDom);
    };
    // 弹出框类
    let msgBox = {};
    // 删除(关闭)遮罩和弹出层
    msgBox.close = () => {
        let body = document.body;
        let modal = body.querySelectorAll('.msgbox-modal');
        let shadow = body.querySelectorAll('.msgbox-shadow');
        modal.forEach((dom) => {
            dom.parentNode.removeChild(dom);
        });
        shadow.forEach((dom) => {
            dom.parentNode.removeChild(dom);
        });
        // 去掉body滚动条样式
        document.body.style.overflow = null;
    };
    // alert 弹出框
    // {msg:要提示的信息,字符串,[onClosed:关闭后执行方法],[style:primary,danger,success],[position:位置(top bottom)]}
    msgBox.alert = (msg, onClosed, style, position) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成新框并且加入到body直属
        let msgDom = createMsgBox();
        msgDom.innerHTML = `<div class="msgbox ${style || ''} msgbox-${position || 'center'}">${msg || ''}
        <span class="msgbox-btn msgbox-ok">Ok</span></div>`;
        // 绑定事件
        msgDom.querySelector('.msgbox-ok').onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 执行关闭事件
            if (typeof onClosed == 'function')
                onClosed();
        };
        // 显示
        showMsgBox(msgDom);
    };

    // confirm 弹出框
    // { msg: 要提示的信息, 字符串, [callback(res)]:回调函数], [style: primary, danger, success], [position: 位置(top bottom)] }
    msgBox.confirm = (msg, callback, style, position) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成新框并且加入到body直属
        let msgDom = createMsgBox();
        msgDom.innerHTML = `<div class="msgbox ${style || ''} msgbox-${position || 'center'}">${msg || ''}
        <span class="msgbox-btn msgbox-ok">Ok</span><span class="msgbox-btn msgbox-cancel">Cancel</span></div>`;
        // 绑定事件
        msgDom.querySelector('.msgbox-ok').onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 结果传回1表示点击OK
            if (typeof callback == 'function')
                callback(1);
        };
        msgDom.querySelector('.msgbox-cancel').onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 结果传回0表示点击取消
            if (typeof callback == 'function')
                callback(0);
        };
        // 显示
        showMsgBox(msgDom);
    }

    // prompt 弹出框
    // { msg: 要提示的信息, 字符串, [callback(res)]:回调函数], [style: primary, danger, success], [position: 位置(top bottom)] }
    msgBox.prompt = (msg, callback, style, position) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成新框并且加入到body直属
        let msgDom = createMsgBox();
        msgDom.innerHTML = `<div class="msgbox ${style || ''} msgbox-${position || 'center'}">${msg || ''}<input class="msgbox-input" type="text"/>
<span class="msgbox-btn msgbox-ok">Ok</span><span class="msgbox-btn msgbox-cancel">Cancel</span></div>`;
        // 绑定事件
        msgDom.querySelector('.msgbox-ok').onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 输入传回
            if (typeof callback == 'function') {
                let msg = msgDom.querySelector('.msgbox-input').value;
                callback(msg);
            }
        };
        msgDom.querySelector('.msgbox-cancel').onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 输入传回空字符串
            if (typeof callback == 'function')
                callback('');
        };
        // 显示
        showMsgBox(msgDom);
    };

    // 弹出自定义HTML片段
    // {msgboxhtml:自定义弹出层html片段,[onBefore:显示前执行],[onshow:显示后执行]}
    msgBox.show = (msgboxhtml, onBefore, onShow) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成新框并且加入到body直属
        let msgDom = createMsgBox();
        msgDom.innerHTML = msgboxhtml;
        //
        if (typeof onBefore == 'function')
            onBefore();
        // 显示
        showMsgBox(msgDom);
        //
        if (typeof onShow == 'function')
            onBefore();
    };

    // 引用名称可在此修改
    win.msgbox = msgBox;
})(window);
/*
必须参数:{domId:'容器DOM的id',totalData:'总数',pageIndex:'当前页码',pageSize:'每页数量',pageClickE:'页码点击方法'}
当总数大于0时,才需要调用分页条
*/
((win) => {
    //----帮助函数----帮助函数----帮助函数---帮助函数---------------------------------------------------- //
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
    //------------------------------------------------------------------------------------------------//
    let pageNum = (config) => {
        // 分页条容器DOM对象
        let pnDom = document.getElementById(config.domId);
        // 配置对象
        let cfg = {};

        // 1配置设定
        let initcfg = () => {
            // 当前页码
            cfg.PageIndex = config.pageIndex || 1;
            // 每页数量[5-50]
            cfg.PageSize = (config.pageSize > 4 && config.pageSize < 51) ? config.pageSize : 10;
            // 数据总数
            cfg.TotalData = config.totalData || 0;
            // 总页数
            cfg.TotalPage = getTotalPage();
            // 分页按钮个数[5-10].
            cfg.TotalBtn = (config.totalBtn > 4 && config.totalBtn < 11) ? config.totalBtn : 5;
            // 页码点击事件方法
            cfg.pageClickE = config.pageClickE;
        };

        // 2主要方法:更新分页条数据,绑定相关事件
        let newPageNum = () => {
            // 清空DOM,重新生成分页组件DOM,绑定事件
            pnDom.innerHTML = '';
            // 1.页码按钮区域
            let btnsarea = document.createElement('span');
            btnsarea.classList.add('pagenum-btns');
            pnDom.append(btnsarea);
            // 2.跳转按钮区域
            let btnskip = document.createElement('span');
            btnskip.classList.add('pagenum-skip');
            btnskip.innerHTML = `共<b class="pagenum-total">${cfg.TotalPage}</b>页&nbsp;&nbsp;到第<input class="pagenum-input" />页<a class="pagenum-ok">确定</a>`;
            pnDom.append(btnskip);

            // 计算页码起止
            pagenumRange();
            //console.log(cfg);
            /*-------------------------------------------------------*
             * 添加按钮DOM
             * 页码区固定按钮4个:前一页,第1页和第末页,后一页.
             *-------------------------------------------------------*/
            let btndom = '';

            // 向前按钮
            btndom += `<a class="pagenum-prev" pagenum="${cfg.PageIndex - 1}"><</a>`;
            // 第1页按钮,当起始页码大于1时添加
            if (cfg.StartIndex > 1) {
                let isactiveNum = cfg.PageIndex == 1 ? 'active' : 'num';
                btndom += `<a class="pagenum-${isactiveNum}" pagenum="1">1</a>`;
            }

            // 前省略号,当起始页码大于2时添加
            if (cfg.StartIndex > 2) {
                btndom += '<span class="pagenum-break">...</span>';
            }
            // 页码按钮
            for (let i = cfg.StartIndex; i <= cfg.EndIndex; i++) {
                let pagenum = i;
                let isactiveNum = pagenum == cfg.PageIndex ? 'active' : 'num';
                btndom += `<a class="pagenum-${isactiveNum}" pagenum="${pagenum}">${pagenum}</a>`;
            }
            // 后省略号,当结束页小于最大页码-1时
            if (cfg.EndIndex < (cfg.TotalPage - 1)) {
                btndom += '<span class="pagenum-break">...</span>';
            }
            // 末页按钮,当结束页小于最大页码时添加
            if (cfg.EndIndex < cfg.TotalPage) {
                let isactiveNum = cfg.PageIndex == cfg.TotalPage ? 'active' : 'num';
                btndom += `<a class="pagenum-${isactiveNum}" pagenum="${cfg.TotalPage}">${cfg.TotalPage}</a>`;
            }

            // 向后按钮
            btndom += `<a class="pagenum-next" pagenum="${cfg.PageIndex + 1}">></a>`;

            // 将btndom添加到页码按钮区域容器
            btnsarea.innerHTML = btndom;

            // 绑定所有按钮事件
            bindEventForAllBtn();
        };

        //--辅助方法---------------------------------------------------------------------------------//
        // 计算起始页码位置:以当前页码为中间位置,根据需要显示的页码按钮个数,计算当前页码之前和之后的页码数.
        // 当前页码在正中,如果显示按钮个数为偶数,则偏左.例如: "2 3 (4:当前页码在此) 5 6 7"
        let pagenumRange = () => {
            let startIndex = cfg.PageIndex - parseInt(cfg.TotalBtn / 2) +
                (cfg.TotalBtn % 2 == 0 ? 1 : 0);
            let endIndex = cfg.PageIndex + parseInt(cfg.TotalBtn / 2);

            // 起始页小于1,说明当前页码位于正中时,前面页码数不够了.应将第1页为起始页码,而结束页码也应该重新计算
            if (startIndex < 1) {
                startIndex = 1;
                // 根据要显示的页码数计算结束页码,如果算出页码数大于总页码,则以总页码数为结束页码
                endIndex = endIndex > cfg.TotalPage ? cfg.TotalPage : cfg.TotalBtn;
            }
            // 结束页码大于总页码,说明当前页码位于正中时,后面的页码数不够.应将总页码数为终止页码,起始页码应重新计算
            if (endIndex > cfg.TotalPage) {
                endIndex = cfg.TotalPage;
                // 根据要显示的页码数计算起始页码,如果算出小于1,则以1为起始页码
                startIndex = endIndex - cfg.TotalBtn + 1;
                if (startIndex < 1)
                    startIndex = 1;
            }
            cfg.StartIndex = startIndex;
            cfg.EndIndex = endIndex;
        };

        // 总页数(由数量总数和分页大小算出)
        let getTotalPage = () => {
            if (cfg.TotalData >= 0 && cfg.PageSize >= 5 &&
                cfg.PageIndex >= 1) {
                let pagecount = parseInt(cfg.TotalData / cfg.PageSize);
                let pagecountM = cfg.TotalData % cfg.PageSize;
                return pagecountM > 0 ? pagecount + 1 : pagecount;
            }
            return 0;
        };
        /*====================*
         * 事件绑定 
         *====================*/
        let bindEventForAllBtn = () => {
            // 页码按钮点击
            pnDom.querySelectorAll('.pagenum-prev,.pagenum-next,.pagenum-first,.pagenum-last,.pagenum-num').forEach((item) => {
                item.onclick = () => {
                    // 页码参数范围[1-总页码],范围外不动作
                    let pnnum = parseInt(getAttr(item, 'pagenum')) || 0;
                    if (pnnum < 1 || pnnum > cfg.TotalPage) return;
                    cfg.pageClickE(pnnum);
                };
            });

            // 确定按钮点击
            pnDom.querySelector('.pagenum-ok').onclick = () => {
                let pnnum = parseInt(pnDom.querySelector('.pagenum-input').value || 0);
                if (pnnum < 1 || pnnum > cfg.TotalPage) return;
                cfg.pageClickE(pnnum);
            };
        };
        // 调用
        initcfg();
        newPageNum();
    };
    // window对象名字
    win.pagenum = pageNum;
})(window);
/*
日期组件,是一个函数.
在input上使用此方法. <input onclick="MyDatePick()" />,需要时间部分: MyDatePick({fmt:datetime})
 */
((win) => {
    //--------------帮助函数-----------帮助函数--------------//
    // 时间格式化函数
    let datefmt = (date, fmtstr) => {
        let format = fmtstr || 'yyyy/MM/dd HH:mm:ss';
        let json = {};
        // 替换时,先替换名字较长的属性,以避免如yyyy被分成两次yy替换,造成错误.故长名字属性在前.
        json.yyyy = date.getFullYear();
        json.yy = json.yyyy.toString().substr(2);
        //
        let m = date.getMonth() + 1;
        json.MM = m > 9 ? m : '0' + m;
        json.M = m;
        //
        let d = date.getDate();
        json.dd = d > 9 ? d : '0' + d;
        json.d = d;
        //
        let h = date.getHours();
        json.HH = h > 9 ? h : '0' + h;
        json.H = h;
        //
        let mi = date.getMinutes();
        json.mm = mi > 9 ? mi : '0' + mi;
        json.m = mi;
        //
        let s = date.getSeconds();
        json.ss = s > 9 ? s : '0' + s;
        json.s = s;
        for (let item in json) {
            format = format.replace(item, json[item]);
        }
        return format;
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

    //------datebox类-----------datebox类---------//
    // datebox类名
    let dateboxCls = 'date-box';
    // 触发日期框的INPUT的DOM对象引用
    let inputDOM = null;
    // 日期框DOM对象
    let dateboxDom = null;
    // 日期框配置对象
    let cfg = null;

    // 在input上使用此方法. <input onclick="MyDatePick()" />,需要时间部分: MyDatePick({fmt:datetime})
    let mydate = (config) => {
        let event = window.event || arguments.callee.caller.arguments[0]; // 获取event对象
        event.stopPropagation();
        let input = event.currentTarget;
        // 初始化已选年月日
        initDate(input, config);
        // 生成DOM
        dateboxDom = createDom();
        // 显示
        showDateBox(dateboxDom);
        // 绑定事件
        bindEvent_Show();
    };

    // 初始化:已选年月,保存日期框的INPUT的JQ对象引用
    let initDate = (input, config) => {
        // input的JQ对象
        inputDOM = input;

        // 用inpupt的值初始化时间,为空则默认今天时间.input时间格式只支持 yyyy/MM/dd HH:mm:ss(时间,秒部分可省略)
        let inputval = input.value.trim();
        if (/^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$/.test(inputval)) {
            inputval = inputval + ' 00:00:00';
        } else if (/^[0-9]{4}\/[0-9]{2}\/[0-9]{2} [0-9]{2}:[0-9]{2}$/.test(inputval)) {
            inputval = inputval + ':00';
        } else if (/^[0-9]{4}\/[0-9]{2}\/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(inputval)) {} else {
            inputval = null;
        }
        // console.log(inputval);
        // 不带时间部分的日期串,用parse解后,会有时差.
        let inputDate = Date.parse(inputval);
        let date = isNaN(inputDate) ? new Date((new Date()).setHours(0, 0, 0)) : new Date(inputDate);
        //
        //console.log(date);
        cfg = {};
        cfg.year = date.getFullYear();
        cfg.month = date.getMonth();
        cfg.day = date.getDate();
        cfg.hour = date.getHours();
        cfg.minute = date.getMinutes();
        cfg.second = date.getSeconds();
        // 显示格式为日期('yyyy-MM-dd'),或者日期和时间('yyyy-MM-dd HH:mm:ss')
        cfg.dateFmt = 'yyyy/MM/dd';
        cfg.fmtType = 1;
        if (config && config.fmt == 'datetime') {
            cfg.dateFmt = 'yyyy/MM/dd HH:mm:ss';
            cfg.fmtType = 2;
        }
    };
    // 显示日期框
    let showDateBox = (datedom) => {
        //console.log(datedom);
        // 根据input框的位置显示日期DOM框
        let thisleft = inputDOM.offsetLeft + 'px';
        let thistop = inputDOM.offsetTop + inputDOM.offsetHeight + 'px';
        // 576px以下屏(手机屏) 显示在屏幕中央(css媒体查询设为固定定位了)
        let ww = win.innerHeight;
        if (ww < 576) {
            thisleft = 0;
            thistop = '25vh';
        }

        // 清除可能已有的日期框
        let olddom = document.body.querySelectorAll('.' + dateboxCls);
        delDom(olddom);
        // 显示新的日期框
        datedom.style.left = thisleft;
        datedom.style.top = thistop;
        document.body.append(datedom);

        // 576以上屏,input框要能手动输入,焦点在input框.在手机上使用选择,不使用手输,焦点在日期控件上.
        if (ww < 576) {
            datedom.focus();
        }
    };
    /*=======================================================*
     * DOM生成
     *=======================================================*/
    // 生成整个日期框的DOM.并返回
    let createDom = () => {
        let ymtarea = `<div class="date-area-ymt">${createDom_Year()}${createDom_Month()}${createDom_Today()}</div>`;

        let weekarea = `<div class="date-area-week">${createDom_Week()}</div>`;

        let dayarea = `<div class="date-area-day">${createDom_Day()}</div>`;

        // 时间区域
        let tcarea = '';
        if (cfg.fmtType == 2) {
            tcarea = `<div class="date-area-tc">${createDom_Time()}${createDom_Clear()}${createDom_Ok()}</div>`;
        }
        let datedom = document.createElement('div');
        datedom.classList.add('date-box');
        datedom.tabIndex = -1;
        datedom.innerHTML = `${ymtarea}${weekarea}${dayarea}${tcarea}`;
        return datedom;
    };

    // 1.生成年份区内容 前进,后退,年份 按钮
    let createDom_Year = () => {
        let prevbtn = '<a class="date-btn-prev">&lt;</a>';
        let yearbtn = `<b class="date-btn-year" val="${cfg.year}">${cfg.year}年</b>`;
        let nextbtn = '<a class="date-btn-next">&gt;</a>';
        return `<div class="date-area-year">${prevbtn}${yearbtn}${nextbtn}</div>`;
    };

    // 1.1生成年份下拉选择框. selectedYear:可指定一个年份为已选定
    let createDom_YearSelect = (selectedYear) => {
        let ydoms = '';
        let ylist = domYear_Data();
        if (!selectedYear)
            selectedYear = (new Date()).getFullYear();
        for (let i = 0; i < ylist.length; i++) {
            let isselect = ylist[i] == selectedYear ? "selected" : ""
            ydoms += `<b class="date-option-year ${isselect}" val="${ylist[i]}">${ylist[i]}</b>`;
        }
        let dom = document.createElement('div');
        dom.classList.add('date-select-year');
        dom.innerHTML = ydoms;
        return dom;
    };

    // 2.生成月份区 前进,后退,月份 按钮
    let createDom_Month = () => {
        let prevbtn = '<a class="date-btn-prev">&lt;</a>';
        let monthbtn = `<b class="date-btn-month" val="${cfg.month}">${cfg.month + 1}月</b>`;
        let nextbtn = '<a class="date-btn-next">&gt;</a>';
        return `<div class="date-area-month">${prevbtn}${monthbtn}${nextbtn}</div>`;
    };

    // 2.1生成月份下拉选择框. selectedMonth:可指定一个月份为已选定
    let createDom_MonthSelect = (selectedMonth) => {
        let mdoms = '';
        for (let i = 0; i < 12; i++) {
            let isselect = selectedMonth == i ? "selected" : "";
            mdoms += `<b class="date-option-month ${isselect}" val="${i}">${i + 1}</b>`;
        }
        let dom = document.createElement('div');
        dom.classList.add('date-select-month');
        dom.innerHTML = mdoms;
        return dom;
    };

    // 3.生成星期标题头
    let createDom_Week = () => {
        let weeksdom = '';
        let weeks = ['日', '一', '二', '三', '四', '五', '六'];
        for (let i = 0; i < weeks.length; i++) {
            let isweekend = (i == 0 || i == 6) ? 'date-item-weekend' : '';
            weeksdom += `<b class="date-item-week ${isweekend}">${weeks[i]}</b>`;
        }
        return weeksdom;
    };

    // 4.生成天选项 daylist:日数据.不传则使用选定年月计算出日
    let createDom_Day = (daylist) => {
        let data = daylist || domDay_Data();
        let daydoms = '';
        for (var i = 0; i < data.length; i++) {
            let json = data[i];
            let daydom = '<b class="date-item-day${istoday}${isdayinmonth}${isselected}${isweekend}" year="${yyyy}" month="${MM}" day="${dd}">${dd}</b>';
            json.istoday = json.Istoday ? ' date-item-today' : '';
            json.isselected = json.Isselected ? ' selected' : '';
            json.isdayinmonth = json.Isdayinmonth ? '' : ' date-item-dayoutmonth';
            json.isweekend = json.Isweekend ? ' date-item-weekend' : '';
            //json.exportName = exportName;
            //daydoms += String.DataBind(daydom, json);
            daydoms += daydom.replace(/\${(.+?)\}/g, function(m, key) { return json.hasOwnProperty(key) ? json[key] : '' });
        }
        return daydoms;
    };
    // 5.生成时分秒区域
    let createDom_Time = () => {
        let hour = `<b class="date-btn-time date-btn-hour">${cfg.hour}</b>:`;
        let minute = `<b class="date-btn-time date-btn-minute">${cfg.minute}</b>:`;
        let second = `<b class="date-btn-time date-btn-second">${cfg.second}</b>`;
        return `<div class="date-area-time">${hour}${minute}${second}</div>`;
    };
    // 5.1生成小时选择框
    let createDom_HourSelect = () => {
        let doms = '';
        for (let i = 0; i < 24; i++) {
            doms += `<b class="date-option-hour" val="${i}">${i}</b>`;
        }
        let dom = document.createElement('div');
        dom.classList.add('date-select-hour');
        dom.innerHTML = doms;
        return dom;
    };
    // 5.2生成分钟,秒钟选择框
    let createDom_MinuteSelect = () => {
        let doms = '';
        for (let i = 0; i < 60; i++) {
            doms += `<b class="date-option-minute" val="${i}">${i}</b>`;
        }
        let dom = document.createElement('div');
        dom.classList.add('date-select-minute');
        dom.innerHTML = doms;
        return dom;
    };
    // 5.3生成秒钟选择框
    let createDom_SecondSelect = () => {
        let doms = '';
        for (let i = 0; i < 60; i++) {
            doms += `<b class="date-option-second" val="${i}">${i}</b>`;
        }
        let dom = document.createElement('div');
        dom.classList.add('date-select-second');
        dom.innerHTML = doms;
        return dom;
    };
    // 6.生成今天按钮区域
    let createDom_Today = () => {
        return '<div class="date-area-today"><a class="date-btn-today">今天</a></div>';
    };
    // 7.生成清除按钮区域
    let createDom_Clear = () => {
        return '<div class="date-area-clear"><a class="date-btn-clear">清空</a></div>';
    };
    // 8.生成确定按钮区域 
    let createDom_Ok = () => {
        return '<div class="date-area-ok"><a class="date-btn-ok">确定</a></div>';
    };

    // 根据选定的年,月刷新日(用于当在日期框上操作年,月等会改变年月的动作时)
    // yyyy:指定年,mm:指定月 daysdom:日的父级DOM的JQ对象(.daysrows)
    let resetDaysDom = (yyyy, mm) => {
        // 计算出指定年月的日数据
        let dayslist = domDay_Data(yyyy, mm);
        // 生成天DOM
        let daysdom = createDom_Day(dayslist);
        // 更新天DOM
        dateboxDom.querySelector('.date-area-day').innerHTML = daysdom;
        // 事件绑定
        bindEvent_DaySelected();
    };

    /*----------------为DOM提供的数据,年份 日-----------为DOM提供的数据,年份 日-------- */
    // 根据已选年计算年份选项
    let domYear_Data = () => {
        // 年份选择范围固定在[1900-2100]
        let data = [];
        for (let i = 1900; i < 2101; i++) {
            data.push(i);
        }
        return data;
    };

    // 根据已选年月或者传入指定年月,计算日的起始和结束
    // 日(天)总共六行七列42个,含已选年月所有日, 前推至最近的周日, 后推至最近或次近的周六
    let domDay_Data = (yyyy, mm) => {
        // 指定年 超范围则设为当天年
        let seledY = parseInt(yyyy) || cfg.year;
        // 指定月 超范围设为当天月
        let seledM = parseInt(mm) || cfg.month;

        // 指定年月的起止日(1~xx号)
        let startDay = new Date(seledY, seledM, 1);
        //let endDay = new Date(seledY, seledM + 1, 0);

        // 日期起点为指定年月的1号前推到最近的周日,终点为该月最后一天后推到最近的周六
        startDay.setDate(1 - startDay.getDay());
        //endDay.setDate(endDay.getDate() + (6 - endDay.getDay()));
        // 当天日期
        let todaystr = datefmt(new Date(), 'yyyyMMdd');
        let daylist = [];
        for (let i = 0; i < 42; i++) {
            let json = {};
            json.yyyy = startDay.getFullYear();
            json.MM = startDay.getMonth();
            json.dd = startDay.getDate();
            // 日是否属于指定年月中的日
            json.Isdayinmonth = json.MM == seledM;
            // 日是否为今天 
            json.Istoday = datefmt(startDay, 'yyyyMMdd') == todaystr;
            // 日是否选定(等于文本框中已选日)
            json.Isselected =
                (json.yyyy == cfg.year && json.MM == cfg.month &&
                    json.dd == cfg.day);
            // 这天是否为周六日(这里未真正判断,而是根据位置判断,每七天为一行,行首周日行尾周六)
            json.Isweekend = (i % 7 == 0 || (i + 1) % 7 == 0);
            //
            startDay.setDate(json.dd + 1);
            daylist.push(json);
        }
        //console.log(daylist);
        return daylist;
    };

    /*============================================================*
     * 事件方法:年,月的前进后退按钮,年月选择按钮,今天按钮
     *============================================================*/
    // 控件显示后,要绑定控件的基础事件.
    let bindEvent_Show = () => {
        bindEvent_DateBox();
        bindEvent_YearBtn();
        bindEvent_MonthBtn();
        bindEvent_YearMonthPrevNext();
        bindEvent_TodayBtn();

        bindEvent_DaySelected();
        // 小时,分钟,秒,取消,确定,按钮在有时分秒格式时才有
        if (cfg.fmtType == 2) {
            bindEvent_HourBtn();
            bindEvent_MinBtn();
            bindEvent_SecBtn();
            bindEvent_ClearBtn();
            bindEvent_OkBtn();
        }
    };

    let bindEvent_DateBox = () => {
        // 点击日期控件以内区域,阻止冒泡到根
        dateboxDom.onclick = (event) => {
            event.stopPropagation();
            // 点击空白位置时,关闭已经打开的年,月,日,时,分,秒的选择框.需要在子元素上取消冒泡
            let partSelectDom = dateboxDom.querySelectorAll('[class^=date-select]');
            delDom(partSelectDom);
        };
    };
    let bindEvent_YearBtn = () => {
        // 点击年按钮 显示年选择框
        dateboxDom.querySelector('.date-btn-year').onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let seledY = getAttr(thisobj);
            // 年份选择框 .date-select-year
            let yearopsbox = thisobj.parentElement.querySelector('.date-select-year');
            // 如果已经显示则关闭
            if (yearopsbox) {
                delDom(yearopsbox);
                return;
            }
            // 先关闭其它弹出窗
            let otherDoms = dateboxDom.querySelectorAll('[class^=date-select]');
            delDom(otherDoms);
            // 生成年份选择框,填充到年份选择框中
            let yearSelectDom = createDom_YearSelect(seledY);
            thisobj.parentElement.append(yearSelectDom);
            // 定位已选年份到滚动框的中间(视口可见范围内)
            let yseled = yearSelectDom.querySelector('.selected');

            // 计算这个年份选项离父框的TOP值,然后滚动条滚动这个值-父框高/2
            let scrollval = yseled.offsetTop - yearSelectDom.clientHeight / 2;
            yearSelectDom.scrollTo(0, scrollval);
            // 绑定年份选择点击事件
            bindEvent_YearSelected();
        };
    };
    let bindEvent_MonthBtn = () => {
        // 点击月按钮 显示月选择框
        dateboxDom.querySelector('.date-btn-month').onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let seledM = getAttr(thisobj);
            let monthsops = thisobj.parentElement.querySelector('.date-select-month');
            // 如果已经显示则关闭
            if (monthsops) {
                delDom(monthsops);
                return;
            }
            // 先关闭其它弹出窗
            let otherDoms = dateboxDom.querySelectorAll('[class^=date-select]');
            delDom(otherDoms);
            //
            thisobj.parentElement.append(createDom_MonthSelect(seledM));
            // 绑定月分选项点击事件
            bindEvent_MonthSelected();
        };
    };
    let bindEvent_YearSelected = () => {
        // 点击年份选项 选定一个年份 
        dateboxDom.querySelectorAll('.date-option-year').forEach((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                // 
                // 所选年份值
                let y = getAttr(thisobj);
                // 更新年份按钮显示值
                let yearBtn = dateboxDom.querySelector('.date-btn-year');
                setAttr(yearBtn, y);
                yearBtn.innerHTML = y + '年';
                // 关闭年份选择框
                delDom(thisobj.parentElement)
                    // 刷新 日
                let m = getAttr(dateboxDom.querySelector('.date-btn-month'));
                resetDaysDom(y, m);
            };
        });
    };
    let bindEvent_MonthSelected = () => {
        // 点击月份选项 选定一个月份
        dateboxDom.querySelectorAll('.date-option-month').forEach((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                // 
                // 所选月份值
                let m = parseInt(getAttr(thisobj));
                let monthBtn = dateboxDom.querySelector('.date-btn-month');
                setAttr(monthBtn, m);
                monthBtn.innerHTML = (m + 1) + '月';
                // 关闭月份选择框
                delDom(thisobj.parentElement);
                // 刷新 日
                let y = getAttr(dateboxDom.querySelector('.date-btn-year'));
                resetDaysDom(y, m);
            };
        });
    };
    let bindEvent_YearMonthPrevNext = () => {
        // 点击年份,月份的前进和后退按钮 btntype:1=年按钮,2=月按钮. dir:1=前进,2=后退
        dateboxDom.querySelectorAll('.date-btn-prev,.date-btn-next').forEach((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let btntype = thisobj.parentElement.classList.contains('date-area-year') ? 1 : 2;
                let dir = thisobj.classList.contains('date-btn-next') ? 1 : 2;
                //
                let ybtn = dateboxDom.querySelector('.date-btn-year');
                let mbtn = dateboxDom.querySelector('.date-btn-month');
                let y = parseInt(getAttr(ybtn));
                let m = parseInt(getAttr(mbtn));
                // 计算并刷新年或月按钮值 年份前进后退值[1-9999]
                if (btntype == 1) {
                    y = dir == 1 ? y + 1 : y - 1;
                    if (y < 1) y = 9999;
                    else if (y > 9999) y = 1;
                } else if (btntype == 2) {
                    m = dir == 1 ? m + 1 : m - 1;
                    if (m < 0) {
                        m = 11;
                        // 年往后退一年,如果为1年,则不变
                        if (y > 1)
                            y = y - 1;
                    } else if (m > 11) {
                        m = 0;
                        // 年往前进一年,如果为9999年,则不变
                        if (y < 9999)
                            y = y + 1;
                    }
                }
                setAttr(ybtn, y);
                ybtn.innerHTML = y + '年';
                setAttr(mbtn, m);
                mbtn.innerHTML = (m + 1) + '月';
                // 刷新日
                //console.log(y+'----'+m);
                resetDaysDom(y, m);
            };
        });
    };
    let bindEvent_TodayBtn = () => {
        // 点击今天按钮 设置今天日期到input框
        dateboxDom.querySelector('.date-btn-today').onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let today = new Date(new Date().toLocaleDateString());
            inputDOM.value = datefmt(today, cfg.dateFmt);
            //
            mydate.close();
        };
    };
    let bindEvent_HourBtn = () => {
        // 点击小时按钮 显示小时选择框
        dateboxDom.querySelector('.date-btn-hour').onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let hourselecct = thisobj.parentElement.querySelector('.date-select-hour');
            // 点击小时按钮时,弹出小时选择框,同时,按钮加上打开样式,以表示当前选择的是小时
            // 添加样式时,先取消其按钮的打开样式,打开后,再给自己加上打开样式
            let otherBtns = thisobj.parentElement.querySelectorAll('.date-btn-time');
            otherBtns.forEach((item) => { item.classList.remove('open') });
            // 如果已经是打开状态则关闭
            if (hourselecct) {
                delDom(hourselecct);
                return;
            }
            // 先关闭其它弹出窗
            let otherdoms = dateboxDom.querySelectorAll('[class^=date-select]');
            delDom(otherdoms);
            // 显示小时选择框
            thisobj.parentElement.append(createDom_HourSelect());
            thisobj.classList.add('open');
            // 绑定小时选项点击事件
            bindEvent_HourSelected();
        };
    };
    let bindEvent_MinBtn = () => {
        // 点击分钟按钮 显示分钟选择框
        dateboxDom.querySelector('.date-btn-minute').onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let minselecct = thisobj.parentElement.querySelector('.date-select-minute');
            // 点击时分秒下拉框按钮时,先取消其按钮的打开样式,打开后,再给自己加上打开样式
            let otherBtns = thisobj.parentElement.querySelectorAll('.date-btn-time');
            otherBtns.forEach((item) => { item.classList.remove('open') });

            // 如果已经显示则关闭
            if (minselecct) {
                delDom(minselecct);
                return;
            }
            // 先关闭其它弹出窗
            let otherdoms = dateboxDom.querySelectorAll('[class^=date-select]');
            delDom(otherdoms);
            thisobj.parentElement.append(createDom_MinuteSelect());
            thisobj.classList.add('open');
            // 绑定分钟选项点击事件
            bindEvent_MinSelected();
        };
    };
    let bindEvent_SecBtn = () => {
        // 点击秒钟按钮 显示秒钟选择框
        dateboxDom.querySelector('.date-btn-second').onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let secselecct = thisobj.parentElement.querySelector('.date-select-second');
            // 点击时分秒下拉框按钮时,先取消其按钮的打开样式,打开后,再给自己加上打开样式
            let otherBtns = thisobj.parentElement.querySelectorAll('.date-btn-time');
            otherBtns.forEach((item) => { item.classList.remove('open') });
            // 如果已经显示则关闭
            if (secselecct) {
                delDom(secselecct);
                return;
            }
            // 先关闭其它弹出窗
            let otherdoms = dateboxDom.querySelectorAll('[class^=date-select]');
            delDom(otherdoms);
            thisobj.parentElement.append(createDom_SecondSelect());
            thisobj.classList.add('open');
            // 绑定秒钟选项点击事件
            bindEvent_SecSelected();
        }
    };
    let bindEvent_HourSelected = () => {
        // 选择小时 修改小时按钮显示值
        dateboxDom.querySelectorAll('.date-option-hour').forEach((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let h = getAttr(thisobj);
                let btnHour = dateboxDom.querySelector('.date-btn-hour');
                btnHour.innerHTML = h;
                cfg.hour = h;
                //
                delDom(thisobj.parentElement);
            };
        });
    };
    let bindEvent_MinSelected = () => {
        // 选择分钟 修改按钮显示值
        dateboxDom.querySelectorAll('.date-option-minute').forEach((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let m = getAttr(thisobj);
                dateboxDom.querySelector('.date-btn-minute').innerHTML = m;
                cfg.minute = m;
                //
                delDom(thisobj.parentElement);
            };
        })
    };
    let bindEvent_SecSelected = () => {
        // 选择秒钟 修改按钮显示值
        dateboxDom.querySelectorAll('.date-option-second').forEach((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let s = getAttr(thisobj);
                dateboxDom.querySelector('.date-btn-second').innerHTML = s;
                cfg.second = s;
                //
                delDom(thisobj.parentElement);
            };
        })
    };
    let bindEvent_DaySelected = () => {
        // 选择天 设置这天日期到Input框
        dateboxDom.querySelectorAll('.date-item-day').forEach((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let date = new Date(getAttr(thisobj, 'year'), getAttr(thisobj, 'month'), getAttr(thisobj, 'day'), cfg.hour, cfg.minute, cfg.second);
                inputDOM.value = datefmt(date, cfg.dateFmt);
                //
                mydate.close();
            };
        });
    };
    let bindEvent_ClearBtn = () => {
        // 点击清空
        dateboxDom.querySelector('.date-btn-clear').onclick = (event) => {
            event.stopPropagation();
            // let thisobj = event.currentTarget;
            //
            inputDOM.value = '';
            mydate.close();
        };
    };
    let bindEvent_OkBtn = () => {
        // 点击确定按钮
        dateboxDom.querySelector('.date-btn-ok').onclick = (event) => {
            event.stopPropagation();
            // let thisobj = event.currentTarget;
            //
            // 找到选中的日 设置到Input框 如果没有选中的日,使用当前设置日期
            let seledDay = dateboxDom.querySelector('.date-item-day.selected');
            let dateStr = datefmt(new Date(cfg.year, cfg.month, cfg.day, cfg.hour, cfg.minute, cfg.second), cfg.dateFmt);
            if (seledDay) {
                let d = new Date(getAttr(seledDay, 'year'), getAttr(seledDay, 'month'), getAttr(seledDay, 'day'), cfg.hour, cfg.minute, cfg.second);
                dateStr = datefmt(d, cfg.dateFmt);
            }

            inputDOM.value = dateStr;
            //
            mydate.close();
        }
    };

    // 关闭日期框
    mydate.close = () => {
        dateboxDom = null;
        inputDOM = null;
        cfg = null;
        let datedoms = document.body.querySelectorAll('.' + dateboxCls);
        delDom(datedoms);
    };

    // 点击日期控件以外区域,关闭控件. 
    document.onclick = () => {
        mydate.close();
    };
    // 日期函数名,可在引修改
    win.MyDatePick = mydate;
})(window);
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