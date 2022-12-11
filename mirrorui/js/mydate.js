// =======================================
// 日期组件, 是一个函数.在input上使用此方法.
//  <input onclick="myDatePick()" />
//  时间部分: myDatePick({ fmt: datetime })
// =======================================
((win) => {
    // 最大最小年份
    const maxyear = 2100;
    const minyear = 1900;
    // dom操作帮助函数
    const $ = win.ns.domHelp;
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

    // 样式名字统一取值
    // 1.按行列位置2.按功能名字3.按名字
    let cls = {
        box: 'date-box',// 容器
        row0: 'date-row-ymt',// 第一行 年月 进退 今天
        col00: 'date-col-ym',// 年月
        col01: 'date-col-prev',// 退
        col02: 'date-col-next',// 进
        col03: 'date-col-today',// 今天
        row1: 'date-row-week',// 第二行 星期
        col1: 'date-col-week',// 星期
        weekend: 'date-weekend',// 周六日
        row2: 'date-row-day',// 3行 日
        col2: 'date-col-day',// 日
        dayout: 'date-dayout',// 日,在选定月以外
        today: 'date-today',// 日 当天
        row3: 'date-row-time',// 时分秒 清除 确定
        col30: 'date-col-clear',// 清除
        col31: 'date-col-time',// 时分秒
        col32: 'date-col-ok',// 确定
        opsym: 'date-ops-ym',// 年月选框
        opsyear: 'date-ops-year',// 年选框
        opsmonth: 'date-ops-month',// 月选框
        opyear: 'date-op-year',// 年选项
        opmonth: 'date-op-month',// 月选项
        opstime: 'date-ops-time',// 时分秒选框
        opshour: 'date-ops-hour',// 时选框
        opsplus: 'date-ops-plus',// 分秒加减框
        ophour: 'date-op-hour',// 时选项
        opam: 'date-op-am',// 上午
        oppm: 'date-op-pm',// 下午
        opplus: 'date-op-plus',// 分秒加减
        selected: 'date-selected',// 已选定
        open: 'date-open',// 按钮打开了选框时(年月框/时间框)
        startOps: '[class^=date-ops]'// css选择器,匹配date-ops开头的
    };
    // 触发日期框的INPUT的DOM对象引用
    let inputDOM = null;
    // 日期框DOM对象
    let dateboxDom = null;
    // 日期框配置对象
    let cfg = null;

    /*=======================================================*
     * mydate 函数,重要方法
     *=======================================================*/
    // 在input上使用此方法(主要方法). <input onclick="MyDatePick()" />,需要时间部分: MyDatePick({fmt:datetime})
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

        // 用inpupt的值初始化时间.input时间格式只支持 yyyy/MM/dd HH:mm:ss(时间部分,秒部分可省略)
        let inputval = input.value.trim();
        if (/^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$/.test(inputval)) {
            inputval = inputval + ' 00:00:00';
        } else if (/^[0-9]{4}\/[0-9]{2}\/[0-9]{2} [0-9]{2}:[0-9]{2}$/.test(inputval)) {
            inputval = inputval + ':00';
        } else if (/^[0-9]{4}\/[0-9]{2}\/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(inputval)) {
            true;
        } else {
            inputval = null;
        }
        // console.log(inputval);
        // 不带时间部分的日期串,用parse解后,会有时差.
        let inputDate = Date.parse(inputval);
        // 如果input值无或无效,设为现在时间,但时分秒部分为0.
        let date = isNaN(inputDate) ? new Date((new Date()).setHours(0, 0, 0)) : new Date(inputDate);
        //
        //console.log(date);
        // cfg记录日期格式和时间值
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
        // 576px以下屏(手机屏) 显示在屏幕中央(css媒体查询设置了固定定位)
        let ww = win.innerWidth;

        // 桌面版定位到input框的位置,对齐它左边
        if (ww > 576) {
            datedom.style.left = inputDOM.offsetLeft + 'px';
            datedom.style.top = inputDOM.offsetTop + inputDOM.offsetHeight + 'px';
        }

        // 清除可能已有的日期框
        $(document.body).find('.' + cls.box).remove();

        // 显示新的日期框(加入为body子级)
        document.body.append(datedom);

        // 576以上屏,input框要能手动输入,焦点在input框.在手机上使用选择,不使用手输,焦点在日期控件上.
        if (ww < 576) {
            datedom.focus();
        }
    };

    // 销毁日期框
    let closeDateBox = () => {
        dateboxDom = null;
        inputDOM = null;
        cfg = null;
        $(document.body).find('.' + cls.box).remove();
    }

    /*=======================================================*
     * DOM生成
     *=======================================================*/

    // 生成整个日期框的DOM.并返回
    let createDom = () => {
        // ymt
        let row0 = $('<div>').addClass(cls.row0)
            .append(createDom_YearMonth())
            .append(createDom_MonthPrev())
            .append(createDom_MonthNext())
            .append(createDom_Today())[0];
        // week
        let row1 = $('<div>').addClass(cls.row1).append(createDom_Week())[0];
        // day
        let row2 = $('<div>').addClass(cls.row2).append(createDom_Day())[0];
        // box
        let datedom = $('<div>').addClass(cls.box).prop('tabIndex', -1)
            .append(row0)
            .append(row1)
            .append(row2);
        // clear ok
        let row3 = $('<div>').addClass(cls.row3)
            .append(createDom_Clear())
        // 时间区域,日期+时间格式类型时
        if (cfg.fmtType == 2) {
            row3.append(createDom_Time());
        }
        row3.append(createDom_Ok());
        datedom.append(row3[0]);
        return datedom[0];
    };

    // == 第1行 年月/前进后退/今天 == //
    // 1.生成年份月份. yyyy年MM月
    let createDom_YearMonth = () => {
        return $('<b>').addClass(cls.col00)
            .text(datefmt(new Date(cfg.year, cfg.month), 'yyyy年MM月'))[0];
    };

    // 1.1生成年份月份选择框和选项.
    let createDom_YearMonthOps = () => {
        let yearlist = data_years();
        //
        let dom = $('<div>').addClass(cls.opsym);

        // options year
        let opsyear = $('<div>').addClass(cls.opsyear);
        for (let i = 0; i < yearlist.length; i++) {
            let isselected = yearlist[i] == cfg.year ? cls.selected : "";
            let itemtxt = yearlist[i];
            let itemdom = $('<b>').addClass(cls.opyear, isselected).prop('val', itemtxt).text(itemtxt)[0];
            opsyear.append(itemdom);
        }

        // options month
        let opsmonth = $('<div>').addClass(cls.opsmonth);
        for (let i = 0; i < 12; i++) {
            let isselected = cfg.month == i ? cls.selected : "";
            let itemdom = $('<b>').addClass(cls.opmonth, isselected).prop('val', i).text((i + 1) + '月')[0];
            opsmonth.append(itemdom);
        }

        //
        return dom.append(opsyear[0]).append(opsmonth[0])[0];
    };

    // 2.1生成后退按钮,每次退一个月份
    let createDom_MonthPrev = () => {
        return $('<b>').addClass(cls.col01)[0];
    };

    // 2.2生成前进按钮,每次进一个月份
    let createDom_MonthNext = () => {
        return $('<b>').addClass(cls.col02)[0];
    };

    // 3.生成今天按钮区域
    let createDom_Today = () => {
        return $('<div>').addClass(cls.col03).text('今天')[0];
    };

    // == 第2行 星期 == //
    // 4.生成星期标题头
    let createDom_Week = () => {
        let weeksdom = $.fragment();
        let weeks = ['日', '一', '二', '三', '四', '五', '六'];
        for (let i = 0; i < weeks.length; i++) {
            let isweekend = (i === 0 || i === 6) ? cls.weekend : '';
            let itemdom = $('<b>').addClass(cls.col1, isweekend).text(weeks[i])[0];
            weeksdom.append(itemdom);
        }
        return weeksdom;
    };

    // == 第3行 日 == //
    // 5.生成天选项
    let createDom_Day = () => {
        let data = data_days(cfg.year, cfg.month);
        let fragment = $.fragment();
        for (var i = 0; i < data.length; i++) {
            let json = data[i];
            json.istoday = json.Istoday ? cls.today : '';
            json.isselected = json.Isselected ? cls.selected : '';
            json.isdayinmonth = json.Isdayinmonth ? '' : cls.dayout;
            json.isweekend = json.Isweekend ? cls.weekend : '';
            //json.exportName = exportName;
            let daydom = $('<b>').prop({ year: json.yyyy, month: json.MM, day: json.dd })
                .addClass(cls.col2, json.istoday, json.isdayinmonth, json.isselected, json.isweekend)
                .text(json.dd)[0];
            fragment.append(daydom);
        }
        return fragment;
    };

    // == 第4行 时间 确定 清除 == //
    // 6.生成清除按钮区域
    let createDom_Clear = () => {
        return $('<div>').addClass(cls.col30).text('清空')[0];
    };

    // 7.生成时分秒区域
    let createDom_Time = () => {
        return $('<b>').addClass(cls.col31)
            .text(datefmt(new Date(0, 0, 0, cfg.hour, cfg.minute, cfg.second), 'HH : mm : ss'))[0];
    };

    // 7.1生成时分秒选择框和选项
    let createDom_TimeOps = () => {
        // 钟点圆圈容器和选项
        let opshour = $('<div>').addClass(cls.opshour);
        let h = cfg.hour;
        if (h > 12)
            h = h - 12
        if (h == 0)
            h = 12;
        for (var i = 1; i < 13; i++) {
            let isselected = (h == i) ? cls.selected : '';
            opshour.append($('<b>').addClass(cls.ophour, 'h' + i, isselected).prop('val', i).text(i)[0]);
        }
        // am pm
        opshour.append($('<b>').addClass(cls.opam, cfg.hour < 12 ? cls.selected : '').text('上午')[0]);
        opshour.append($('<b>').addClass(cls.oppm, cfg.hour > 11 ? cls.selected : '').text('下午')[0]);
        // minuts/second btn plus/minus
        let opsplus = $('<div>').addClass(cls.opsplus);
        opsplus.append($('<b>').addClass(cls.opplus).prop({ opdir: 1, optype: 'm', max: 5 }).text('+')[0]);
        opsplus.append($('<b>').addClass(cls.opplus).prop({ opdir: 1, optype: 'm', max: 9 }).text('+')[0]);
        opsplus.append($('<b>').addClass(cls.opplus).prop({ opdir: 1, optype: 's', max: 5 }).text('+')[0]);
        opsplus.append($('<b>').addClass(cls.opplus).prop({ opdir: 1, optype: 's', max: 9 }).text('+')[0]);
        opsplus.append($('<b>').addClass(cls.opplus).prop({ opdir: -1, optype: 'm', max: 5 }).text('-')[0]);
        opsplus.append($('<b>').addClass(cls.opplus).prop({ opdir: -1, optype: 'm', max: 9 }).text('-')[0]);
        opsplus.append($('<b>').addClass(cls.opplus).prop({ opdir: -1, optype: 's', max: 5 }).text('-')[0]);
        opsplus.append($('<b>').addClass(cls.opplus).prop({ opdir: -1, optype: 's', max: 9 }).text('-')[0]);
        opshour.append(opsplus[0]);
        //
        return $('<div>').addClass(cls.opstime).append(opshour[0])[0];
    }

    // 8.生成确定按钮区域
    let createDom_Ok = () => {
        return $('<div>').addClass(cls.col32).text('确定')[0];
    };

    /*============================================================*
     * 其它方法 计算数据,更新状态,显示
     *============================================================*/

    // 当在日期框上操作年月后,刷新日历
    // yyyy:指定年,mm:指定月
    let resetDaysDom = () => {
        // 生成天DOM
        let row2 = createDom_Day();
        // 更新天DOM
        $(dateboxDom).find('.' + cls.row2).empty().append(row2);
        // 事件绑定
        bindEvent_Day();
    };

    // 刷新时间值
    let resetTimeDom = () => {
        $(dateboxDom).find('.' + cls.col31)
            .text(datefmt(new Date(0, 0, 0, cfg.hour, cfg.minute, cfg.second), 'HH : mm : ss'));
    }

    // 计算年选项数据
    let data_years = () => {
        // 年份选择范围固定在[1900-2100]
        let data = [];
        for (let i = minyear; i <= maxyear; i++) {
            data.push(i);
        }
        return data;
    };

    // 计算天选项数据.
    // 根据已选年月或者传入指定年月, 计算日的起始和结束
    // 日(天)总共六行七列42个,含已选年月所有日, 前推至最近的周日, 后推至最近或次近的周六
    let data_days = (yyyy, mm) => {
        // 年[1900~2100] / 月[0~11]必须合法数字
        if (!Number.isInteger(yyyy) || !Number.isInteger(mm) ||
            mm < 0 || mm > 11)
            return null;

        // 指定年月的起止日(1~xx号)
        let startDay = new Date(yyyy, mm, 1);
        //let endDay = new Date(yyyy, mm + 1, 0);

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
            json.Isdayinmonth = json.MM == mm;
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
    // 绑定操作事件.显示日期控件前必须调用
    let bindEvent_Show = () => {
        bindEvent_DateBox();
        bindEvent_YearMonth();
        bindEvent_MonthPrevNext();
        bindEvent_Today();
        bindEvent_Day();
        // 小时,分钟,秒,取消,确定,按钮在有时分秒格式时才有
        if (cfg.fmtType == 2) {
            bindEvent_Time();
        }
        bindEvent_Clear();
        bindEvent_Ok();
        bindEvent_Close();
    };

    // 日期控件事件
    let bindEvent_DateBox = () => {
        dateboxDom.onclick = (event) => {
            // 点击日期控件以内区域,阻止冒泡到根
            event.stopPropagation();
            // 点击空白位置时,关闭已经打开的年,月,日,时,分,秒的选择框.需要在子元素上取消冒泡
            $(dateboxDom).find(cls.startOps).remove();
        };
    };

    // 年月按钮点击事件,显示年月选择框
    let bindEvent_YearMonth = () => {
        $(dateboxDom).find('.' + cls.col00)[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            // 如果已经显示则关闭
            // 年份月份选择框
            let ymops = $(dateboxDom).find('.' + cls.opsym);
            if (ymops.length > 0) {
                ymops.remove();
                $(thisobj).removeClass(cls.open);
                return;
            }
            // 关闭其它弹出窗,如果有
            $(dateboxDom).find(cls.startOps).remove();

            // 生成年/月份选择框和选项,添加为日期控件直接子元素
            let opsDom = createDom_YearMonthOps();
            $(dateboxDom).append(opsDom);

            // 定位已选年份到滚动框的中间(视口可见范围内)
            // 年份选择框
            let opsYear = $(opsDom).find('.' + cls.opsyear);
            // 已选年
            let opYear = $(opsDom).find('.' + cls.opsyear + ' .' + cls.selected);
            // 计算这个年份选项离父框的TOP值,然后滚动条滚动这个值-父框高/2
            let scrollval = opYear[0].offsetTop - opsYear[0].clientHeight / 2;
            opsYear[0].scrollTo(0, scrollval);

            // 打开了框后添加背景色
            $(thisobj).addClass(cls.open);

            // 绑定年/月份选择点击事件
            bindEvent_Option_Year();
            bindEvent_Option_Month();
        };
    };

    // 点击年份选项 选定一个年份 
    let bindEvent_Option_Year = () => {
        $(dateboxDom).find('.' + cls.opyear).each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                // 年月dom
                let ymDom = $(dateboxDom).find('.' + cls.col00);
                // 所选年份值
                cfg.year = parseInt($(thisobj).prop('val'));
                // 更新年/月份按钮显示值
                ymDom.text(datefmt(new Date(cfg.year, cfg.month), 'yyyy年MM月'));
                // 刷新 日
                resetDaysDom();
            };
        });
    };

    // 点击月份选项 选定一个月份
    let bindEvent_Option_Month = () => {
        $(dateboxDom).find('.' + cls.opmonth).each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                // 
                // 年月dom
                let ymDom = $(dateboxDom).find('.' + cls.col00);
                // 所选月份值
                cfg.month = parseInt($(thisobj).prop('val'));
                // 更新年/月份按钮显示值
                ymDom.text(datefmt(new Date(cfg.year, cfg.month), 'yyyy年MM月'));
                // 刷新 日
                resetDaysDom();
                // 关闭年/月份选择框
                $(dateboxDom).find('.' + cls.opsym).remove();
            };
        });
    };

    // 点击前进和后退按钮,进退1个月份  dir:1=前进,2=后退
    let bindEvent_MonthPrevNext = () => {
        $(dateboxDom).find('.' + cls.col01 + ',.' + cls.col02).each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let dir = $(thisobj).hasClass(cls.col01) ? 2 : 1;
                //
                let ymDom = $(dateboxDom).find('.' + cls.col00);
                let y = cfg.year;
                let m = cfg.month;
                // 计算并刷新年或月按钮值 年份前进后退值[1900-2100]
                m = dir == 1 ? m + 1 : m - 1;
                if (m < 0) {
                    m = 11;
                    // 年往后退一年,如果为1900年,则变成2100年
                    if (y > minyear)
                        y = y - 1;
                    else
                        y = maxyear;
                } else if (m > 11) {
                    m = 0;
                    // 年往前进一年,如果为2100年,则变成1900年
                    if (y < maxyear)
                        y = y + 1;
                    else
                        y = minyear;
                }
                // 更新年/月份按钮显示值
                ymDom.text(datefmt(new Date(y, m), 'yyyy年MM月'));
                // 刷新日
                //console.log(y+'----'+m);
                cfg.year = y;
                cfg.month = m;
                resetDaysDom();
            };
        });
    };

    // 点击今天按钮 设置今天日期到input框
    let bindEvent_Today = () => {
        $(dateboxDom).find('.' + cls.col03)[0].onclick = (event) => {
            event.stopPropagation();
            //
            let today = new Date((new Date()).setHours(cfg.hour, cfg.minute, cfg.second));
            inputDOM.value = datefmt(today, cfg.dateFmt);
            //
            mydate.close();
        };
    };

    // 点击时间,显示时间选择框
    let bindEvent_Time = () => {
        $(dateboxDom).find('.' + cls.col31)[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            // 如果已经显示则关闭
            // 时间选择框
            let timeops = $(dateboxDom).find('.' + cls.opstime);
            if (timeops.length > 0) {
                timeops.remove();
                $(thisobj).removeClass(cls.open);
                return;
            }
            // 关闭其它弹出窗,如果有
            $(dateboxDom).find(cls.startOps).remove();

            // 生成time选择框和选项,添加为日期控件直接子元素
            let opsDom = createDom_TimeOps();
            $(dateboxDom).append(opsDom);

            $(thisobj).addClass(cls.open);

            // 绑定time相关点击事件
            bindEvent_Options_Time();
            bindEvent_Option_Hour();
            bindEvent_Option_AmPm();
            bindEvent_OptionPlus();
        };
    }

    // 点击时间框,阻止冒泡
    let bindEvent_Options_Time = () => {
        // 点击到空白处,不要关闭时间框
        $(dateboxDom).find('.' + cls.opstime)[0].onclick = (event) => {
            event.stopPropagation();
        };
    };

    // 点击'时',选择一个时钟点
    let bindEvent_Option_Hour = () => {
        // 点击小时按钮 显示小时选择框
        $(dateboxDom).find('.' + cls.ophour).each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                $(thisobj).parent().find('.' + cls.ophour).removeClass(cls.selected);
                $(thisobj).addClass(cls.selected);
                //
                let h = parseInt($(thisobj).prop('val'));
                // am/pm
                if ($(dateboxDom).find('.' + cls.opam).hasClass(cls.selected)) {
                    if (h == 12)
                        h = 0;
                } else if (h < 12)
                    h += 12;
                //
                cfg.hour = h;
                resetTimeDom();
            }
        });
    };

    // 点击上/下午,钟点为24小时制
    let bindEvent_Option_AmPm = () => {
        // 上午
        $(dateboxDom).find('.' + cls.opam)[0].onclick = (event) => {
            event.stopPropagation();
            //let thisobj = event.currentTarget;
            //
            if (cfg.hour > 11) {
                cfg.hour = cfg.hour - 12;
            }
            //
            $(dateboxDom).find('.' + cls.oppm).removeClass(cls.selected);
            $(dateboxDom).find('.' + cls.opam).addClass(cls.selected);
            resetTimeDom();
        };
        // 下午
        $(dateboxDom).find('.' + cls.oppm)[0].onclick = (event) => {
            event.stopPropagation();
            //let thisobj = event.currentTarget;
            //
            if (cfg.hour < 12) {
                cfg.hour = cfg.hour + 12;
            }
            //
            $(dateboxDom).find('.' + cls.opam).removeClass(cls.selected);
            $(dateboxDom).find('.' + cls.oppm).addClass(cls.selected);
            resetTimeDom();
        };
    };

    // 点击plus minus,修改分/秒值
    let bindEvent_OptionPlus = () => {
        //
        $(dateboxDom).find('.' + cls.opplus).each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let dom = $(thisobj);
                let dir = parseInt(dom.prop('opdir'));
                let type = dom.prop('optype');
                let max = parseInt(dom.prop('max'));
                //
                // 分/秒 十位/个位 数组索引0是分,1是秒 内数组索引0是十位,索引1是个位
                let ms = [[0, 0], [0, 0]];
                ms[0][0] = Math.trunc(cfg.minute / 10) % 10;
                ms[0][1] = Math.trunc(cfg.minute) % 10;
                // 秒钟十位/个位
                ms[1][0] = Math.trunc(cfg.second / 10) % 10;
                ms[1][1] = Math.trunc(cfg.second) % 10;
                // 加减值
                let tIndex = type == 'm' ? 0 : 1;
                let vIndex = max == 5 ? 0 : 1;
                let val = ms[tIndex][vIndex];
                val = val + dir;
                if (val > max)
                    val = 0;
                else if (val < 0)
                    val = max;
                ms[tIndex][vIndex] = val;
                // 刷新值
                cfg.minute = parseInt(ms[0][0] + '' + ms[0][1]);
                cfg.second = parseInt(ms[1][0] + '' + ms[1][1]);
                resetTimeDom();
            };
        });
    };

    // 选择日 设置这天日期到Input框
    let bindEvent_Day = () => {
        $(dateboxDom).find('.' + cls.col2).each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let date = new Date($(thisobj).prop('year'), $(thisobj).prop('month'), $(thisobj).prop('day'), cfg.hour, cfg.minute, cfg.second);
                inputDOM.value = datefmt(date, cfg.dateFmt);
                //
                mydate.close();
            };
        });
    };

    // 点击清空
    let bindEvent_Clear = () => {
        $(dateboxDom).find('.' + cls.col30)[0].onclick = (event) => {
            event.stopPropagation();
            // let thisobj = event.currentTarget;
            //
            inputDOM.value = '';
            mydate.close();
        };
    };

    // 点击确定按钮
    let bindEvent_Ok = () => {
        $(dateboxDom).find('.' + cls.col32)[0].onclick = (event) => {
            event.stopPropagation();
            // let thisobj = event.currentTarget;
            //
            // 找到选中的日,触发点击事件
            $(dateboxDom).find('.' + cls.col2 + '.' + cls.selected)[0].click();
            //
            mydate.close();
        };
    };

    // 点击日期控件以外区域,关闭控件. 
    let bindEvent_Close = () => {
        document.removeEventListener("click", closeDateBox);
        document.addEventListener("click", closeDateBox);
    }

    // 关闭日期框-外部使用
    mydate.close = () => {
        closeDateBox();
    };
    // 日期函数名
    win.ns.myDatePick = mydate;
})(window);