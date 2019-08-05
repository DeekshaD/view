//define variables for alignment of elements
var margin = {top: 20, right: 20, bottom:20, left: 30},
    width = 1000 - margin.right - margin.left,
    height = 700 - margin.top - margin.bottom;
var arc = {startx: 250, starty: 200, spacingx: 200, padding: 80}	
var tau = 2*Math.PI;
var radius = {"inner" : 50, "outer" : 70};

//define arc functions for foreground and background
var arc_fore = d3.arc()
	.innerRadius(radius.inner)
	.outerRadius(radius.outer)
	.startAngle(0)
	.endAngle(tau);

var arc_back = d3.arc()
	.innerRadius(radius.inner)
	.outerRadius(radius.outer)
	.startAngle(function(d) {return (-0.25+(d.mean/d.global_max))*tau; })
	.endAngle(0.75*tau);

var svgArc = d3.select("#arcs")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom);

//title of block
svgArc.append("text")
	.text("Day Highlights")
	.attr("class", "title")
	.attr("x", 0)
	.attr("y", margin.top+10)
	.attr("fill", "#515151")
	.attr("font-size", 20);

//define div for tooltip on hover for arcs
var div = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

function getBack(d, i){
	return d3.arc()
	.innerRadius(radius.inner)
	.outerRadius(radius.outer)
	.startAngle((-0.25+(d.mean/d.global_max))*tau)
	.endAngle(0.75*tau);


}


//Functions to handle mouse events
function handleMouseOver(d, i){
	div.transition()
		.duration(400)
		.style("opacity", 0.9);
	
	div.html("Average<br/>"+d.mean.toFixed(2))
		.style("left", (5+d3.event.pageX)+"px")
		.style("top", (d3.event.pageY - 20) + "px");
};


function handleMouseOut(d, i){
	div.transition()
		.duration(400)
		.style("opacity", 0);
}

//returns X and Y position for elements(arcs, texts)
function getY(i){
	if(i<3)
		return arc.starty;
	else
		return 2*arc.starty+arc.padding;
}

function getX(i){
	return ((i%3)*arc.startx)+arc.spacingx;
}

function getText(d,i){

	//return mean if not direction
	if(i < 4){
		return d.mean.toFixed(2);
	
	}
	//return compass direction for wind and storm
	else{
		var compass_dir = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW","N"]	
		var idx = d.mean % 360;
		idx = Math.round(idx/22.5);
		return compass_dir[idx];
	}
}

function getStartAngle(d,i){

	if(i < 4)
		return (-0.25+(d.mean/d.global_max))*tau; 
	else
	{
		var start = (d.mean*Math.PI/180);
		return start-tau+(tau/100);
	}
}
function getEndAngle(d,i){
	if(i<4)
		return 0.75*tau;
	else{
		var end = (d.mean*Math.PI/180);
		return end-(tau/100);
	}
}
//read data and append to svg
function drawArcs(url){
	d3.json(url).then(function(data){
	
	d3.selectAll(".g-arcs").remove();
	d3.selectAll(".g-keys").remove();
	d3.selectAll(".g-minmax").remove();

	//define and append elements for each arc diagram
	var svg = svgArc.selectAll("g arcs")
		.data(d3.values(data.weather))
		.enter()
		.append("g")
		.attr("class", "g-arcs");
	
	svg.attr("transform", function(d, i) {return "translate("+getX(i)+","+getY(i)+")";})
		.append("path")
		.attr("class", "arc1")
		.attr("d", arc_fore)
		.style("fill", "orange")
		.on("mouseover", handleMouseOver)
		.on("mouseout", handleMouseOut);

	svg.attr("transform", function(d, i) {return "translate("+getX(i)+","+getY(i)+")";})
		.append("path")
		.attr("class", "arc2")
		.attr("d", d3.arc()
				.innerRadius(radius.inner)
				.outerRadius(radius.outer)
				.startAngle(function(d,i) {return getStartAngle(d,i);})
				.endAngle(function(d,i) {return getEndAngle(d,i);}))
		.style("fill", "#ddd");

	svg.attr("transform", function(d, i) {return "translate("+getX(i)+","+getY(i)+")";})
		.append("text")
		.attr("class", "text2")
		.text(function(d, i) {return getText(d, i);})
		.attr("text-anchor", "middle");

	//define group element for text labels
	var svgKeys = svgArc.selectAll("g text-keys")
		.data(d3.keys(data.weather))
		.enter()
		.append("g")
		.attr("class", "g-keys")
		.attr("transform", function(d, i) {return "translate("+getX(i)+","+(getY(i)-100)+")";});
	
	svgKeys.append("text")
		.attr("class", "text1")
		.text(function(d) {return d;})
		.attr("text-anchor", "middle");

	//define and append elements to display min max for arcs
	var svg3 = svgArc.selectAll("g text-minmax")
		.data(d3.values(data.weather))
		.enter()
		.append("g")
		.attr("transform", function(d, i) {return "translate("+getX(i)+","+(getY(i)+100)+")";})
		.attr("class", "g-minmax");


	svg3.append("text")
		.attr("class", "text3")
		.text(function(d) {return ("min "+d.min+" | max "+d.max);})
		.attr("text-anchor", "middle");

	
	})};

