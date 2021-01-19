## d3 Force Easy
< 一个封装D3js force力导向图 简单使用的轮子>

#### 依赖d3.js
### 使用方法
```
1.npm install把d3装上

2.引入配置和数据
 import  d3ForceEasy from 'd3_force_easy'
 
 ...
 const option = {
     dom:document.getElementById('app'),
     color:'#000',
     nodes:this.nodes,
     links:this.links,
     icons:[{type:'ip',icon:'(svg <path>的d路径属性)'}]
     ...
 }
 
 d3ForceEasy.drawForce(option)
```

### 测试数据
```
const nodes = [
    {name:'2.2.2.2',id:12,type:'ip'},
    {name:'3.4.25.22',id:13,type:'ip'},
    {name:'13020002299',id:14,type:'phone'},
    {name:'asdmklasdlnlwee.pdf',id:15,type:'file'},
    {name:'sdf78f6s87d5fsud7fts87d6587r23grbusd7f78',id:16,type:'md5'},
    {name:'15838837736',id:17,type:'phone'},
]

const links = [
    {source:0,target:1},
    {source:0,target:2},
    {source:0,target:3},
    {source:3,target:4},
    {source:3,target:5},
]

```

升级改造中。。。