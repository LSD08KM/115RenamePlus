// ==UserScript==
// @name                115RenamePlus
// @namespace           https://github.com/LSD08KM/115RenamePlus
// @version             0.8.9 
// @description         115RenamePlus(根据现有的文件名<番号>查询并修改文件名)
// @author              db117, FAN0926, LSD08KM
// @include             https://115.com/*
// @domain              javbus.com
// @domain              fanbus.blog
// @domain              busdmm.club
// @domain              seedmm.blog
// @domain              avmoo.host
// @domain              avmoo.cyou
// @domain              avsox.website
// @domain              adult.contents.fc2.com
// @domain              mgstage.com
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
				<a id="rename_video_avmoo_javbus" class="mark" href="javascript:;">视频改名avmoo+javbus</a>
                <a id="rename_video_avmoo" class="mark" href="javascript:;">视频改名avmoo</a>
                <a id="rename_video_javbus" class="mark" href="javascript:;">视频改名javbus</a>
                <a id="rename_video_FC2" class="mark" href="javascript:;">视频改名FC2</a>
                <a id="rename_video_mgstage" class="mark" href="javascript:;">视频改名mgstage</a>
				<!-- 图片改名 、 直接用番号进详情页
                <a id="rename_video_javbus_detail" class="mark" href="javascript:;">视频改名javbus详情页</a>
                <a id="rename_picture_avmoo" class="mark" href="javascript:;">图片改名avmoo</a>
                <a id="rename_picture_javbus" class="mark" href="javascript:;">图片改名javbus</a>				
				<a id="rename_picture_FC2" class="mark" href="javascript:;">图片改名FC2</a>
				<a id="rename_picture_mgstage" class="mark" href="javascript:;">图片改名mgstage</a>
				-->
            </li>
        `;
    /**
     * 添加按钮的定时任务
     */
    let interval = setInterval(buttonInterval, 1000);

    // javbus
    let javbusBase = "https://www.fanbus.blog/";
    // 有码
    let javbusSearch = javbusBase + "search/";
    // 无码
    let javbusUncensoredSearch = javbusBase + "uncensored/search/";
	
    // avmoo
    // 有码
    let avmooSearch = "https://avmoo.cyou/cn/search/";
    // 无码
    let avmooUncensoredSearch = "https://avsox.website/cn/search/";

    //FC2
    let Fc2Search = "https://adult.contents.fc2.com/article/";

    //mgstage
    let mgstageSearch = "https://www.mgstage.com/product/product_detail/";

    'use strict';

    /**
     * 添加按钮定时任务(检测到可以添加时添加按钮)
     */
    function buttonInterval() {
        let open_dir = $("div#js_float_content li[val='open_dir']");
        if (open_dir.length !== 0 && $("li#rename_list").length === 0) {
            open_dir.before(rename_list);
            $("a#rename_video_avmoo").click(
                function () {
                    rename(renameAvmoo, "avmoo", "video", true);
                });	
			$("a#rename_video_javbus").click(
			    function () {
			        rename(renameJavbus, "javbus", "video", true);
			    });	
			$("a#rename_video_FC2").click(
			    function () {
			        rename(renameFc2, "fc2", "video", true);
			    });	
			$("a#rename_video_mgstage").click(
			    function () {
			        rename(renameMgstage, "mgstage", "video", true);
			    });	
			$("a#rename_video_avmoo_javbus").click(
			    function () {
			        rename(renameAvmooJavbus, "avmoo", "video", true);
			    });	
			$("a#rename_video_javbus_detail").click(
			    function () {
			        rename(renameJavbusDetail, "javbus", "video", true);
			    });	
			$("a#rename_picture_avmoo").click(
			    function () {
			        rename(renameAvmoo, "avmoo", "picture", true);
			    });	
			$("a#rename_picture_javbus").click(
			    function () {
			        rename(renameJavbus, "javbus", "picture", true);
			    });	
			$("a#rename_picture_FC2").click(
			    function () {
			        rename(renameFc2, "fc2", "picture", true);
			    });	
			$("a#rename_picture_mgstage").click(
			    function () {
			        rename(renameMgstage, "mgstage", "picture", true);
			    });	
            console.log("添加按钮");
            // 结束定时任务
            clearInterval(interval);
        }
    }

    /**
     * 执行改名方法
     * @param call       回调函数
     * @param site      网站
     * @param rntype      改名类型 video picture
     * @param ifAddDate   是否添加时间
     */
    function rename(call, site, rntype, ifAddDate ) {
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
                        suffix = file_name.substring(lastIndexOf, file_name.length);
                        file_name = file_name.substring(0, lastIndexOf);
                    }
                }
                if (fid && file_name) {
                    let VideoCode;
					// 正则匹配番号
                    if (site == "mgstage"){
                        VideoCode = getVideoCode(file_name,"mgstage");
                    }else if (site == "fc2"){
                        VideoCode = getVideoCode(file_name,"fc2");
                    }else{
                        VideoCode = getVideoCode(file_name);
                    }
                    console.log("正则匹配番号:" + VideoCode.fh);
                    if (VideoCode.fh) {
						if ( rntype=="video" ){
							// 校验是否是中文字幕
							let ifChineseCaptions = checkifChineseCaptions(VideoCode.fh, file_name);
							// 执行查询
							console.log("开始查询");
							call(fid, rntype, VideoCode.fh, suffix, ifChineseCaptions, VideoCode.part, ifAddDate);
						} else if ( rntype=="picture" ){
							// 是图片时，向part传图片名冗余，不要中字判断，只在页面获取编号
							// 图片名冗余
							let picCaptions = getPicCaptions(VideoCode.fh, file_name);
							let ifChineseCaptions;
							// 执行查询
							console.log("开始查询");
							call(fid, rntype, VideoCode.fh, suffix, ifChineseCaptions, picCaptions, ifAddDate);
						}
                        
                    }
                }
            });
    }
    /**
     * 通过avmoo搜索+javbus详情页进行查询
	 * @param fid               文件id
	 * @param rntype      		改名类型 video picture
	 * @param fh                番号
	 * @param suffix            后缀
	 * @param ifChineseCaptions   是否有中文字幕
	 * @param part              视频分段，图片冗余文件名 
	 * @param ifAddDate              是否添加时间 
	 * @param searchUrl               请求地址
     */
    function renameAvmooJavbus(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate) {
        requestAvmooJavbus(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate, avmooSearch);
    }
    function requestAvmooJavbus(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate, searchUrl) {
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
						/*
                        // 标题
                        title = response
                            .find("div.photo-frame img")
                            .attr("title");
                        // 时间
                        date = response
                            .find("div.photo-info > span")
                            .html();
                        date = date.match(/\d{4}\-\d{2}\-\d{2}/);
						*/
                        // 番号
                        fh_o = response
                            .find("div.photo-info date:first")
                            .html();
                        // 详情页
                        moviePage = response
                            .find("a.movie-box")
                            .attr("href");
                        console.log("获取到 " + fh_o );
                        resolve(moviePage);
                    }
                }
            });
        });
        function getJavbusDetail(){
            return new Promise((resolve, reject) => {
				if ( rntype=="picture" ){
					resolve();
				} else if ( rntype=="video" ){
					if(moviePage){
						moviePage = javbusBase + fh_o;
						console.log("处理详情页：" + moviePage);
						GM_xmlhttpRequest({
							method: "GET",
							url: moviePage,
							onload: xhr => {
								let response = $(xhr.responseText);
								// 标题
								title = response
								    .find("h3")
								    .html();
								title = title.slice(fh_o.length+1);
								// 时间
								date = response
								        .find("p:nth-of-type(2)")
								        .html();
								date = date.match(/\d{4}\-\d{2}\-\d{2}/);	
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
				}
            });
        }		
        function setName(){
            return new Promise((resolve, reject) => {
                if(moviePage){
                    let actor = actors.toString();
                    console.log(actor);
                    // 构建新名称
                    let newName = buildNewName(fh_o, rntype, suffix, ifChineseCaptions, part, title, date, actor, ifAddDate);                    
                    if (newName) {
                        // 修改名称
                        send_115(fid, newName, fh_o);
						console.log("新名: "+newName);
                    }
                    resolve(newName);
                }else if (searchUrl !== javbusUncensoredSearch) {
                    console.log("查询无码 " + searchUrl);
                    // 进行无码重查询
                    requestJavbus(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate, javbusUncensoredSearch);
                }else {
                    resolve("没有查到结果");
                }
            });
        }		
        getAvmooSearch.then(getJavbusDetail)
            .then(setName,setName)
            .then(function(result){
                console.log("改名结束，" + result);
            });
    }
	
    /**
     * 通过javbus详情页进行查询
	 * 请求javbus,并请求115进行改名
	 * @param fid               文件id
	 * @param rntype      		改名类型 video picture
	 * @param fh                番号
	 * @param suffix            后缀
	 * @param ifChineseCaptions   是否有中文字幕
	 * @param part              视频分段，图片冗余文件名 
	 * @param ifAddDate              是否添加时间 
	 * @param searchUrl               请求地址
     */
    function renameJavbusDetail(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate) {
        requestJavbusDetail(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate, javbusSearch);
    }
    function requestJavbusDetail(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate, searchUrl) {
        let title;
        let date;
        let moviePage = javbusBase + fh;
        let actors = [];
		// 获取javbus详情页内信息
		let getJavbusDetail = new Promise((resolve, reject) => {
		    console.log("处理详情页：" + moviePage);
		    if(moviePage){
		        GM_xmlhttpRequest({
		            method: "GET",
		            url: moviePage,
		            onload: xhr => {
		                let response = $(xhr.responseText);
		                // 标题
		                title = response
		                    .find("h3")
		                    .html();
		                title = title.slice(fh.length+1);
		                // 时间
		                date = response
		                        .find("p:nth-of-type(2)")
		                        .html();
		                date = date.match(/\d{4}\-\d{2}\-\d{2}/);	                    
		                // 演员们
		                let actorTags = response.find("div.star-name").each(function(){
		                    actors.push($(this).find("a").attr("title"));
		                });
		                console.log('演员：'+actors);
		                resolve();
		            }
		        });
		    }else{
		        resolve();
		    }
		});
        function setName(){
            return new Promise((resolve, reject) => {
                if(moviePage){
                    let actor = actors.toString();
                    // 构建新名称
                    let newName = buildNewName(fh, suffix, ifChineseCaptions, part, title, date, actor, ifAddDate);                    
                    if (newName) {
                        // 修改名称
                        send_115(fid, newName, fh);
						console.log("新名: "+newName);
                    }
                    resolve(newName);
                }else if (searchUrl !== javbusUncensoredSearch) {
                    console.log("查询无码 " + searchUrl);
                    // 进行无码重查询
                    requestJavbus(fid, fh, suffix, ifChineseCaptions, part, ifAddDate, javbusUncensoredSearch);
                }else {
                    resolve("没有查到结果");
                }
            });
        }
        getJavbusDetail.then(setName,setName)
            .then(function(result){
                console.log("改名结束，" + result);
            });
    }
	
    /**
     * 通过javbus进行查询
	 * 请求javbus,并请求115进行改名
	 * @param fid               文件id
	 * @param rntype      		改名类型 video picture
	 * @param fh                番号
	 * @param suffix            后缀
	 * @param ifChineseCaptions   是否有中文字幕
	 * @param part              视频分段，图片冗余文件名 
	 * @param ifAddDate              是否添加时间 
	 * @param searchUrl               请求地址
     */
    function renameJavbus(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate) {
        requestJavbus(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate, javbusSearch);
    }
    function requestJavbus(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate, searchUrl) {
        let title;
        let fh_o;   //网页上的番号
        let date;
        let moviePage;
        let actors = [];
        let url_s = searchUrl + fh;
        let getJavbusSearch = new Promise((resolve, reject) => {
            console.log("处理搜索页：" + url_s);
            GM_xmlhttpRequest({
                method: "GET",
                url: url_s,
                onload: xhr => {
                    let response = $(xhr.responseText);
					/*
					// 标题
					title = response
					    .find("div.photo-frame img")
					    .attr("title");
					// 时间
					date = response
					        .find("div.photo-info > span")
					        .html();
					date = date.match(/\d{4}\-\d{2}\-\d{2}/);
					*/
                    // 番号
                    fh_o = response
                        .find("div.photo-info date:first")
                        .html();
                    // 详情页
                    moviePage = response
                        .find("a.movie-box")
                        .attr("href");
                    console.log("获取到 " +  fh_o );
                    resolve(moviePage);
                }
            });
        });
        function getJavbusDetail(){
            return new Promise((resolve, reject) => {
				if ( rntype=="picture" ){
					resolve();
				} else if ( rntype=="video" ){
					if(moviePage){
						console.log("处理详情页：" + moviePage);
						GM_xmlhttpRequest({
							method: "GET",
							url: moviePage,
							onload: xhr => {
								let response = $(xhr.responseText);
								// 标题
								title = response
								    .find("h3")
								    .html();
								title = title.slice(fh.length+1);
								// 时间
								date = response
								        .find("p:nth-of-type(2)")
								        .html();
								date = date.match(/\d{4}\-\d{2}\-\d{2}/);	
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
				}
            });
        }
        function setName(){
            return new Promise((resolve, reject) => {
                if(moviePage){
                    let actor = actors.toString();
                    console.log(actor);
                    // 构建新名称
                    let newName = buildNewName(fh_o, rntype, suffix, ifChineseCaptions, part, title, date, actor, ifAddDate);                    
                    if (newName) {
                        // 修改名称
                        send_115(fid, newName, fh_o);
						console.log("新名: "+newName);
                    }
                    resolve(newName);
                }else if (searchUrl !== javbusUncensoredSearch) {
                    console.log("查询无码 " + searchUrl);
                    // 进行无码重查询
                    requestJavbus(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate, javbusUncensoredSearch);
                }else {
                    resolve("没有查到结果");
                }
            });
        }
        getJavbusSearch.then(getJavbusDetail)
            .then(setName,setName)
            .then(function(result){
                console.log("改名结束，" + result);
            });
    }

    /**
     * 通过avmoo进行查询
     * 请求avmoo,并请求115进行改名
     * @param fid               文件id
     * @param rntype      		改名类型 video picture
     * @param fh                番号
     * @param suffix            后缀
     * @param ifChineseCaptions   是否有中文字幕
     * @param part              视频分段，图片冗余文件名 
     * @param ifAddDate              是否添加时间 
     * @param searchUrl               请求地址
     */
    function renameAvmoo(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate) {
        requestAvmoo(fid, fh, suffix, ifChineseCaptions, part, ifAddDate, avmooSearch);
    }
    function requestAvmoo(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate, searchUrl) {
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
						/*
                        // 标题
                        title = response
                            .find("div.photo-frame img")
                            .attr("title");
                        // 时间
                        date = response
                            .find("div.photo-info > span")
                            .html();
                        date = date.match(/\d{4}\-\d{2}\-\d{2}/);
						*/
                        // 番号
                        fh_o = response
                            .find("div.photo-info date:first")
                            .html();
                        // 详情页
                        moviePage = response
                            .find("a.movie-box")
                            .attr("href");
                        console.log("获取到 " + fh_o );
                        resolve(moviePage);
                    }
                }
            });
        });
        function getAvmooDetail(){
            return new Promise((resolve, reject) => {
				if ( rntype=="picture" ){
					resolve();
				} else if ( rntype=="video" ){
					if(moviePage){
						console.log("处理影片页 " + moviePage);
						GM_xmlhttpRequest({
							method: "GET",
							url: moviePage,
							onload: xhr => {
								let response = $(xhr.responseText);
								// 标题
								title = response
									.find("h3")
									.html();
								title = title.slice(fh.length+1);
								// 时间
								date = response
										.find("p:nth-of-type(2)")
										.html();
								date = date.match(/\d{4}\-\d{2}\-\d{2}/);	
								// 演员们
								let actorTags = response.find("a.avatar-box").each(function(){
									actors.push($(this).find("span").html());
								});
								console.log('演员 '+actors);
								resolve();
							},
						});
					}else{
						resolve();
					}
				}
            });
        }
        function setName(){
            return new Promise((resolve, reject) => {
                if(moviePage){
                    let actor = actors.toString();
                    console.log(actor);
                    // 构建新名称
                    let newName = buildNewName(fh_o, rntype, suffix, ifChineseCaptions, part, title, date, actor, ifAddDate);
                    if (newName) {
                        // 修改名称
                        send_115(fid, newName, fh_o);
						console.log("新名: "+newName);
                    }
                    resolve(newName);
                } else if (searchUrl !== avmooUncensoredSearch) {
                    // 进行无码重查询
                    requestAvmoo(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate, avmooUncensoredSearch);
                }else {
                    resolve("没有查到结果");
                }
            });
        }
        getAvmooSearch.then(getAvmooDetail)
            .then(setName,setName)
            .then(function(result){
                console.log("改名结束，" + result);
            });
    }

    /**
     * 通过FC2进行查询
	 * 请求FC2,并请求115进行改名
	 * @param fid               文件id
	 * @param fh                番号
	 * @param suffix            后缀
	 * @param ifChineseCaptions   是否有中文字幕
	 * @param ifAddDate           是否带时间
	 * @param searchUrl         请求地址* 
     */
    function renameFc2(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate) {
        requestFC2(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate, Fc2Search);
    }
    function requestFC2(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate, searchUrl) {
        GM_xmlhttpRequest({
            method: "GET",
            url: searchUrl + fh +"/",
            onload: xhr => {
				console.log("处理影片页 " + searchUrl + fh +"/");
                // 匹配标题
                let response = $(xhr.responseText);
                let title = response
                    .find("div.items_article_MainitemThumb img")
                    .attr("title");
				console.log("获取到标题 " + title );
                // 卖家
                let user = response
                            .find("div.items_article_headerInfo > ul > li a:last ")
                            .html();
                // 上架时间 上架时间 : 2020/06/17
                let date = response
                            .find("div.items_article_Releasedate p")
                            .html();
                date = date.replace(/\s+/g,"").replace(/:/g, "").replace(/\//g, "-");
				if ( rntype=="picture" ){
					if ( fh && title ) {
						title="";
						user="";
						date="";
					}
				}				
                fh = "FC2-PPV-" + fh;
				
                if (title) {
                    // 构建新名称
                    let newName = buildNewName(fh, rntype, suffix, ifChineseCaptions, part, title, date, user, ifAddDate);
                    if (newName) {
                        // 修改名称
                        send_115(fid, newName, fh);
                    }
                } else if (searchUrl !== javbusUncensoredSearch) {
                    GM_notification(getDetails(fh, "商品页可能已消失"));
                    // 进行无码重查询
                    // requestJavbus(fid, rntype, fh, suffix, ifChineseCaptions, part, javbusUncensoredSearch);
                }
            }
        })
    }

    /**
     * 通过mgstage进行查询
	 * 请求mgstage,并请求115进行改名
     * @param fid               文件id
     * @param fh                番号
     * @param suffix            后缀
     * @param ifChineseCaptions   是否有中文字幕
	 * @param part            是图片时，向part传图片名冗余
     * @param ifAddDate           是否带时间
     * @param searchUrl         请求地址
     */
    function renameMgstage(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate) {
        requestmgstage(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate, mgstageSearch);
    }
    function requestmgstage(fid, rntype, fh, suffix, ifChineseCaptions, part, ifAddDate, searchUrl) {
        GM_xmlhttpRequest({
            method: "GET",
            url: searchUrl + fh +"/",
            onload: xhr => {
				console.log("处理影片页 " + searchUrl + fh +"/");
                // 匹配标题
                let response = $(xhr.responseText);
                let title = response
                    .find("div.common_detail_cover > h1")
                    .html()
                    .trim();
				console.log("获取到标题 " + title );
                // 出演
                let actor = response
                            .find("div.detail_data > table:last > tbody > tr:first > td")
                            .html();
                let actors = [];
                // 判断<a>
                if (actor.toString().match(/<.*>/)) {
                    let actorTags = response.find("div.detail_data > table:last > tbody > tr:first > td > a").each(function(){
                        actors.push($(this).html().trim());
                    });
                    actors = actors.toString();
                }else{
                    actors = actor.trim();
                }
                // 品番：  200GANA-2295
				// 因界面多语言问题，无法获取
                // 配信開始日：   2020/06/23
                let date = response
                            .find("div.detail_data > table:last > tbody > tr:eq(4) > td")
                            .html()
                            .trim();
                date = date.replace(/\s+/g,"").replace(/:/g, "").replace(/\//g, "-").trim();
				if ( rntype=="picture" ){
					if ( fh && title ) {
						title="";
						actors="";
						date="";
					}
				}	
				
                if (title) {
                    // 构建新名称
                    let newName = buildNewName(fh, rntype, suffix, ifChineseCaptions, part, title, date, actors, ifAddDate);
                    if (newName) {
                        // 修改名称
                        send_115(fid, newName, fh);
                    }
                } else if (searchUrl !== javbusUncensoredSearch) {
                    GM_notification(getDetails(fh, "商品页可能已消失"));
                    // 进行无码重查询
                    // requestJavbus(fid, rntype, fh, suffix, ifChineseCaptions, part, javbusUncensoredSearch);
                }

            }
        })
    }

    /**
     * 图片名冗余
     * @param fh    番号
     * @param title 标题
     */
    function getPicCaptions(fh, title) {
        let regExp = new RegExp(fh + "[_-]?[A-Z]{1,5}");
        let match = title.toUpperCase().match(regExp);
        if (match) {
            let houzhui = title.slice( fh.length , title.length )
            console.log("找到后缀" + houzhui);
            return houzhui;
        }
    }
	
    /**
     * 校验是否为中文字幕
     * @param fh    番号
     * @param title 标题
     */
    function checkifChineseCaptions(fh, title) {
        if (title.indexOf("中文字幕") !== -1) {
            return true;
        }
        let regExp = new RegExp(fh + "[_-]?C");
        let regExp2 = new RegExp(fh + "[_-]?CD");
        let match = title.toUpperCase().match(regExp);
        let match2 = title.toUpperCase().match(regExp2);
        if (match) {
            if (match2) {} else {
                return true;
            }
        }
    }
	
    /**
     * 构建新名称：番号 中文字幕 日期 标题  文件名不超过255
     * @param fh                番号
	 * @param rntype      		改名类型 video picture
     * @param suffix            后缀，扩展名
     * @param ifChineseCaptions   是否有中文字幕
     * @param title             番号标题
     * @param date              日期
     * @param actor             演员
     * @param ifAddDate           是否加日期
     * @returns {string}        新名称
     */
    function buildNewName(fh, rntype, suffix, ifChineseCaptions, part, title, date, actor, ifAddDate) {
		if ( rntype=="video" ){
			if (title) {
				let newName = String(fh);
				// 有中文字幕
				if (ifChineseCaptions) {
					newName = newName + "-C";
				}
				if (part){
					newName = newName + "_P" +  part;
				}
				// 有演员
				if (actor) {
					newName = newName + " " + actor;
				}
				// 拼接标题 判断长度
				newName = newName + " " + title;
				if ( newName.length > 200 ){
					newName = newName.substring(0, 200);
					newName += "...";
				}
				// 有时间
				if (ifAddDate && date) {
					newName = newName + " " + date;
				}
				if (suffix) {
					// 文件保存后缀名
					newName = newName + suffix;
				}
				return newName;
			}
		} else if ( rntype=="picture" ){
			if (fh){
				let newName = String(fh);
				if (picCaptions){
				    newName = newName  +  picCaptions;
				}
				if (suffix) {
				    // 文件保存后缀名
				    newName = newName + suffix;
				}
				return newName;
			}
		}
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
     * 获取番号
     * @param title         源标题
	 * @param type			番号类型 mgstage fc2
     * @returns {string}    提取的番号
     */
    function getVideoCode(title, type="nomal") {
        title = title.toUpperCase();
        console.log("传入title: " + title);
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
        }if (!part) {
            part = title.match(/(_P){1}\d{1,2}/);
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
            .replace("BIG2048.COM","")
            .replace("FUN2048.COM@","")
            .replace(".HHB","分段")
            .replace(".FHD","分段")
            .replace(".HD","分段");
        console.log("修正后的title: " + title);
		
		let t = '';
		if (type=="mgstage"){
			console.log("分析mgstage编号");
			t = title.match(/\d{3,4}[A-Z]{3,4}[\-_]?\d{3,4}/)
			if (!t) {  // シロウトTV @SIRO-3585
				t = title.match(/[A-Z]{2,5}[\-_]{1}\d{3,5}/);
			}	
		}else if (type=="fc2"){
			console.log("分析fc2编号");
			t = title.match(/(FC2){0,1}[\-_ ]{0,1}(PPV){0,1}[\-_ ]{0,1}(\d{5,8})/);
			if(t){
				console.log("找到番号:" + t[0]);
				console.log("查找番号:" + t[3]);
				t = t[1];
			}
		}else {
			t = title.match(/T28[\-_]\d{3,4}/);
			// 一本道
			if (!t) {
				t = title.match(/1PONDO[\-_ ]\d{6}[\-_]\d{2,4}/);
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
				t = title.match(/HEYZO[\-_]{0,1}\d{4}/);
			}
			if (!t) {
				// 加勒比
				t = title.match(/CARIB[\-_ ]\d{6}[\-_]\d{3}/);
				if (t) {
					t = t.toString().replace("CARIB-", "")
						.replace("CARIB_", "");
				}
			}if (!t) {
				// 加勒比
				t = title.match(/CARIBBEAN[\-_ ]\d{6}[\-_]\d{3}/);
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
				t = title.match(/JUKUJO[\-_]\d{4}/);
			}
			
			// 通用
			if (!t) {
				t = title.match(/[A-Z]{2,5}[\-_]{0,1}\d{3,5}/);
			}
			if (!t) {
				t = title.match(/\d{6}[\-_]\d{2,4}/);
			}
			if (!t) {
				t = title.match(/[A-Z]+\d{3,5}/);
			}
			if (!t) {
				t = title.match(/[A-Za-z]+[\-_]{0,1}\d+/);
			}
			if (!t) {
				t = title.match(/\d+[\-_]{0,1}\d+/);
			}			
		}

        if (!t) {
            console.log("没找到番号:" + title);
            return false;
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
