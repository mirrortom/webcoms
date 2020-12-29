// ====================================================================
// ajax (使用原生: fetch()) fetch方法返回Promise对象.
// 做了参数初始化包装,用法支持使用await方式,也可以使用.then()方式
// https://github.com/matthew-andrews/isomorphic-fetch
// (详细讲解)http://www.ruanyifeng.com/blog/2020/12/fetch-tutorial.html
//          https://www.cnblogs.com/libin-1/p/6853677.html
// ====================================================================
((win) => {
    let _$ = win.lib;
    // 初始化post请求
    let initPost = (para, initCfg) => {
        let formData = new FormData();
        if (para instanceof FormData) {
            formData = para;
        } else if (para) {
            Object.keys(para).forEach((key) => {
                formData.append(key, para[key]);
            });
        }
        let cfg = { method: "POST", body: formData };
        if (initCfg) {
            Object.keys(initCfg).forEach((key) => {
                cfg[key] = initCfg[key];
            });
        }
        return cfg;
    }
    // 初始化get请求
    let initGet = (para) => {
        let urlpara = [];
        if (para) {
            if (para instanceof FormData) {
                para.forEach((val, key) => {
                    urlpara.push(`${key}=${val}`);
                });
            } else {
                Object.keys(para).forEach((key) => {
                    urlpara.push(`${key}=${para[key]}`);
                });
            }
            if (url.indexOf('?') < 0) {
                url += '?';
            } else {
                url += '&';
            }
            url += urlpara.join('&');
        }
        return encodeURI(url);
    }
    /**
     * post请求,使用await方式.当res.ok==true时,默认返回fetch结果的json对象.
     * 当res.ok为false时,丢出异常,异常信息是res.text()的文本信息.要获取异常,可以在try catch中使用本方法
     * @param {string} url 请求url
     * @param {any|FormData} para json对象或者FormData对象,如果是json对象,会转化成FormData对象
     * @param {RequestInit} initCfg fetch请求配置对象.例如传headers:{'Auth':'xxx'}用来验证
     * @param {string} resType 返回值类型 默认"json",可选"html"
     * @returns {any} 返回fetch的res.json()函数返回的json结果
     */
    _$.postAsync = async (url, para, initCfg = null, resType = 'json') => {
        let cfg = initPost(para, initCfg);
        //
        let res = await fetch(url, cfg);
        if (res.ok)
            return await resType != 'json' ? res.text() : res.json();
        else {
            let txt = await res.text()
            throw new Error(txt);
        }
    }

    /**
     * get请求,使用await方式.当res.ok==true时,默认返回fetch结果的text对象.
     * 当res.ok为false时,丢出异常,异常信息是res.text()的文本信息.要获取异常,可以在try catch中使用本方法
     * @param {string} url 请求url
     * @param {any|FormData} para json对象或者FormData对象,转化为url参数
     * @param {RequestInit} initCfg fetch请求配置对象.例如传headers:{'Auth':'xxx'}用来验证
     * @param {string} resType 返回值类型 默认"html",可选"json"
     * @returns {any} 返回fetch的res.text()函数返回的文本内容结果
     */
    _$.getAsync = async (url, para, initCfg = null, resType = 'html') => {
        let eurl = initGet(url, para);
        //
        let res = await fetch(eurl, initCfg);
        if (res.ok)
            return await resType != 'html' ? res.json() : res.text();
        else {
            let txt = await res.text()
            throw new Error(txt);
        }
    }

    /**
     * post请求,.then()链式调用方式.方法发送fetch请求后,调用then()处理,如果res.ok==ok,默认返回json结果.
     * 当res.ok为false时,丢出异常,异常信息是res.text()的文本信息.
     * 后面需要继续调用.then()来处理结果,也可以调用.catch()处理异常
     * @param {string} url 请求url
     * @param {any|FormData} para json对象或者FormData对象,如果是json对象,会转化成FormData对象
     * @param {RequestInit} initCfg fetch请求配置对象.例如传headers:{'Auth':'xxx'}用来验证
     * @param {string} resType 返回值类型 默认"json",可选"html"
     * @returns {Promise} fetch().then()返回的Promise对象
     */
    _$.post = (url, para, initCfg = null, resType = 'json') => {
        let cfg = initPost(para, initCfg);
        //
        return fetch(url, cfg)
            .then(res => {
                if (res.ok)
                    return resType != 'json' ? res.text() : res.json();
                else
                    throw new Error(res.text());
            });
    };
    /**
     * get请求,.then()链式调用方式.方法发送fetch请求后,调用then()处理,如果res.ok==ok,默认返回text结果.
     * 当res.ok为false时,丢出异常,异常信息是res.text()的文本信息.
     * 后面需要继续调用.then()来处理结果,也可以调用.catch()处理异常
     * @param {string} url 请求url
     * @param {any|FormData} para json对象或者FormData对象,转化为url参数
     * @param {RequestInit} initCfg fetch请求配置对象.例如传headers:{'Auth':'xxx'}用来验证
     * @param {string} resType 返回值类型 默认"html",可选"json"
     * @returns {Promise} fetch()方法返回的Promise对象
     */
    _$.get = (url, para, initCfg = null, resType = 'html') => {
        let eurl = initGet(url, para);
        return fetch(eurl, initCfg)
            .then(res => {
                if (res.ok)
                    return resType != 'html' ? res.json() : res.text();
                else
                    throw new Error(res.text());
            });
    };
})(window);