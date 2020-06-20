# 115RenamePlus
修改自 [115改名称]( https://greasyfork.org/zh-CN/scripts/396272-115rename ) 和 [FAN0926/JavaScript](https://github.com/FAN0926/JavaScript)

## 使用前提

必须在浏览器扩展[Tampermonkey](http://www.tampermonkey.net/)中安装使用。

支持搜索三个站点，需要保证浏览器能正常访问到。

## 功能

右击文件夹或文件，点击站点选项，自动重命名。

<img src="https://github.com/LSD08KM/115RenamePlus/blob/master/img/00.png" style="zoom:50%;" />

支持多选。

### 改名后的格式为：

```
编号-C 演员们 标题 发行日
```
例如
```
ABC-123-C 演员1,演员2 标题 2000-01-01
```

- 编号是网站所显示的标准编号
- 原文件名的编号后如果有“中文字幕”、“-C”、“_C”、“C”，改名后会在编号后加上-C
- 多个演员时用,分割。
  - FC2无法获取演员名，获取的是卖家名。
- 在文件名最后加上发行日