//the group that will use these margins will not constrain elements in it
const margin = {top:50, right:30, bottom:30, left: 30};
const width  = 900 - margin.left - margin.right,
			height = 800 - margin.top - margin.bottom;
//popup
const tooltip = d3.select('body').append('div')
										.attr('class','toolTip')//set important styling
										.style('position','absolute')
										.style('opacity','0');//start off hidden

// set dims, make bkg, titles of graph
const svg = d3.select('.svgchart')
		.attr('width',width + margin.left + margin.right)
		.attr('height',height + margin.top + margin.bottom);
//bkg
svg.append('rect')
		.attr('class','chartBkg')
		.attr('width',width + margin.left + margin.right)
		.attr('height',height + margin.top + margin.bottom)
		.attr('rx','15')
		.attr('ry','15');
//main title and details
svg.append('text')
		.attr('class', 'chartTitle')
		.text('Force Directed Graph')
		.attr('x', 15)
		.attr('y', 30);

const linksGroup = svg.append('g')//make a group within the svg to make use of margins from top left origin point of the group
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
const nodesDiv = d3.select('.flagsHolder')//grab div on top of svg to hold <img> nodes
		.style('position','absolute')//can't be static, must be removed from document flow, but remember it still is within it's containing block.
		.style('width', width + margin.left + margin.right +'px')
		.style('height', height + margin.top + margin.bottom +'px');

//retrieve the data from somewhere, make error checks, then use it to finish setting up scales before making the graph
// d3.json('resources/data.json', function(error,data){ //paths from js are from the page
d3.json('https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json', function(error,data){ //paths from js are from the page
	if(error)console.log(error);//super important. display error if found!!
	//format data:
	const nodes = data.nodes;
	const links = data.links;
	//make force object		
	const force = d3.layout.force()
		.size([width,height])
		.nodes(nodes)
		.links(links)
		.charge(-100)
		.gravity(.1)
		.linkDistance(70);
	//add links and nodes to their containers using appropriate data
	const link = linksGroup.selectAll('.link')//arbitrary class name
			.data(links)
		.enter().append('line')
			.attr('class','link');
	const node = nodesDiv.selectAll('.node')
			.data(nodes)
		.enter().append('img')
			.attr('class', d => `node flag flag-${d.code}`)
			.call(force.drag)
			//event handling
			.on('mouseover', function(d,i){ //current datum and index
				// console.log(d);
				tooltip.html( `${d.country}` )
				//DON'T FORGET TO OFFSET THE POPUP OR IT WILL INTERFERE, causing multiple event firing
				.style('left', d3.event.pageX + 25 + 'px')//d3.event must be used to access the usual event object
				.style('top', d3.event.pageY - 20 + 'px');
				tooltip.transition()//smooth transition, from d3: https://github.com/d3/d3-3.x-api-reference/blob/master/Selections.md#transition
				.duration(700)//ms
				.style('opacity', 1);
				d3.select(this).style('opacity','0.1');
			})
			.on('mouseout', function(d,i){
				tooltip.style('opacity', 0)//reset opacity for next transition
					.style('top', '-50px');//throw off screen to prevent interference.still appears if just nuking opacity
				d3.select(this).style('opacity','1');
			});
			 
	force.on('tick',function(){
		// When this function executes, the force layout calculations have completed for the tick. various properties are now available on the nodes/links objects to use for positioning.
		node.style('left', d => `${d.x + 23}px`) //offset a little due to coordinate mismatch
				.style('top',  d => `${d.y + 40}px`);

		link.attr('x1', function(d) { return d.source.x; })
				.attr('y1', function(d) { return d.source.y; })
				.attr('x2', function(d) { return d.target.x; })
				.attr('y2', function(d) { return d.target.y; });
		
	});

	//start calculations and ticker
	force.start();

});
