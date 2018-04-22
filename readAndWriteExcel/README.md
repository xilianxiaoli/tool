### node 对excel读取与写入的简单操作
使用 [`node-xlsx`](https://github.com/mgcrea/node-xlsx),基于 [`js-xlsx`](https://github.com/SheetJS/js-xlsx)做了简单的封装

### node-xlsx 简单介绍
该库封装了两个方法

- `xlsx.parse()` 从文件中读取
- `xlsx.build([{name: "mySheetName", data: data}])` 将data转换成 buffer，注 `data` 要是二维数组对象

还有一步，我们需要将buffer写入文件中

`fs.writeFileSync('filename-excel.xlsx', buffer, 'binary')`

简单的Excel操作就完成啦~~

需要对Excel进行复杂操作的建议直接使用 `js-xlsx`


