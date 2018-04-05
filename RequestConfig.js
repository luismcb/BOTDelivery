module.exports.GetRequest=function(url)
{
	return({
		method:'GET',
		uri:'http://botdeliveryservice.azurewebsites.net/'+url
		
	});
	
};

module.exports.PostRequest=function(url,formData){
	return({
		method:'POST',
		uri:'http://botdeliveryservice.azurewebsites.net/'+url,
		form:formData
	});
};

