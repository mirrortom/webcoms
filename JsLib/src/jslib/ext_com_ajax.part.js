// ====================================================================
// ajax (原生: fetch())
// fetch方法返回Promise对象.
// https://github.com/matthew-andrews/isomorphic-fetch
// (详细讲解)https://www.cnblogs.com/libin-1/p/6853677.html
// ====================================================================
((win) => {
    /**
     * 简易post方式Ajax,对参数做了包装,第一个then()对请求结果判断成败,丢出异常. 内部使用fetch()方法,外部可以继续使用then(),catch().
     * @param {string} url 请求url
     * @param {any|FormData} data json对象或者FormData对象,如果是json对象,会转化成FormData对象
     * @param {RequestInit} initCfg fetch请求配置对象.例如传headers:{'Auth':'xxx'}用来验证
     * @param {string} resType 返回值类型 默认"json",可选"html"
     * @returns {Promise} fetch().then()返回的Promise对象
     */
    win.lib.post = (url, data, initCfg = null, resType = 'json') => {
        let formData = new FormData();
        if (data instanceof FormData) {
            formData = data;
        } else {
            Object.keys(data).forEach((key) => {
                formData.append(key, data[key]);
            });
        }
        let init = { method: "POST", body: formData };
        if (initCfg) {
            Object.keys(initCfg).forEach((key) => {
                init[key] = initCfg[key];
            });
        }
        //
        return fetch(url, init)
            .then(res => {
                if (res.ok)
                    return resType != 'json' ? res.text() : res.json();
                else
                    return res.text();
            });
    };
    /**
     * 简易 get方式Ajax,对para参数转换为url参数,对请求结果判断成败. 使用fetch()方法,外部可以继续使用then(),catch().
     * @param {string} url 请求url
     * @param {any|FormData} para json对象或者FormData对象,转化为url参数
     * @param {RequestInit} initCfg fetch请求配置对象.例如传headers:{'Auth':'xxx'}用来验证
     * @param {string} resType 返回值类型 默认"html",可选"json"
     * @returns {Promise} fetch()方法返回的Promise对象
     */
    win.lib.get = (url, para, initCfg = null, resType = 'html') => {
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
        let eurl = encodeURI(url);
        return fetch(eurl, initCfg)
            .then(res => {
                if (res.ok)
                    return resType != 'html' ? res.json() : res.text();
                else
                    return res.text();
            });
    };
})(window);