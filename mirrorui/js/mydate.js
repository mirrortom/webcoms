// =======================================
// 日期组件, 是一个函数.在input上使用此方法.
//  <input onclick="myDatePick()" />
//  时间部分: myDatePick({ fmt: datetime })
// =======================================
((win) => {
    // datebox样式类名
    const dateboxCls = 'date-box';
    // 最大最小年份
    const maxyear = 2100;
    const minyear = 1900;
    // 帮助函数
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

    //------datebox类-----------datebox类---------//

    // 触发日期框的INPUT的DOM对象引用
    let inputDOM = null;
    // 日期框DOM对象
    let dateboxDom = null;
    // 日期框配置对象
    let cfg = null;

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

        // 用inpupt的值初始化时间,为空则默认今天时间.input时间格式只支持 yyyy/MM/dd HH:mm:ss(时间,秒部分可省略)
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
        let ww = win.innerWidth;
        if (ww < 576) {
            thisleft = 0;
            thistop = '25vh';
        }

        // 清除可能已有的日期框
        $(document.body).find('.' + dateboxCls).remove();

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
        let ymtarea = $('<div>').addClass('date-area-ymt')
            .append(createDom_Year())
            .append(createDom_Month())
            .append(createDom_Today())[0];

        let weekarea = $('<div>').addClass('date-area-week').append(createDom_Week())[0];

        let dayarea = $('<div>').addClass('date-area-day').append(createDom_Day())[0];

        let datedom = $('<div>').addClass('date-box').prop('tabIndex', -1)
            .append(ymtarea)
            .append(weekarea)
            .append(dayarea);
        // 时间区域,日期+时间格式类型时
        if (cfg.fmtType == 2) {
            let tcarea = $('<div>').addClass('date-area-tc')
                .append(createDom_Time())
                .append(createDom_Clear())
                .append(createDom_Ok())[0];
            datedom.append(tcarea);
        }
        return datedom[0];
    };

    // 1.生成年份区内容 前进,后退,年份 按钮
    let createDom_Year = () => {
        let prevbtn = $('<a>').addClass('date-btn-prev').text('＜')[0];
        let yearbtn = $('<b>').addClass('date-btn-year').prop('val', cfg.year).text(cfg.year + '年')[0];
        let nextbtn = $('<a>').addClass('date-btn-next').text('＞')[0];
        return $('<div>').addClass('date-area-year')
            .append(prevbtn)
            .append(yearbtn)
            .append(nextbtn)[0];
    };

    // 1.1生成年份下拉选择框. selectedYear:可指定一个年份为已选定
    let createDom_YearSelect = (selectedYear) => {
        let ydoms = '';
        let ylistData = domYear_Data();
        if (!selectedYear)
            selectedYear = (new Date()).getFullYear();
        //
        let dom = $('<div>').addClass('date-select-year');
        for (let i = 0; i < ylistData.length; i++) {
            let isselect = ylistData[i] == selectedYear ? "selected" : "";
            let itemtxt = ylistData[i];
            let itemdom = $('<b>').addClass('date-option-year', isselect).prop('val', itemtxt).text(itemtxt)[0];
            dom.append(itemdom);
        }
        return dom[0];
    };

    // 2.生成月份区 前进,后退,月份 按钮
    let createDom_Month = () => {
        let prevbtn = $('<a>').addClass('date-btn-prev').text('＜')[0];
        let monthbtn = $('<b>').addClass('date-btn-month').prop('val', cfg.month).text(cfg.month + 1 + '月')[0];
        let nextbtn = $('<a>').addClass('date-btn-next').text('＞')[0];
        return $('<div>').addClass('date-area-month')
            .append(prevbtn)
            .append(monthbtn)
            .append(nextbtn)[0];
    };

    // 2.1生成月份下拉选择框. selectedMonth:可指定一个月份为已选定
    let createDom_MonthSelect = (selectedMonth) => {
        let dom = $('<div>').addClass('date-select-month');
        for (let i = 0; i < 12; i++) {
            let isselect = selectedMonth == i ? "selected" : "";
            let itemdom = $('<b>').addClass('date-option-month', isselect).prop('val', i).text(i + 1)[0];
            dom.append(itemdom);
        }
        return dom[0];
    };

    // 3.生成星期标题头
    let createDom_Week = () => {
        let weeksdom = $.fragment();
        let weeks = ['日', '一', '二', '三', '四', '五', '六'];
        for (let i = 0; i < weeks.length; i++) {
            let isweekend = (i === 0 || i === 6) ? 'date-item-weekend' : '';
            let itemdom = $('<b>').addClass('date-item-week', isweekend).text(weeks[i])[0];
            weeksdom.append(itemdom);
        }
        return weeksdom;
    };

    // 4.生成天选项 daylist:日数据.不传则使用选定年月计算出日
    let createDom_Day = (daylist) => {
        let data = daylist || domDay_Data();
        let fragment = $.fragment();
        for (var i = 0; i < data.length; i++) {
            let json = data[i];
            json.istoday = json.Istoday ? 'date-item-today' : '';
            json.isselected = json.Isselected ? 'selected' : '';
            json.isdayinmonth = json.Isdayinmonth ? '' : 'date-item-dayoutmonth';
            json.isweekend = json.Isweekend ? 'date-item-weekend' : '';
            //json.exportName = exportName;
            let daydom = $('<b>').addClass('date-item-day', json.istoday, json.isdayinmonth, json.isselected
                , json.isweekend).prop({ 'year': json.yyyy, 'month': json.MM, 'day': json.dd }).text(json.dd)[0];
            fragment.append(daydom);
        }
        return fragment;
    };
    // 5.生成时分秒区域
    let createDom_Time = () => {
        let hour = $('<b>').addClass('date-btn-time', 'date-btn-hour').text(cfg.hour)[0];
        let minute = $('<b>').addClass('date-btn-time', 'date-btn-minute').text(cfg.minute)[0];
        let second = $('<b>').addClass('date-btn-time', 'date-btn-second').text(cfg.second)[0];
        return $('<div>').addClass('date-area-time')
            .append(hour)
            .append(minute)
            .append(second)[0];
    };
    // 5.1生成小时选择框
    let createDom_HourSelect = () => {
        let dom = $('<div>').addClass('date-select-hour');
        let title = ['凌晨', '上午', '下午', '夜晚'];
        for (let i = 0; i < 24; i++) {
            let itemdom = $('<b>').addClass('date-option-hour').prop('val', i).text(i)[0];
            if (i % 6 == 0)
                dom.append($('<span>').addClass('date-option-title').text(title[i / 6])[0]);
            dom.append(itemdom);
        }
        return dom[0];
    };
    // 5.2生成分钟,秒钟选择框
    let createDom_MinuteSelect = () => {
        let dom = $('<div>').addClass('date-select-minute');
        for (let i = 0; i < 60; i++) {
            let itemdom = $('<b>').addClass('date-option-minute').prop('val', i).text(i)[0];
            dom.append(itemdom);
        }
        return dom[0];
    };
    // 5.3生成秒钟选择框
    let createDom_SecondSelect = () => {
        let dom = $('<div>').addClass('date-select-second');
        for (let i = 0; i < 60; i++) {
            let itemdom = $('<b>').addClass('date-option-second').prop('val', i).text(i)[0];
            dom.append(itemdom);
        }
        return dom[0];
    };
    // 6.生成今天按钮区域
    let createDom_Today = () => {
        return $('<div>').addClass('date-area-today').html('<a class="date-btn-today">今天</a>')[0];
    };
    // 7.生成清除按钮区域
    let createDom_Clear = () => {
        return $('<div>').addClass('date-area-clear').html('<a class="date-btn-clear">清空</a>')[0];
    };
    // 8.生成确定按钮区域 
    let createDom_Ok = () => {
        return $('<div>').addClass('date-area-ok').html('<a class="date-btn-ok">确定</a>')[0];
    };

    // 根据选定的年,月刷新日(用于当在日期框上操作年,月等会改变年月的动作时)
    // yyyy:指定年,mm:指定月 daysdom:日的父级DOM的JQ对象(.daysrows)
    let resetDaysDom = (yyyy, mm) => {
        // 计算出指定年月的日数据
        let dayslist = domDay_Data(yyyy, mm);
        // 生成天DOM
        let daysdom = createDom_Day(dayslist);
        // 更新天DOM
        $(dateboxDom).find('.date-area-day').empty().append(daysdom);
        // 事件绑定
        bindEvent_DaySelected();
    };

    /*----------------为DOM提供的数据,年份 日-----------为DOM提供的数据,年份 日-------- */
    // 根据已选年计算年份选项
    let domYear_Data = () => {
        // 年份选择范围固定在[1900-2100]
        let data = [];
        for (let i = minyear; i <= maxyear; i++) {
            data.push(i);
        }
        return data;
    };

    // 根据已选年月或者传入指定年月,计算日的起始和结束
    // 日(天)总共六行七列42个,含已选年月所有日, 前推至最近的周日, 后推至最近或次近的周六
    let domDay_Data = (yyyy, mm) => {
        // 指定年 超范围则设为当天年
        let seledY = isNaN(parseInt(yyyy)) ? cfg.year : parseInt(yyyy);
        // 指定月 超范围设为当天月
        let seledM = isNaN(parseInt(mm)) ? cfg.month : parseInt(mm);

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
            $(dateboxDom).find('[class^=date-select]').remove();
        };
    };
    let bindEvent_YearBtn = () => {
        // 点击年按钮 显示年选择框
        $(dateboxDom).find('.date-btn-year')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let seledY = $(thisobj).prop('val');
            // 年份选择框 .date-select-year
            let yearopsbox = $(thisobj.parentElement).find('.date-select-year');
            // 如果已经显示则关闭
            if (yearopsbox.length > 0) {
                yearopsbox.remove();
                return;
            }
            // 先关闭其它弹出窗
            let otherDoms = $(dateboxDom).find('[class^=date-select]');
            otherDoms.remove();
            // 生成年份选择框,填充到年份选择框中
            let yearSelectDom = createDom_YearSelect(seledY);
            thisobj.parentElement.append(yearSelectDom);
            // 定位已选年份到滚动框的中间(视口可见范围内)
            let yseled = $(yearSelectDom).find('.selected')[0];

            // 计算这个年份选项离父框的TOP值,然后滚动条滚动这个值-父框高/2
            let scrollval = yseled.offsetTop - yearSelectDom.clientHeight / 2;
            yearSelectDom.scrollTo(0, scrollval);
            // 绑定年份选择点击事件
            bindEvent_YearSelected();
        };
    };
    let bindEvent_MonthBtn = () => {
        // 点击月按钮 显示月选择框
        $(dateboxDom).find('.date-btn-month')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let seledM = $(thisobj).prop('val');
            let monthsops = $(thisobj.parentElement).find('.date-select-month');
            // 如果已经显示则关闭
            if (monthsops.length > 0) {
                monthsops.remove();
                return;
            }
            // 先关闭其它弹出窗
            let otherDoms = $(dateboxDom).find('[class^=date-select]');
            otherDoms.remove();
            //
            thisobj.parentElement.append(createDom_MonthSelect(seledM));
            // 绑定月分选项点击事件
            bindEvent_MonthSelected();
        };
    };
    let bindEvent_YearSelected = () => {
        // 点击年份选项 选定一个年份 
        $(dateboxDom).find('.date-option-year').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                // 
                // 所选年份值
                let y = $(thisobj).prop('val');
                // 更新年份按钮显示值
                $(dateboxDom).find('.date-btn-year').prop('val', y).text(y + '年');
                // 关闭年份选择框
                $(thisobj.parentElement).remove();
                // 刷新 日
                let m = $(dateboxDom).find('.date-btn-month').prop('val');
                resetDaysDom(y, m);
            };
        });
    };
    let bindEvent_MonthSelected = () => {
        // 点击月份选项 选定一个月份
        $(dateboxDom).find('.date-option-month').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                // 
                // 所选月份值
                let m = parseInt($(thisobj).prop('val'));
                $(dateboxDom).find('.date-btn-month').prop('val', m).text(m + 1 + '月');
                // 关闭月份选择框
                $(thisobj.parentElement).remove();
                // 刷新 日
                let y = $(dateboxDom).find('.date-btn-year').prop('val');
                resetDaysDom(y, m);
            };
        });
    };
    let bindEvent_YearMonthPrevNext = () => {
        // 点击年份,月份的前进和后退按钮 btntype:1=年按钮,2=月按钮. dir:1=前进,2=后退
        $(dateboxDom).find('.date-btn-prev,.date-btn-next').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let btntype = thisobj.parentElement.classList.contains('date-area-year') ? 1 : 2;
                let dir = thisobj.classList.contains('date-btn-next') ? 1 : 2;
                //
                let ybtn = $(dateboxDom).find('.date-btn-year');
                let mbtn = $(dateboxDom).find('.date-btn-month');
                let y = parseInt(ybtn.prop('val'));
                let m = parseInt(mbtn.prop('val'));
                // 计算并刷新年或月按钮值 年份前进后退值[1900-2100]
                if (btntype == 1) {
                    y = dir == 1 ? y + 1 : y - 1;
                    if (y < minyear) y = maxyear;
                    else if (y > maxyear) y = minyear;
                } else if (btntype == 2) {
                    m = dir == 1 ? m + 1 : m - 1;
                    if (m < 0) {
                        m = 11;
                        // 年往后退一年,如果为1900年,则不变
                        if (y > minyear)
                            y = y - 1;
                    } else if (m > 11) {
                        m = 0;
                        // 年往前进一年,如果为2100年,则不变
                        if (y < maxyear)
                            y = y + 1;
                    }
                }
                ybtn.prop('val', y).text(y + '年');
                mbtn.prop('val', m).text(m + 1 + '月');
                // 刷新日
                //console.log(y+'----'+m);
                resetDaysDom(y, m);
            };
        });
    };
    let bindEvent_TodayBtn = () => {
        // 点击今天按钮 设置今天日期到input框
        $(dateboxDom).find('.date-btn-today')[0].onclick = (event) => {
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
        $(dateboxDom).find('.date-btn-hour')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let hourselecct = $(dateboxDom).find('.date-select-hour');
            // 点击小时按钮时,弹出小时选择框,同时,按钮加上打开样式,以表示当前选择的是小时
            // 添加样式时,先取消其按钮的打开样式,打开后,再给自己加上打开样式
            let otherBtns = $(thisobj.parentElement).find('.date-btn-time').removeClass('open');
            // 如果已经是打开状态则关闭
            if (hourselecct.length > 0) {
                hourselecct.remove();
                return;
            }
            // 先关闭其它弹出窗
            let otherdoms = $(dateboxDom).find('[class^=date-select]');
            otherdoms.remove();
            // 显示小时选择框
            dateboxDom.append(createDom_HourSelect());
            $(thisobj).addClass('open');
            // 绑定小时选项点击事件
            bindEvent_HourSelected();
        };
    };
    let bindEvent_MinBtn = () => {
        // 点击分钟按钮 显示分钟选择框
        $(dateboxDom).find('.date-btn-minute')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let minselecct = $(dateboxDom).find('.date-select-minute');
            // 点击时分秒下拉框按钮时,先取消其按钮的打开样式,打开后,再给自己加上打开样式
            let otherBtns = $(thisobj.parentElement).find('.date-btn-time').removeClass('open');
            // 如果已经显示则关闭
            if (minselecct.length > 0) {
                minselecct.remove();
                return;
            }
            // 先关闭其它弹出窗
            let otherdoms = $(dateboxDom).find('[class^=date-select]');
            otherdoms.remove();
            dateboxDom.append(createDom_MinuteSelect());
            $(thisobj).addClass('open');
            // 绑定分钟选项点击事件
            bindEvent_MinSelected();
        };
    };
    let bindEvent_SecBtn = () => {
        // 点击秒钟按钮 显示秒钟选择框
        $(dateboxDom).find('.date-btn-second')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let secselecct = $(dateboxDom).find('.date-select-second');
            // 点击时分秒下拉框按钮时,先取消其按钮的打开样式,打开后,再给自己加上打开样式
            let otherBtns = $(thisobj.parentElement).find('.date-btn-time').removeClass('open');
            // 如果已经显示则关闭
            if (secselecct.length > 0) {
                secselecct.remove();
                return;
            }
            // 先关闭其它弹出窗
            $(dateboxDom).find('[class^=date-select]').remove();
            dateboxDom.append(createDom_SecondSelect());
            $(thisobj).addClass('open');
            // 绑定秒钟选项点击事件
            bindEvent_SecSelected();
        };
    };
    let bindEvent_HourSelected = () => {
        // 选择小时 修改小时按钮显示值
        $(dateboxDom).find('.date-option-hour').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let h = $(thisobj).prop('val');
                $(dateboxDom).find('.date-btn-hour').text(h);
                cfg.hour = h;
                //
                $(thisobj.parentElement).remove();
            };
        });
    };
    let bindEvent_MinSelected = () => {
        // 选择分钟 修改按钮显示值
        $(dateboxDom).find('.date-option-minute').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let m = $(thisobj).prop('val');
                $(dateboxDom).find('.date-btn-minute').text(m);
                cfg.minute = m;
                //
                $(thisobj.parentElement).remove();
            };
        });
    };
    let bindEvent_SecSelected = () => {
        // 选择秒钟 修改按钮显示值
        $(dateboxDom).find('.date-option-second').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let s = $(thisobj).prop('val');
                $(dateboxDom).find('.date-btn-second').text(s);
                cfg.second = s;
                //
                $(thisobj.parentElement).remove();
            };
        });
    };
    let bindEvent_DaySelected = () => {
        // 选择天 设置这天日期到Input框
        $(dateboxDom).find('.date-item-day').each((item) => {
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
    let bindEvent_ClearBtn = () => {
        // 点击清空
        $(dateboxDom).find('.date-btn-clear')[0].onclick = (event) => {
            event.stopPropagation();
            // let thisobj = event.currentTarget;
            //
            inputDOM.value = '';
            mydate.close();
        };
    };
    let bindEvent_OkBtn = () => {
        // 点击确定按钮
        $(dateboxDom).find('.date-btn-ok')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            // 找到选中的日 设置到Input框 如果没有选中的日,使用当前设置日期
            let seledDay = $(dateboxDom).find('.date-item-day.selected');
            let dateStr = datefmt(new Date(cfg.year, cfg.month, cfg.day, cfg.hour, cfg.minute, cfg.second), cfg.dateFmt);
            if (seledDay.length > 0) {
                let d = new Date(seledDay.prop('year'), seledDay.prop('month'), seledDay.prop('day'), cfg.hour, cfg.minute, cfg.second);
                dateStr = datefmt(d, cfg.dateFmt);
            }

            inputDOM.value = dateStr;
            //
            mydate.close();
        };
    };

    // 关闭日期框
    mydate.close = () => {
        dateboxDom = null;
        inputDOM = null;
        cfg = null;
        $(document.body).find('.' + dateboxCls).remove();
    };

    // 点击日期控件以外区域,关闭控件. 
    document.onclick = () => {
        mydate.close();
    };
    // 日期函数名
    win.ns.myDatePick = mydate;
})(window);