## d3ForceEasy
< 一个封装D3js force力导向图 简单使用的轮子>

>依赖d3.js >v4.0.0
### 使用方法

    1.npm install d3_force_easy --save
    
    2.引入配置和数据
    
    import  d3ForceEasy from 'd3_force_easy'
    
    ...
    //基础配置
    const option = {
        dom:document.getElementById('app'),
        nodes:this.nodes,
        links:this.links,
        ...
    }
 
    d3ForceEasy.drawForce(option)


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

### 详细配置
```
 const option = {
        dom: document.getElementsByTagName('app'),
        color: '#00a8ff',
        nodes:this.nodes,
        links:this.links,
        icons:[{type:'ip',icon:'(svg <path>的d路径属性)'},...],
        text:{
            show:true,
            style:''
        },
        forceParams:{ //力导向参数
            center:{
                x:0,
                y:0
            },//向心力
            collide:{
                radius:1,
                strength:1,//[0,1]碰撞强度
            },//碰撞力
            link:{
                distance:0,
                strength:0,
                id:'index',//links使用标识
            },//弹簧模型
            charge:{
                strength:-30,//负值相互排斥
            },//电荷力模型
        }
}
```

### 功能

**新增节点**

    d3ForceEasy.addNodes(newNodesSourceId = 0,newNodes = [])
  
**删除选中节点**

    d3ForceEasy.removeNode()
    
**显示/隐藏名称**

    d3ForceEasy.toggleName()


升级改造中。。。