const xlsx = require('node-xlsx').default;
const jsxlsx = require('xlsx');
const fs = require('fs')

const team = [
    {
        teamName: 'zhifu',
        head: '小明',
        member: [
            '小明', '小明1', '小明2', '小明3', '小明4'
        ]
    },
    {
        head: '小红',
        teamName: 'qianduan',
        member: [
            '小红', '小红1', '小红2', '小红3', '小红4'
        ]
    },
]

class person {
    constructor(name, money) {
        this.name = name.trim('')
        this.money = Number(money)
    }
}

const workSheetsFromFile = xlsx.parse(`${__dirname}/tt.xlsx`);
const sheetOne = workSheetsFromFile[0].data;

// 将读取到的数组转换为对象
const workData = [];
for (let item of sheetOne) {
    const p = new person(item[0], Number(item[1]));
    workData.push(p);
}

// 将相同人的金额相加
const workDataUnique = []
for (let item of workData) {
    if (workDataUnique.length === 0) {
        workDataUnique.push(item);
        continue;
    }
    let flag = true
    for (let uniqueItem of workDataUnique) {
        if (item.name === uniqueItem.name) {
            uniqueItem.money += item.money;
            flag = false;
            break;
        }
    }
    flag && workDataUnique.push(item);
}


let result = {
    'other': []
}
// 循环表格数据
for (const item of workDataUnique) {
    const name = item.name;
    const money = item.money;
    const _p = new person(name, money);
    let flag = true;
    // 循环团队
    for (const teamItem of team) {
        // 判断成员属于哪一小组，并归类
        const members = teamItem.member;
        // 循环团队成员
        for (const memberName of members) {
            if (name == memberName) {
                const tname = teamItem.teamName;
                // 团队是否已存在
                if (!result[`${tname}`]) {
                    result[`${tname}`] = []
                }

                // 当前人是否是组长
                if (name === teamItem.head) {
                    result[`${tname}`].unshift(_p)
                } else {
                    result[`${tname}`].push(_p);
                }
                flag = false;
            }
        }

    }
    flag && result[`other`].push(_p);
}

// 将对象转成二维数组
let xlsxData = [];
for (let team in result) {
    const teamValue = result[`${team}`];
    let amount = 0;
    xlsxData.push([team, '']);
    for (let p of teamValue) {
        let row = [];
        row[0] = p.name;
        row[1] = p.money;
        amount += p.money;
        xlsxData.push(row)
    }
    xlsxData.push(['小组总金额', amount])
    xlsxData.push(['', ''])
}

// 生成文档
const buffer = xlsx.build([{ name: "mySheetName", data: xlsxData }]); // Returns a buffer
fs.writeFileSync('filename-excel4.xlsx', buffer, 'binary');
