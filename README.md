# 115RenamePlus
修改自 [115改名称]( https://greasyfork.org/zh-CN/scripts/396272-115rename ) 和 [FAN0926/JavaScript](https://github.com/FAN0926/JavaScript)

## 使用前提

必须在浏览器扩展[Tampermonkey](http://www.tampermonkey.net/)中安装使用。

支持搜索4个站点，需要保证浏览器能正常访问到。（特别是mgstage，需要先访问一次网站，把是否满18岁的提示通过以后，才能正常使用）

## 功能

右击文件夹或文件，点击站点选项，自动重命名。

<img src="https://github.com/LSD08KM/115RenamePlus/blob/master/img/01.png" height="230px;" />


尽量使用**视频改名avmoo+javbus**：由于javbus搜索引擎排序偶尔有误、avmoo演员名不全，所以用avmoo匹配编号之后，在javbus获取详细信息。

**格式化视频分段**： 由于为了防止与-C中文字幕格式冲突，识别多集视频时没考虑-A、-B、-C这种格式。当影片原有分段格式是-A、-B、-C这种类型时，需要先点此选项格式化分段为_P1  _P2 _P3后，再刷新网页，选择其他改名选项。

支持多选。

支持javbus、avmoo、FC2、mgstage 。

### 改名后的格式为：

~~编号-4k-C_集数 演员们 标题 发行日~~

编号-CD集数-C-4k 演员们 标题 发行日


例如
```
ABC-123-CD2-C-4k 演员1,演员2 标题 2000-01-01
```

- 编号是网站所显示的标准编号
- 原文件名存在多集字符时，例如”CD1”、”HD2”、”FHD3”、”hhb4”，改名后会在编号后加上”-CD集数”
- 原文件名的编号后如果有“-4K”、“H264版”、“VP6版”，改名后会在编号后加上"-4k"
- 原文件名的编号后如果有“中文字幕”、“-C”、“_C”、“C”，改名后会在编号后加上"-C"

- 多个演员时用,分割。
  - FC2无法获取演员名，获取的是卖家名。
- 在文件名最后加上发行日


## 你领红包，我得赏金

不是打赏
<img src="https://github.com/LSD08KM/115RenamePlus/blob/master/img/red.jpg" height="500px;" />

