console.log("Test réussi ! ");
//$(document).ready(function(){
//  $("#test").html("Hello, World");
//});
//dans index.html <body onload="testQuery();">

$(document).ready(function(){
  var endpoint = "http://127.0.0.1:3030/nba_dataset/sparql";
  //Load each season
  var query = `PREFIX : <http://project#>

SELECT DISTINCT ?season
WHERE {
      _:b :statistics [
    	:season ?season
      ]
    }
ORDER BY asc(UCASE(str(?season)))`;
    $.ajax({
                url: endpoint,
                dataType: 'json',
                data: {
                    traditional: true,
                    queryLn: 'SPARQL',
                    query: query ,
                    limit: 'none',
                    infer: 'true',
                    Accept: 'application/sparql-results+json'
                },
                success: function(data){
                    $.each(data.results.bindings, function(index, bs) {
                        var season_txt = "Saison " + bs.season.value;
                        $('#season_options').append("<option value="+bs.season.value+">"+season_txt+"</option>");
                    });
                },
                error: displayError
        });

  $("#stats_select").click(function(){
    if(this.value=="Toutes stastistiques"){
      $('#season_options').children('option[value="Toutes les saisons"]').remove();
    } else if(this.value!="Toutes stastistiques"){
      $('#season_options').children('option[value="Toutes les saisons"]').remove()
      $('#season_options').append("<option value='Toutes les saisons'>Toutes les saisons</option>");
    }
  });
});

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

  var endpoint = "http://127.0.0.1:3030/nba_dataset/sparql";
  var queryPlayer = `PREFIX : <http://project#>

SELECT DISTINCT
  *
where {
  :`+data+` :name ?n;
    :draftYear ?dy;
    :draftRound ?dr;
    :draftNumber ?dn;
    :country ?cou;
    :college ?col

}`;
console.log("data : ", data)

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
  var endpoint = "http://127.0.0.1:3030/nba_dataset/sparql";
  var queryStats = `PREFIX : <http://project#>

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

function displayResult() {
    console.log("display result !");
    //$.each(data.results.bindings, function(index, bs) {
    //    console.log(bs);
        //$("body").append(JSON.stringify(bs) + "<hr/>")
    //});
}

function displayResultPlayer(data) {
    var player = document.createElement("div");
    $.each(data.results.bindings, function(index, bs) {
        console.log(bs);
        player.id="player2"
        player.innerHTML = `<div id='name2'>name : `+bs.n.value+`</div><br>
                            <div id='country'>country :`+bs.cou.value+`</div><br>
                            <div id='college'>college : `+bs.col.value+`</div><br>
                            <div id='dy'>draft year : `+bs.dy.value+`</div><br>
                            <div id='dr'>draft round : `+bs.dr.value+`</div><br>
                            <div id='dn'>draft number : `+bs.dn.value+`</div><br>
        `;
        $("#player_info").append(player);
        //$("body").append(JSON.stringify(bs) + "<hr/>")
    });

}

function printStat(){
  var param_text;
  param_text = document.getElementById("stats_select").options[document.getElementById('stats_select').selectedIndex].text;
  var str;
  str = document.getElementById("stats_select").options[document.getElementById('stats_select').selectedIndex].value;
  var res_stats = str.split(",");
  opt = str.split(',');
  opt = opt[0];
  var season_selected;
  season_selected = document.getElementById("season_select").options[document.getElementById('season_select').selectedIndex].value;
  var res_season = season_selected
  console.log("option selected : ",param_text);
  console.log("season selected : ", res_season);
  if(param_text=="Toutes statistiques"){
    console.log("Afficher toutes les statistiques de la saison "+res_season)
  }
  tagname = $("#name").val()
  tagname = tagname.split(" ");
  for(i=0;i<tagname.length; i++){
    tagname[i]= tagname[i].capitalize();
  }
  tagname = tagname.join("_");
  tagname = tagname.replace("'", "_");
  console.log(tagname);
  var endpoint = "http://127.0.0.1:3030/nba_dataset/sparql";

  if (param_text=="Toutes statistiques"){
    var queryStats = `PREFIX : <http://project#>

      SELECT DISTINCT
        *
      where {
        :`+tagname+` :statistics [
          :season "`+res_season+`";
          :team ?team;
          :gamesPlayed ?gp;
          :pointsScoredAverage ?pts;
          :reboundsAverage ?rb;
          :assistsAverage ?as;
          :netRating ?net;
          :offensiveReboundsPercentage ?orb;
          :defensiveReboundsPercentage ?drb;
          :teamPlaysPercentage ?tp;
          :shootingEfficiencyPercentage ?s;
          :assistsPercentage ?asp
        ]
      }`;
      console.log("query : ", queryStats);
      window.dataGraph = [];
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
                      success: function(data){
                        console.log("Affichage donnée statistics")
                        $.each(data.results.bindings, function(index, bs) {
                          if ($("#stats") != undefined){
                            $("#stats").remove()
                          }
                          stats = document.createElement('div')
                          stats.id="stats"
                          stats.innerHTML = `<div id='team'>Team : `+bs.team.value+`</div><br>
                                              <div id='pts'>Points moyens :`+bs.pts.value+`</div><br>
                                              <div id='rb'>Rebonds : `+bs.rb.value+`</div><br>
                                              <div id='as'>Assists: `+bs.as.value+`</div><br>
                                              <div id='asp'>Assists percentage: `+bs.asp.value+`</div><br>
                                              <div id='orb'>Offensive rebounds : `+bs.orb.value+`</div><br>
                                              <div id='drb'>Defensive Rebounds: `+bs.drb.value+`</div><br>
                                              <div id='s'>Shooting efficiency percentage: `+bs.s.value+`</div><br>
                                              <div id='tp'>Team plays percentage : `+bs.tp.value+`</div><br>
                                              <div id='tp'>Net rating : `+bs.net.value+`</div><br>
                          `;
                          $("#stat_info").append(stats)
                      });},
                      error: displayError
              });
  }
  else {
    // Créer le graphe selon la statistique
    var tabStat = ["team", "gamesPlayed", "pointsScoredAverage", "reboundsAverage", "assistsAverage", "netRating", "offensiveReboundsPercentage", "defensiveReboundsPercentage", "teamPlaysPercentage", "shootingEfficiencyPercentage", "assistsPercentage"]
    var queryStats = `PREFIX : <http://project#>

      SELECT DISTINCT
        *
      where {
        :`+tagname+` :statistics [
          :`+opt+` ?obj;
          :season ?season
        ]
      }`;
      console.log("query : ", queryStats);
      window.dataGraph = [];
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
                      success: function(data){
                        console.log("Affichage donnée statistics")
                        if ($("#stats") != undefined){
                          $("#stats").remove()
                        }
                        stats = document.createElement('ul');
                        stats.id="stats";
                        $.each(data.results.bindings, function(index, bs) {
                          se = document.createElement('li')
                          se.innerHTML = `saison `+bs.season.value+` : `+bs.obj.value+`</div><br>
                          `;
                          stats.append(se);
                          $("#stat_info").append(stats)
                      });},
                      error: displayError
              });
  }


}



function displayGraph() {
  console.log("display graph")
  const margin = {top: 20, right: 20, bottom: 90, left: 120},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);

  const y = d3.scaleLinear()
      .range([height, 0]);

  const svg= d3.select("#chart").append("svg")
                .attr("id","svg")
                .attr("width", width + margin.left+margin.right)
                .attr("height", height + margin.top +margin.bottom)
                .append("g")
                .attr("transform", "translate("+margin.left+","+margin.top+")");
  const div= d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity",0);

d3.tsv("data.tsv").then(
  function(data){
    data.forEach(d=>d.population = +d.population);
    x.domain(data.map(d=>d.country));
    y.domain([0, d3.max(data,d=>d.population)]);

    svg.append("g")
    .attr("transform", "translate(0,"+height+")")
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");
    svg.append("g")
      .call(d3.axisLeft(y).ticks(6));


      svg.selectAll(".bar")
         .data(data)
     .enter().append("rect")
         .attr("class", "bar")
         .attr("x", d => x(d.country))
         .attr("width", x.bandwidth())
         .attr("y", d => y(d.population))
         .attr("height", d => height - y(d.population))
         .on("mouseover", function(d) {
             div.transition()
                 .duration(200)
                 .style("opacity", .9);
             div.html("Population : " + d.population)
                 .style("left", (d3.event.pageX + 10) + "px")
                 .style("top", (d3.event.pageY - 50) + "px");
         })
         .on("mouseout", function(d) {
             div.transition()
                 .duration(500)
                 .style("opacity", 0);
         });
  })

}
