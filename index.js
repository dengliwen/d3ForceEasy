import * as d3 from 'd3'

const defaultOption = {
    dom:document.getElementsByTagName('body'),
    color:'#000',
    nodes:[],
    links:[]
}

function drawForce(option = defaultOption){
    const dom = option.dom;
    const height = dom.offsetHeight;
    const width = dom.offsetWidth;
    const links = option.links;
    const nodes = option.nodes;

    const color = d => {
        const scale = d3.schemeCategory10;
        return scale[d.type];
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
            event.subject.fx =  event.x;
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

    const svg = d3.select("#forceView").append('svg')
        .attr("viewBox", [0, 0, width, height]);

    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width",1);

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", color)
        .call(drag(simulation));

    node.append("title")
        .text(d => d.name);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
}

export {drawForce}