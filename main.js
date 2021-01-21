console.log("Test réussi ! ");
$(document).ready(function(){
  $("#test").html("Hello, World");
});

function testQuery(){
  var endpoint = "http://127.0.0.1:3030/all_seasons/sparql";
  var query = `PREFIX : <http://127.0.0.1:3333/>

SELECT DISTINCT
  ?season ?gp ?pts
where {
  :Dennis_Rodman :statistics
      [
	:season ?season;
    :gamesPlayed ?gp;
    :pointsScoredAverage ?pts
  ]

}`;

   // $('#bodyContentResearch').append(queryDataset);
    $.ajax({
                url: endpoint,
                dataType: 'json',
                data: {
                    queryLn: 'SPARQL',
                    query: query ,
                    limit: 'none',
                    infer: 'true',
                    Accept: 'application/sparql-results+json'
                },
                success: displayResult,
                error: displayError
        });
}

function displayError(xhr, textStatus, errorThrown) {
    console.log(textStatus);
    console.log(errorThrown);
}

function displayResult(data) {
    $.each(data.results.bindings, function(index, bs) {
        console.log(bs);
        $("body").append(JSON.stringify(bs) + "<hr/>");
    });
}
