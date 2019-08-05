var url="";
var date;
jQuery(document).ready(function($){
	url = "http://127.0.0.1:5000/date=2019-03-25";
	drawArcs(url);
	drawPlot(url);
	//Create URL fetch data on submitting a date
	$('.user-input').on('submit', function(){
		date = $("[name=date]").val();
		url = "http://127.0.0.1:5000/date="+date;
		drawArcs(url);
		drawPlot(url);
		return false;
	});

	//Create URL fetch data on choosing a feature
	$('#featureSelect').on('change', function(){
		console.log("here");
		var f_no = $(this).val();
		var f_url = "http://127.0.0.1:5000/date="+date+"/feature="+f_no;
		console.log(f_url);
		drawPlot(f_url);
		return false;
	});

});

