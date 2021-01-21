(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.d3ForceEasy = global.d3ForceEasy || {}));
}(this, (function (exports) {
    'use strict';
    const option = {
        dom: document.getElementsByTagName('body'),
        color: '',
        nodes: [],
        links: [],
        icons: [],
        text:{
            show:true,
            style:''
        },
        alpha:1,//衰减系数，[0,1]之间,越小迭代次数越多，0时迭代不会停止。
        // forceParams:{ //力导向参数
        //     center:{
        //         x:0,
        //         y:0
        //     },//向心力
        //     collide:{
        //         radius:1,
        //         strength:1,//[0,1]碰撞强度
        //     },//碰撞力
        //     link:{
        //         distance:0,
        //         strength:0,
        //         id:'index',//links使用标识
        //     },//弹簧模型
        //     charge:{
        //         strength:-30,//负值相互排斥
        //     },//电荷力模型
        // }
    }

    const defaultIcon = 'M512 42.666667C252.288 42.666667 42.666667 252.288 42.666667 512s209.621333 469.333333 469.333333 469.333333 469.333333-209.621333 469.333333-469.333333S771.712 42.666667 512 42.666667z m0 611.712A142.890667 142.890667 0 0 1 369.621333 512 142.890667 142.890667 0 0 1 512 369.621333 142.890667 142.890667 0 0 1 654.378667 512 142.890667 142.890667 0 0 1 512 654.378667z'



    function extend(o, n, override) {
        for (let p in n) {
            if (n.hasOwnProperty(p) && (!o.hasOwnProperty(p) || override))
                o[p] = n[p];
        }
    }



    const drag = simulation => {

        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    const color = (d, i) => {
        const scale = d3.schemeCategory10;
        return scale[i];
    }

    let simulation,node,link,text,svg;

    function drawForce(userOption) {
        extend(option,userOption,true);

        const dom = option.dom;
        const height = dom.offsetHeight;
        const width = dom.offsetWidth;
        const links = option.links;
        const nodes = option.nodes;



         simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).distance(200))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));


         svg = d3.select(`#${option.dom.id}`).append('svg')
            .attr("viewBox", [0, 0, width, height]);

        const marker = svg.append("marker")
            .attr("id", "resolved")
            .attr("markerUnits","userSpaceOnUse")
            .attr("viewBox", "0 -5 10 10")//坐标系的区域
            .attr("refX",20)//箭头坐标
            .attr("refY", 0)
            .attr("markerWidth", 12)//标识的大小
            .attr("markerHeight", 12)
            .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
            .attr("stroke-width",2)//箭头宽度
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")//箭头的路径
            .attr('fill','#8d8a8e');//箭头颜色


         link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
             .attr("marker-end", "url(#resolved)")
            .attr("stroke-width", 1);

         node = svg.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .attr('class', 'force-node')
            .call(drag(simulation))

            node.append('rect')
            .attr('width', 25)
            .attr('height', 30)
            .attr('fill','#ffffff')

            node.append('path')
            .attr("d", d => {
                if(option.icons.length){
                    return option.icons.find(item => {
                        return item.type == d.type
                    }).icon;
                }else{
                    return defaultIcon
                }

            })
            .attr('class','icon-path')
            .attr("fill", option.color || color)
            .attr('transform','scale(0.03)')

            node.append('text')
            .text(d=>d.name)
            .attr('class','node-text')
            .attr('style', d=>{
                let trans = d.name.length*3;
                return `transform: translate(-${trans}px, 42px);`
            });


        if(!option.text.show){
            svg.selectAll('.node-text').attr('style','display:none')
        }


        node.append("title")
            .text(d => d.name);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("transform", d => `translate(${d.x-15},${d.y-15})`);

            // text.attr("x", d => d.x)
            //     .attr("y", d => d.y)
        });
    }

    function addNodes(sourceId,newNodes){
        let sourceIndex = 0;
        let diff = {};
        let action = false;
        option.nodes.forEach((d,i)=>{
            diff[d.name] = 'index'+ i;
            if(d.id == sourceId)
                sourceIndex = i
        })
        newNodes.forEach(d=>{
            if(!diff[d.name]){
                option.nodes.push(d);
                option.links.push({source:sourceIndex,target:option.nodes.length-1})
                action = true;
            }else{
                let newlink = {source:sourceIndex,target:diff[d.name].split('index')[1]*1};

                if(option.links.find(d=>{
                        return JSON.stringify(d.source.index+','+d.target.index) === JSON.stringify(newlink.source+','+newlink.target)
                    })
                ){
                    //is same link
                }else{
                option.links.push(newlink)
                    action = true
                }

            }
        })

        if(!action){
            console.log('no new force')
            return
        }



        link = link.data(option.links).enter()
            .append("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1)
            .attr("marker-end", "url(#resolved)")
            .merge(link);

        node = node.data(option.nodes,d=>d.name).enter()
            .append("g")
            .attr('class', 'force-node')
            .merge(node)
            .call(drag(simulation))

            node.selectAll('rect').remove();
            node.selectAll('path').remove();
            node.selectAll('text').remove();

            node.append('rect')
                .attr('width', 25)
                .attr('height', 30)
                .attr('fill','#fff')

            node.append('path')
                .attr("d", d => {
                    if(option.icons.length){
                        return option.icons.find(item => {
                            return item.type == d.type
                        }).icon;
                    }else{
                        return defaultIcon
                    }
                })
                .attr('class','icon-path')
                .attr("fill", option.color||color)
                .attr('transform','scale(0.03)')

            node.append('text')
                .text(d=>d.name)
                .attr('class','node-text')
                .attr('style', d=>{
                    let trans = d.name.length*3;
                    return `transform: translate(-${trans}px, 42px);`
                });




        simulation.nodes(option.nodes)
        simulation.force("link", d3.forceLink(option.links).distance(200))
        simulation.restart();

    }

    exports.drawForce = drawForce;
    exports.addNodes = addNodes;

    Object.defineProperty(exports, '__esModule', { value: true });
})))




