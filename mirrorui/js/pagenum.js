/*
必须参数:{
    domId:'容器DOM的id',
    totalData:'总数',
    pageIndex:'当前页码',
    pageSize:'每页数量',
    pageClickE:'页码点击方法'
    }
当总数大于0时,才需要调用分页条
*/
((win) => {
    // 帮助函数
    const $ = win.$ui;
    //------------------------------------------------------------------------------------------------//
    // 总页数(由数量总数和分页大小算出)
    let getTotalPage = (dataCount, pageSize, pageIndex) => {
        if (dataCount >= 0 && pageSize >= 5 &&
            pageIndex >= 1) {
            let pagecount = parseInt(dataCount / pageSize);
            let pagecountMod = dataCount % pageSize;
            return pagecountMod > 0 ? pagecount + 1 : pagecount;
        }
        return 0;
    };
    // 配置设定检查,返回配置对象
    let initCfg = (config) => {
        let cfg = {};
        // 当前页码
        cfg.PageIndex = config.pageIndex || 1;
        // 每页数量[5-50]
        cfg.PageSize = (config.pageSize > 4 && config.pageSize < 51) ? config.pageSize : 10;
        // 数据总数
        cfg.TotalData = config.totalData || 0;
        // 总页数
        cfg.TotalPage = getTotalPage(cfg.TotalData, cfg.PageSize, cfg.PageIndex);
        // 分页按钮个数[5-10].
        cfg.TotalBtn = (config.totalBtn > 4 && config.totalBtn < 11) ? config.totalBtn : 5;
        // 页码点击事件方法
        cfg.pageClickE = config.pageClickE;
        return cfg;
    };

    // 计算起始页码位置:以当前页码为中间位置,根据需要显示的页码按钮个数,计算当前页码之前和之后的页码数.
    // 当前页码在正中,如果显示按钮个数为偶数,则偏左.例如: "2 3 (4:当前页码在此) 5 6 7"
    let pagenumRange = (cfg) => {
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
        //console.log(cfg);
    };


    /*====================*
     * 事件绑定 
     *====================*/
    let bindEventForAllBtn = (pnDom, cfg) => {
        // 页码按钮点击
        $(pnDom).find('.pagenum-prev,.pagenum-next,.pagenum-first,.pagenum-last,.pagenum-num').each((item) => {
            item.onclick = () => {
                // 页码参数范围[1-总页码],范围外不动作
                let pnnum = parseInt($(item).prop('pagenum')) || 0;
                if (pnnum < 1 || pnnum > cfg.TotalPage) return;
                cfg.pageClickE(pnnum);
            };
        });

        // 确定按钮点击
        $(pnDom).find('.pagenum-ok')[0].onclick = () => {
            let pnnum = parseInt($(pnDom).find('.pagenum-input')[0].value || 0);
            if (pnnum < 1 || pnnum > cfg.TotalPage) return;
            cfg.pageClickE(pnnum);
        };
    };
    // 生成分页条
    let pageNum = (config) => {
        // 分页条容器DOM对象
        let pnDom = document.getElementById(config.domId);
        // 1. 配置对象
        let cfg = initCfg(config);

        // 2. 更新分页条数据,绑定相关事件,生成新的分页条
        // 清空DOM,重新生成分页组件DOM,绑定事件
        pnDom.innerHTML = '';
        pnDom.innerText = '';
        // 1.页码按钮区域
        let btnsarea = $('<span>').addClass('pagenum-btns')[0];
        // 2.跳转按钮区域
        let btnskip = $('<span>').addClass('pagenum-skip')[0];
        btnskip.innerHTML = `共<b class="pagenum-total">${cfg.TotalPage}</b>页&nbsp;&nbsp;到第<input class="pagenum-input" />页<a class="pagenum-ok">确定</a>`;

        // 计算页码起止
        pagenumRange(cfg);
        //console.log(cfg);
        /*-------------------------------------------------------*
         * 添加按钮DOM
         * 页码区固定按钮4个:前一页,第1页和第末页,后一页.
         *-------------------------------------------------------*/
        let btndom = $.fragment();

        // 向前按钮
        btndom.append($('<a>').addClass('pagenum-prev').prop('pagenum', cfg.PageIndex - 1).text('〈')[0]);
        // 第1页按钮,当起始页码大于1时添加
        if (cfg.StartIndex > 1) {
            let isactiveNum = cfg.PageIndex == 1 ? 'active' : 'num';
            btndom.append($('<a>').addClass('pagenum-' + isactiveNum).prop('pagenum', 1).text('1')[0]);
        }

        // 前省略号,当起始页码大于2时添加
        if (cfg.StartIndex > 2) {
            btndom.append($('<span>').addClass('pagenum-break').text('...')[0]);
        }
        // 页码按钮
        for (let i = cfg.StartIndex; i <= cfg.EndIndex; i++) {
            let pagenum = i;
            let isactiveNum = pagenum == cfg.PageIndex ? 'active' : 'num';
            btndom.append($('<a>').addClass('pagenum-' + isactiveNum).prop('pagenum', pagenum).text(pagenum)[0]);
        }
        // 后省略号,当结束页小于最大页码-1时
        if (cfg.EndIndex < (cfg.TotalPage - 1)) {
            btndom.append($('<span>').addClass('pagenum-break').text('...')[0]);
        }
        // 最后页按钮,当结束页小于最大页码时添加
        if (cfg.EndIndex < cfg.TotalPage) {
            let isactiveNum = cfg.PageIndex == cfg.TotalPage ? 'active' : 'num';
            btndom.append($('<a>').addClass('pagenum-' + isactiveNum).prop('pagenum', cfg.TotalPage).text(cfg.TotalPage)[0]);
        }

        // 向后按钮
        btndom.append($('<a>').addClass('pagenum-next').prop('pagenum', cfg.PageIndex + 1).text('〉')[0]);

        // 将btndom添加到页码按钮区域容器
        btnsarea.appendChild(btndom);
        pnDom.appendChild(btnsarea);
        pnDom.appendChild(btnskip);
        // 绑定所有按钮事件
        bindEventForAllBtn(pnDom, cfg);
    };
    // window对象名字
    win.pagenum = pageNum;
})(window);