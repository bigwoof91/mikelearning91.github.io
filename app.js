var form = $("#form");
var search = $("#search").val().trim();
var numRecords = $("#numRecords").val().trim();

var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
url += '?' + $.param({
    'api-key': "4d60067980d842748f25429c4d6503bf",
    'q': search
});

$.ajax({
    url: url,
    method: 'GET',
}).done(function(result) {
    console.log(result);
}).fail(function(err) {
    throw err;
});
var resDocs = result.docs

for(var i = 0; i < resDocs; i++) {
	console.log(res[i]);
}

