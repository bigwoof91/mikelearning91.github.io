$(document).ready(function() {

    $(document).on("click", "#search-button", searchFunction);

    function searchFunction(event) {
        event.preventDefault();
        var form = $("#form");
        var search = $("#search").val().trim();
        var number = $("#number").val().trim();
        var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
        url += '?' + $.param({
            'api_key': "4d60067980d842748f25429c4d6503bf",
            'q': search,
            'page': number
        });
        console.log(url);
        $.ajax({
            url: url,
            method: 'GET',
        }).done(function(response) {
            console.log(response);
            $("#holder").empty();
            var resDocs = response.response.docs.length;


            for (var i = 0; i < response.response.docs.length; i++) {
                console.log(resDocs[i]);
                var itemHolder = $('<div id="article">');
                var headline = itemHolder.append("<h2>" + response.response.docs[i].headline.main + "</h2>");
                var leadP = itemHolder.append("<p>" + response.response.docs[i].lead_paragraph + "</p>");

                // etc. etc. etc. keep appending the data
                $("#holder").prepend(itemHolder)

            };

        }).fail(function(err) {
            throw err;
        });
    }

});
