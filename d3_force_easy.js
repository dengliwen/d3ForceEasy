(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.d3ForceEasy = global.d3ForceEasy || {}));
}(this, (function (exports) {
    'use strict';
    const defaultOption = {
        dom: document.getElementsByTagName('body'),
        color: '#000',
        nodes: [],
        links: [],
        icons: []
    }

    function drawForce(option = defaultOption) {
        const dom = option.dom;
        const height = dom.offsetHeight;
        const width = dom.offsetWidth;
        const links = option.links;
        const nodes = option.nodes;

        const color = (d, i) => {
            const scale = d3.schemeCategory10;
            return scale[i];
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

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));

        const svg = d3.select(`#${option.dom.id}`).append('svg')
            .attr("viewBox", [0, 0, width, height]);

        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", 1);

        let node = svg.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .attr('class', 'force-node')
            .call(drag(simulation));
        if (option.icons.length) {
            svg.selectAll('.force-node')
                .append('rect')
                .attr('width', 25)
                .attr('height', 30)
                .attr('fill','#fff');

            svg.selectAll('.force-node')
                .append('path')
                .attr("d", d => {
                    return option.icons.find(item => {
                        return item.type == d.type
                    }).icon;
                })
                .attr('class','icon-path')
                .attr("fill", option.color)
                .attr('transform','scale(0.03)')

        } else {
            svg.selectAll('.force-node')
                .append("circle")
                .attr("r", 5)
                .attr("fill", color)
                .call(drag(simulation));
        }

        const text = svg.selectAll('.force-node')
            .append('text')
            .text(d=>d.name)
            .attr('style', d=>{
                let trans = 0;
                trans = d.name.length*3;
                return `transform: translate(-${trans}px, 42px);`
            })


        node.append("title")
            .text(d => d.name);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("transform", d => `translate(${d.x-10},${d.y-10})`);

            // text.attr("x", d => d.x)
            //     .attr("y", d => d.y)
        });
    }

    exports.drawForce = drawForce;
})))




