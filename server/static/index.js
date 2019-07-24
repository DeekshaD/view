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


var data = [1,2,3,4]

var margin = {top: 20, right: 20, bottom: 40, left: 50};
var width = 800;
var height = 800;


