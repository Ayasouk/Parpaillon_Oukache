console.log("Test réussi ! ");
//$(document).ready(function(){
//  $("#test").html("Hello, World");
//});
//dans index.html <body onload="testQuery();">

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
}

function chercherJoueur(data){
  //TODO: Mettre la majuscule après un apostrophe
  console.log("Joueur trouvé ! ");
  data = data.split(" ");
  for(i=0;i<data.length; i++){
    data[i]= data[i].capitalize();
    console.log(data[i]);
  }
  data = data.join("_");
  data = data.replace("'", "_");
  console.log(data);

  var endpoint = "http://127.0.0.1:3030/all_seasons/sparql";
  var queryPlayer = `PREFIX : <http://127.0.0.1:3333/>

SELECT DISTINCT
  *
where {
  :`+data+` :name ?n;
    :draftYear ?dy;
    :draftRound ?dr;
    :draftNumber ?dn;
    :country ?cou;
    :college ?col

} order by asc(?season)`;

  var query = `PREFIX : <http://127.0.0.1:3333/>

SELECT DISTINCT
  *
where {
  :`+data+` :statistics
      [
  :season ?season;
  :gamesPlayed ?gp;
  :pointsScoredAverage ?pts
  ]

} order by asc(?season)`;

$.ajax({
            url: endpoint,
            dataType: 'json',
            data: {
                queryLn: 'SPARQL',
                query: queryPlayer ,
                limit: 'none',
                infer: 'true',
                Accept: 'application/sparql-results+json'
            },
            success: displayResultPlayer,
            error: displayError
    });
}

function testQuery(){
  var endpoint = "http://127.0.0.1:3030/all_seasons/sparql";
  var queryStats = `PREFIX : <http://127.0.0.1:3333/>

SELECT DISTINCT
  ?season ?gp ?pts
where {
  :Dennis_Rodman :statistics
      [
	:season ?season;
    :gamesPlayed ?gp;
    :pointsScoredAverage ?pts
  ]

} SORT ASC(?season)`;

   // $('#bodyContentResearch').append(queryDataset);
    $.ajax({
                url: endpoint,
                dataType: 'json',
                data: {
                    queryLn: 'SPARQL',
                    query: queryStats ,
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
        //$("body").append(JSON.stringify(bs) + "<hr/>")
    });
}

function displayResultPlayer(data) {
    var player = document.createElement("div");
    $.each(data.results.bindings, function(index, bs) {
        console.log(bs);
        player.id="player"
        player.innerHTML = `<div id='name'>name : `+bs.n.value+`</div><br>
                            <div id='country'>country :`+bs.cou.value+`</div><br>
                            <div id='college'>college : `+bs.col.value+`</div><br>
                            <div id='dy'>draft year : `+bs.dy.value+`</div><br>
                            <div id='dr'>draft round : `+bs.dr.value+`</div><br>
                            <div id='dn'>draft number : `+bs.dn.value+`</div><br>
        `;
        $("body").append(player);
        //$("body").append(JSON.stringify(bs) + "<hr/>")
    });
}
