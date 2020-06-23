// ==UserScript==
// @name                115RenamePlus
// @namespace           https://github.com/LSD08KM/115RenamePlus
// @version             0.8.3
// @description         115RenamePlus(根据现有的文件名<番号>查询并修改文件名)
// @author              db117, FAN0926, LSD08KM
// @include             https://115.com/*
// @domain              javbus.com
// @domain              buscdn.cam
// @domain              avmoo.host
// @domain              avsox.host
// @domain              adult.contents.fc2.com
// @grant               GM_notification
// @grant               GM_xmlhttpRequest
// ==/UserScript==

    /*
     * @param suffix            后缀，就是扩展名
     */
(function () {
    // 按钮
    let rename_list = `
            <li id="rename_list">
                <a id="rename_all_javbus_date" class="mark" href="javascript:;">改名javbus</a>
                <a id="rename_all_avmoo_date" class="mark" href="javascript:;">改名avmoo</a>
                <a id="rename_all_Fc2_date" class="mark" href="javascript:;">改名FC2</a>
            </li>
        `;
    /**
     * 添加按钮的定时任务
     */
    let interval = setInterval(buttonInterval, 1000);

    // javbus
    let javbusBase = "https://www.buscdn.cam/";
    // 有码
    let javbusSearch = javbusBase + "search/";
    // 无码
    let javbusUncensoredSearch = javbusBase + "uncensored/search/";

    // avmoo
    // 有码
    let avmooSearch = "https://avmoo.host/cn/search/";
    // 无码
    let avmooUncensoredSearch = "https://avsox.host/cn/search/";

    //FC2
    let Fc2Search = "https://adult.contents.fc2.com/article/";
    'use strict';

    /**
     * 添加按钮定时任务(检测到可以添加时添加按钮)
     */
    function buttonInterval() {
        let open_dir = $("div#js_float_content li[val='open_dir']");
        if (open_dir.length !== 0 && $("li#rename_list").length === 0) {
            open_dir.before(rename_list);
            $("a#rename_all_javbus_date").click(
                function () {
                    rename(rename_javbus, true);
                });
            $("a#rename_all_avmoo_date").click(
                function () {
                    rename(rename_avmoo, true);
                });
            $("a#rename_all_Fc2_date").click(
                function () {
                    rename(rename_Fc2, true);
                });
            console.log("添加按钮");
            // 结束定时任务
            clearInterval(interval);
        }
    }

    /**
     * 执行改名方法
     * @param call       回调函数
     * @param addDate   是否添加时间
     */
    function rename(call, addDate) {
        // 获取所有已选择的文件
        let list = $("iframe[rel='wangpan']")
            .contents()
            .find("li.selected")
            .each(function (index, v) {
                let $item = $(v);
                // 原文件名称
                let file_name = $item.attr("title");
                // 文件类型
                let file_type = $item.attr("file_type");

                // 文件id
                let fid;
                // 后缀名
                let suffix;
                if (file_type === "0") {
                    // 文件夹
                    fid = $item.attr("cate_id");
                } else {
                    // 文件
                    fid = $item.attr("file_id");
                    // 处理后缀
                    let lastIndexOf = file_name.lastIndexOf('.');
                    if (lastIndexOf !== -1) {
                        suffix = file_name.substr(lastIndexOf, file_name.length);
                    }
                }

                if (fid && file_name) {
                    let VideoCode = getVideoCode(file_name);
                    console.log("传回:" + VideoCode.fh);
                    if (VideoCode.fh) {
                        // 校验是否是中文字幕
                        let chineseCaptions = checkChineseCaptions(VideoCode.fh, file_name);
                        // 执行查询
                        console.log("开始查询");
                        call(fid, VideoCode.fh, suffix, chineseCaptions, VideoCode.part, addDate);
                    }
                }
            });
    }

    /**
     * 通过javbus进行查询
     */
    function rename_javbus(fid, fh, suffix, chineseCaptions, part, addDate) {
        requestJavbus(fid, fh, suffix, chineseCaptions, part, addDate, javbusSearch);
    }

    /**
     * 请求javbus,并请求115进行改名
     * @param fid               文件id
     * @param fh                番号
     * @param suffix            后缀
     * @param chineseCaptions   是否有中文字幕
     * @param searchUrl               请求地址
     * @param addDate              是否添加时间
     */
    function requestJavbus(fid, fh, suffix, chineseCaptions, part, addDate, searchUrl) {
        let title;
        let fh_o;   //网页上的番号
        let date;
        let moviePage;
        let actors = [];
        let url_s = searchUrl + fh;


        let getJavbusSearch = new Promise((resolve, reject) => {
            console.log("处理搜索页 " + url_s);
            GM_xmlhttpRequest({
                method: "GET",
                url: url_s,
                onload: xhr => {
                    let response = $(xhr.responseText);
                    // 标题
                    title = response
                        .find("div.photo-frame img")
                        .attr("title");
                    // 番号
                    fh_o = response
                        .find("div.photo-info date:first")
                        .html();
                    // 时间
                    date = response
                        .find("div.photo-info date:last")
                        .html();
                    // 详情页
                    moviePage = response
                        .find("a.movie-box")
                        .attr("href");
                    console.log("获取到 " + title + fh_o + date);
                    console.log("详情页 " + moviePage);
                    resolve(moviePage);
                }
            });
        });

        function getJavbusDetail(){
            return new Promise((resolve, reject) => {
                console.log("处理详情页 " + moviePage);
                if(moviePage){                    
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: moviePage,
                        onload: xhr => {
                            let response = $(xhr.responseText);
                            // 演员们
                            let actorTags = response.find("div.star-name").each(function(){
                                actors.push($(this).find("a").attr("title"));
                            });
                            console.log('演员 '+actors);
                            /*
                            for ( let actor of actorTags) {
                                actors.push(actor.find("a").attr("title"));
                            }
                            */
                            resolve();                                       
                        }
                    });
                }else{
                    resolve(); 
                }
            });
        }

        function getName(){
            return new Promise((resolve, reject) => {
                if(moviePage){
                    console.log("开始改名 ");
                    let actor = actors.toString();
                    console.log(actor);
                    // 构建新名称
                    let newName = buildNewName(fh_o, suffix, chineseCaptions, part, title, date, actor, addDate);
                    if (newName) {
                        // 修改名称
                        send_115(fid, newName, fh_o);
                    }
                    console.log(newName);
                    resolve(newName);    
                }else if (searchUrl !== javbusUncensoredSearch) {
                    console.log("查询无码 " + searchUrl);
                    // 进行无码重查询
                    requestJavbus(fid, fh, suffix, chineseCaptions, part, addDate, javbusUncensoredSearch);
                }else {
                    resolve("没有查到结果");
                }
            });
        }

        getJavbusSearch.then(getJavbusDetail)
            .then(getName,getName)
            .then(function(result){
                console.log("结束 " + result);
            });
    }
    
    /**
     * 通过avmoo进行查询
     */
    function rename_avmoo(fid, fh, suffix, chineseCaptions, part, addDate) {
        requestAvmoo(fid, fh, suffix, chineseCaptions, part, addDate, avmooSearch);
    }

    /**
     * 请求avmoo,并请求115进行改名
     * @param fid               文件id
     * @param fh                番号
     * @param suffix            后缀
     * @param chineseCaptions   是否有中文字幕
     * @param addDate           是否带时间
     * @param searchUrl         请求地址
     */
    function requestAvmoo(fid, fh, suffix, chineseCaptions, part, addDate, searchUrl) {
        let title;
        let fh_o;   //网页上的番号
        let date;
        let moviePage;
        let actors = [];
        let url_s = searchUrl + fh;

        let getAvmooSearch = new Promise((resolve, reject) => {
            console.log("处理搜索页 " + url_s);
            GM_xmlhttpRequest({
                method: "GET",
                url: url_s,
                onload: xhr => {
                    let response = $(xhr.responseText);
                    if (!(response.find("div.alert").length)) {
                        // 标题
                        title = response
                            .find("div.photo-frame img")
                            .attr("title");
                        // 番号
                        fh_o = response
                            .find("div.photo-info date:first")
                            .html();
                        // 时间
                        date = response
                            .find("div.photo-info date:last")
                            .html();
                        // 详情页
                        moviePage = response
                            .find("a.movie-box")
                            .html();
                        console.log(title + fh_o + date);
                        resolve(moviePage);
                    }
                }
            });
        });

        function getAvmooDetail(){
            return new Promise((resolve, reject) => {
                console.log("处理影片页 " + url_s);
                if(moviePage){                    
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: moviePage,
                        onload: xhr => {
                            let response = $(xhr.responseText);
                            // 演员们
                            let actorTags = response.find("a.avatar-box").each(function(){
                                actors.push($(this).find("span").html());
                            });
                            console.log(actors);
                            resolve(); 
                        }
                    });
                
                }else{
                    resolve(); 
                }
            });
        }
   
        function getName(){
            return new Promise((resolve, reject) => {
                if(moviePage){
                    let actor = actors.toString();
                    console.log(actor);
                    // 构建新名称
                    let newName = buildNewName(fh_o, suffix, chineseCaptions, part, title, date, actor, addDate);
                    if (newName) {
                        // 修改名称
                        send_115(fid, newName, fh_o);
                    }
                    console.log(newName);
                    resolve(newName);    
                } else if (searchUrl !== avmooUncensoredSearch) {
                    // 进行无码重查询
                    requestAvmoo(fid, fh, suffix, chineseCaptions, part, addDate, avmooUncensoredSearch);
                }else {
                    resolve("没有查到结果");
                }
            });
        }

        getAvmooSearch.then(getAvmooDetail)
            .then(getName)
            .then(function(result){
                console.log("结束 " + result);
            });
    }
                            

    /**
     * 通过FC2进行查询
     */
    function rename_Fc2(fid, fh, suffix, chineseCaptions, part, addDate) {
        requestFC2(fid, fh, suffix, chineseCaptions, part, addDate, Fc2Search);
    }

    /**
     * 请求FC2,并请求115进行改名
     * @param fid               文件id
     * @param fh                番号
     * @param suffix            后缀
     * @param chineseCaptions   是否有中文字幕
     * @param addDate           是否带时间
     * @param searchUrl         请求地址
     */
    function requestFC2(fid, fh, suffix, chineseCaptions, part, addDate, searchUrl) {
        GM_xmlhttpRequest({
            method: "GET",
            url: searchUrl + fh +"/",
            onload: xhr => {
                // 匹配标题
                let response = $(xhr.responseText);
                let title = response
                    .find("div.items_article_MainitemThumb img")
                    .attr("title");
                // 卖家
                let user = response
                            .find("div.items_article_headerInfo > ul > li a:last ")
                            .html();
                // 上架时间 上架时间 : 2020/06/17
                let date = response
                            .find("div.items_article_Releasedate p")
                            .html();
                date = date.replace(/\s+/g,"").replace(/:/g, "").replace(/\//g, "-");
                console.log(title);
                console.log(date);
                console.log("user " + user);
                
                if (title) {
                    // 构建新名称
                    fh = "FC2-PPV-" + fh
                    let newName = buildNewName(fh, suffix, chineseCaptions, part, title, date, user, addDate);
                    if (newName) {
                        // 修改名称
                        send_115(fid, newName, fh);
                    }
                } else if (searchUrl !== javbusUncensoredSearch) {
                    GM_notification(getDetails(fh, "商品页可能已消失"));
                    // 进行无码重查询
                    requestJavbus(fid, fh, suffix, chineseCaptions, part, javbusUncensoredSearch);
                }
            }
        })
    }

    /**
     * 构建新名称：番号 中文字幕 日期 标题
     * @param fh                番号
     * @param suffix            后缀，扩展名
     * @param chineseCaptions   是否有中文字幕
     * @param title             番号标题
     * @param date              日期
     * @param actor             演员
     * @param addDate           是否加日期
     * @returns {string}        新名称
     */
    function buildNewName(fh, suffix, chineseCaptions, part, title, date, actor, addDate) {
        if (title) {
            let newName = String(fh);
            // 有中文字幕
            if (chineseCaptions) {
                newName = newName + "-C";
            }
            if (part){
                newName = newName + "_" +  part;
            }
            // 有演员
            if (actor) {
                newName = newName + " " + actor;
            }
            // 拼接标题
            newName = newName + " " + title;
            // 有时间
            if (addDate && date) {
                newName = newName + " " + date;
            }
            if (suffix) {
                // 文件保存后缀名
                newName = newName + suffix;
            }
            return newName;
        }
    }

    /**
     * 请求115接口改名
     * @param id 文件id
     * @param name 要修改的名称
     * @param fh 番号
     */
    function send_115(id, name, fh) {

        let file_name = stringStandard(name);
        $.post("https://webapi.115.com/files/edit", {
                fid: id,
                file_name: file_name
            },
            function (data, status) {
                let result = JSON.parse(data);
                if (!result.state) {
                    GM_notification(getDetails(fh, "修改失败"));
                    console.log("请求115接口异常: " + unescape(result.error
                        .replace(/\\(u[0-9a-fA-F]{4})/gm, '%$1')));
                } else {
                    GM_notification(getDetails(fh, "修改成功"));
                    console.log("修改文件名称,fh:" + fh, "name:" + file_name);
                }
            }
        );
    }

    /**
     * 通知参数
     * @param text 内容
     * @param title 标题
     * @returns {{text: *, title: *, timeout: number}}
     */
    function getDetails(text, title) {
        return {
            text: text,
            title: title,
            timeout: 1000
        };
    }

    /**
     * 115名称不接受(\/:*?\"<>|)
     * @param name
     */
    function stringStandard(name) {
        return name.replace(/\\/g, "")
            .replace(/\//g, " ")
            .replace(/:/g, " ")
            .replace(/\?/g, " ")
            .replace(/"/g, " ")
            .replace(/</g, " ")
            .replace(/>/g, " ")
            .replace(/\|/g, "")
            .replace(/\*/g, " ");
    }

    /**
     * 校验是否为中文字幕
     * @param fh    番号
     * @param title 标题
     */
    function checkChineseCaptions(fh, title) {
        if (title.indexOf("中文字幕") !== -1) {
            return true;
        }
        let regExp = new RegExp(fh + "[_-]?C");
        let match = title.toUpperCase().match(regExp);
        if (match) {
            return true;
        }
    }

    /**
     * 获取番号
     * @param title         源标题
     * @returns {string}    提取的番号
     */
    function getVideoCode(title) {
        title = title.toUpperCase();
        // 判断是否多集
        let part;  //FHD1 hhb1
        if (!part) {
            part = title.match(/CD\d{1,2}/);            
        }if (!part) {
            part = title.match(/HD\d{1,2}/);            
        }if (!part) {
            part = title.match(/FHD\d{1,2}/);
        }if (!part) {
            part = title.match(/HHB\d{1,2}/);
        }
        if (part){
            part = part.toString().match(/\d+/).toString();
            console.log("识别多集:" + part);
        }


        title = title.replace("SIS001", "")
            .replace("1080P", "")
            .replace("720P", "")
            .replace("[JAV] [UNCENSORED]","")
            .replace("[THZU.CC]","")
            .replace("[22SHT.ME]","")
            .replace("[7SHT.ME]","")
            .replace("HHB","-")
            .replace("FHD","-")
            .replace("HD","-");

        let t = title.match(/T28[\-_]\d{3,4}/);
        // 一本道
        if (!t) {
            t = title.match(/1PONDO[\-_]\d{6}[\-_]\d{2,4}/);
            if (t) {
                t = t.toString().replace("1PONDO_", "")
                    .replace("1PONDO-", "");
            }
        }if (!t) {
            //10MUSUME
            t = title.match(/10MUSUME[\-_]\d{6}[\-_]\d{2,4}/);
            if (t) {
                t = t.toString().replace("10MUSUME", "")
                    .replace("10MUSUME-", "");
            }
        }
        if (!t) {
            t = title.match(/HEYZO[\-_]?\d{4}/);
        }
        if (!t) {
            // 加勒比
            t = title.match(/CARIB[\-_]\d{6}[\-_]\d{3}/);
            if (t) {
                t = t.toString().replace("CARIB-", "")
                    .replace("CARIB_", "");
            }
        }if (!t) {
            // 加勒比
            t = title.match(/CARIBBEAN[\-_]\d{6}[\-_]\d{3}/);
            if (t) {
                t = t.toString().replace("CARIBBEAN-", "")
                    .replace("CARIBBEAN", "");
            }
        }
        if (!t) {
            // 东京热
            t = title.match(/N[-_]\d{4}/);
        }
        if (!t) {
            // Jukujo-Club | 熟女俱乐部
            t = title.match(/JUKUJO[-_]\d{4}/);
        }
        if (!t) {
            // FC2 PPV
            t = title.match(/FC2[-_ ]PPV[-_ ](\d{5,8})/);
            if(t){
                console.log("找到番号:" + t[0]);
                console.log("返回番号:" + t[1]);
                t = t[1];
            }
        }
        // 通用
        if (!t) {
            t = title.match(/[A-Z]{2,5}[-_]\d{3,5}/);
        }
        if (!t) {
            t = title.match(/\d{6}[\-_]\d{2,4}/);
        }
        if (!t) {
            t = title.match(/[A-Z]+\d{3,5}/);
        }
        if (!t) {
            t = title.match(/[A-Za-z]+[-_]?\d+/);
        }
        if (!t) {
            t = title.match(/\d+[-_]?\d+/);
        }
        if (!t) {
            t = title;
        }
        if (t) {
            t = t.toString().replace("_", "-");
            console.log("找到番号:" + t);
            return{
                fh: t,
                part: part  
            };
        }
    }
})();