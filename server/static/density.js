//define scales, margin, area functions
var margin = {top: 20, right: 20, bottom: 150, left: 70},
    width = 900 - margin.right - margin.left,
    height = 600 - margin.top - margin.bottom;

var xScale = d3.scaleLinear().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);

//define area function
var valArea = d3.area()
	.x(function(d) {return xScale(d[0]); })
	.y0(height)
	.y1(function(d) {return yScale(d[2]); });

var svgtop = d3.select("#density")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom);

//append a group
var svg = svgtop.append("g")
	.attr("transform", 
	      "translate("+ margin.left + ',' + margin.top + ")");

//append a div for tooltip on hover 
var div = d3.select("body").append("div")	
", "tooltip")				
ity", 0);


//get data and plot
function drawPlot(url){
	d3.json(url).then(function(data){
		var df = data["df"];

		//convert string to decimal
		df.forEach(function(d){
			d[0] = +d[0];
			d[2] = +d[2];
});
	//remove any previous elements
	console.log(df);
	d3.selectAll(".area").remove();
	d3.selectAll(".xaxis").remove();
	d3.selectAll(".yaxis").remove();
	d3.selectAll(".stats").remove();
	d3.selectAll(".mean").remove();

	//filter melted dataframe based on month and day
	var m = df.filter(function(d) {return d[1]  == "m";});
	var d = df.filter(function(d) {return d[1] == "d";});
	
	//scale axis
	xScale.domain([data.x_lim[0], data.x_lim[1]]);
	yScale.domain([0, d3.max(df, function(d) {return d[2]; })]);		    
	
	//draw density curve for month
	svg.append("path")
		.data([m])
		.attr("class", "area")
		.attr("fill", "#69b3a2")
		.attr("d", valArea);

	//density curve for day
	svg.append("path")
		      .data([d])
		      .attr("class", "area")
		      .attr("fill", "#404080")
		      .attr("d", valArea);
	
	//draw axis and append axis labels
	svg.append("g")
		.attr("class", "xaxis")
		.attr("transform", "translate(0,"+height+")" )
		.call(d3.axisBottom(xScale));
	
	svg.append("g")
		.attr("class", "yaxis")
		.call(d3.axisLeft(yScale));

 	svg.append("text")
		.attr("x", width/2)
		.attr("y", height+50)
		.style("text-anchor", "middle")
		.text("Value");
		
 	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", 0 - height/2)
		.attr("y", 0 - margin.left)
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("density");

	//add mean line with hover interaction
	svg.append("line")
		.attr("class", "mean")
		.attr("x1", function(d) {return xScale(data.stats["mean"]);})
		.attr("x2", function(d) {return xScale(data.stats["mean"]);})
		.attr("y1", 0)
		.attr("y2", height)
		.attr("stroke", "black")
		.attr("stroke-width", "4")
		.style("opacity", 0.3)
		.on("mouseover", function(d){
			div.transition()
			.duration(200)
			.style("opacity", 0.9);
			div.html("Mean: "+data.stats["mean"].toFixed(2))
			.style("left", 5+(d3.event.pageX)+"px")
			.style("top", (d3.event.pageY - 20)+"px");
			})
		.on("mouseout", function(d) {		
			            div.transition()		
			                .duration(500)		
			                .style("opacity", 0);	
			        });

	//append legend
	var legPos = width - margin.right - 30;
	svg.append("circle")
			.attr("cx",legPos - 10)
			.attr("cy",30)
			.attr("r", 6)
			.style("fill", "#69b3a2");
	svg.append("circle")
			.attr("cx",legPos - 10)
			.attr("cy",60)
			.attr("r", 6)
			.style("fill", "#404080");

	svg.append("text")
			.attr("x", legPos)
			.attr("y", 30)
			.text("Month")
			.style("font-size", "15px")
			.attr("alignment-baseline","middle");
		
	svg.append("text")
			.attr("x", legPos)
			.attr("y", 60)
			.text("Day")
			.style("font-size", "15px")
			.attr("alignment-baseline","middle");
	
	//display stats of the density curve
	var elem = svgtop.append("g")
		.attr("class", "stats")
		.attr("transform", "translate(30,30)");
	
	var text = elem.selectAll("text")
		.data(d3.values(data.stats))
		.enter()
		.append("text")
		.attr("x", function(d,i) {return i*190 + 60;})
		.attr("y", 560)
		.text(function(d) {return d.toFixed(2);})
		.attr("font-size", 15);

	var textname = elem.selectAll("text name")
		.data(d3.keys(data.stats))
		.enter()
		.append("text")
		.attr("x", function(d,i) {return i*190 + 60;})
		.attr("y", 530)
		.text(function(d) {return d;})
		.attr("font-size", 15);

	});};
