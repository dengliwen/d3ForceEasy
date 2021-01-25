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
        icons: [],//[],'circle'
        zoom:true,
        zoomRange:[1,8],
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

    const defaultIcon = 'M938.666667 512A426.666667 426.666667 0 1 1 512 85.333333a426.666667 426.666667 0 0 1 426.666667 426.666667z'



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

    let simulation,node,link,text,svg,stage_g,currentClick,width,height;

    function drawForce(userOption) {
        extend(option,userOption,true);

        const dom = option.dom;
         height = dom.offsetHeight;
         width = dom.offsetWidth;

        function zoomed(event) {
            const {transform} = event;
            stage_g.attr('transform',`translate(${transform.x},${transform.y}),scale(${transform.k})`)
        }

        const zoom = d3.zoom()
            .scaleExtent(option.zoomRange)
            .on("zoom", zoomed);

         simulation = d3.forceSimulation(option.nodes)
            .force("link", d3.forceLink(option.links).distance(200))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));


         svg = d3.select(`#${option.dom.id}`).append('svg')
             .attr('id','d3ForceEasyStage')
            .attr("viewBox", [0, 0, width, height])
             .call(zoom);

        stage_g = svg.append('g').classed('stage-g',true);




        const marker = stage_g.append("marker")
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
            .attr("d", "M0,-3L10,0L0,3L3,0")//箭头的路径
            .attr('fill','#8d8a8e');//箭头颜色


         link = stage_g.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(option.links)
            .join("line")
             .attr("marker-end", "url(#resolved)")
            .attr("stroke-width", 1);

         node = stage_g.append("g")
            .selectAll("g")
            .data(option.nodes,d=>d.id)
            .join("g")
            .classed('force-node',true)
             .on('click',(e,d)=>{
                 currentClick = d;
                 node.selectAll('circle').classed('selected',item=>item == d)
             })
            .call(drag(simulation))

            node.append('circle')
            .attr('r', 15)
            .attr('cx', 15)
            .attr('cy', 15)
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
            .classed('icon-path',true)
            .attr("fill", option.color || color)
            .attr('transform','scale(0.03)')

            node.append('text')
            .text(d=>d.name)
            .classed('node-text',true)
                .classed('hide',!option.text.show)
            .attr('style', d=>{
                let trans = d.name.length*3;
                return `transform: translate(-${trans}px, 42px);`
            });




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

        node = node.data(option.nodes,d=>d.id).enter()
            .append("g")
            .classed('force-node',true)
            .merge(node)
            .on('click',(e,d)=>{
                currentClick = d;
                node.selectAll('circle').classed('selected',item=>item == d)
            })
            .call(drag(simulation))

            node.selectAll('rect').remove();
            node.selectAll('path').remove();
            node.selectAll('text').remove();

        node.append('circle')
            .attr('r', 15)
            .attr('cx', 15)
            .attr('cy', 15)
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
                .classed('icon-path',true)
                .attr("fill", option.color||color)
                .attr('transform','scale(0.03)')

            node.append('text')
                .text(d=>d.name)
                .classed('node-text',true)
                .classed('hide',!option.text.show)
                .attr('style', d=>{
                    let trans = d.name.length*3;
                    return `transform: translate(-${trans}px, 42px);`
                });




        simulation.nodes(option.nodes)
        simulation.force("link", d3.forceLink(option.links).distance(200)).force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));
        simulation.restart();

    }

    function toggleName(){
        option.text.show = !option.text.show;
        svg.selectAll('.node-text').classed('hide',!option.text.show)
    }

    function removeNode(){
        let item = currentClick;
        let index = option.nodes.findIndex(d=>d.id==item.id)
        option.nodes.splice(index,1);

        for(let i = option.links.length-1;i>=0;i--){
            if((option.links[i].source.id == item.id) ||(option.links[i].target.id == item.id)){
                option.links.splice(i,1)
            }
        }

        node.data(option.nodes,d=>d.id).exit().remove();
        link.data(option.links).exit().remove();

        // simulation.nodes(option.nodes)
        // simulation.force("link", d3.forceLink(option.links).distance(200))
        // simulation.restart();
    }

    exports.drawForce = drawForce;
    exports.addNodes = addNodes;
    exports.toggleName = toggleName;
    exports.removeNode = removeNode;
    exports.currentNode = ()=>{return currentClick};

    Object.defineProperty(exports, '__esModule', { value: true });
})))




