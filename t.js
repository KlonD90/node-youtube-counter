var request = require("request");
var xmldom = require("xmldom");
var dom = xmldom.DOMParser;
var xpath = require("xpath");
var fs = require("fs");

var items = {};
var queries = ['thisishorosho','caramba','spasiboeva'];
var pushData = function(data){
	for(var id in data){
		items[id] = data[id];
	}
};

var finalOutput = function(){
	console.log(items);
	var list = [];
	for(var id in items){
		list.push(items[id]);
	}
	fs.writeFileSync('data.json',JSON.stringify(items));
	console.log(list.length);
	console.log('total views: '+list.reduce(function(m,i){return m+i.views},0) );
}
var i =0;
var pageMax = 4;
var atPage = 50;
var requestPage = function(query,page){
	request('https://gdata.youtube.com/feeds/api/videos?q='+encodeURIComponent(query)+'&orderby=relevance&start-index='+(page*atPage +1 )+'&max-results='+atPage+'&v=2&fields=@gd:*,entry(@gd:*,title,id,yt:statistics)',function(error,response,body){
		var doc = new dom().parseFromString(body);
		var titles = xpath.select("//entry/title/text()", doc);
		var views = xpath.select("//entry", doc);
		var ids = xpath.select("//entry/id/text()", doc);
		var data = {};
		for(var j=0;j<ids.length;j++){
			var id = ids[j].toString();
			id = id.split(':')[3];
			data[id] = {
				'title':titles[j].toString(),
				'views':parseInt(views[j].lastChild.attributes[1]?views[j].lastChild.attributes[1].value:0,10),
			};
		}
		pushData(data);
		page++;
		if(page>pageMax || ids.length === 0){
			setTimeout(function(){iterate();},10);
		} else {
			setTimeout(function(){requestPage(query,page);},10);
		}
	});
};
var iterate = function(){
	if(queries[i]){
		requestPage(queries[i],0);
		i++;
	} else{
		finalOutput();
	}
};

iterate();
