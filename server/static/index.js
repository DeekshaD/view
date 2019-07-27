var url="";
jQuery(document).ready(function($){
	$('.user-input').on('submit', function(){
		date = $("[name=date]").val(); 					
		toks = date.split('/');
		date = toks[2]+'-'+toks[0]+'-'+toks[1];
		url = "http://127.0.0.1:5000/main/date="+date;
		console.log(url);
		//drawROC(url);
		return false
	});
});


var margin = {top: 20, right: 20, bottom: 40, left: 50},
	width = 800 - margin.left - margin.right,
	height = 800 - margin.top - margin.bottom;

//append svg object
var svg = d3.select("#density_plots")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//get data

var data = d3.json(url, function(data){
console.log(data);})
//console.log(data)


