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

  var endpoint = "http://127.0.0.1:3030/nba_dataset/sparql";
  var queryPlayer = `

SELECT DISTINCT
  *
where {
  <http://project#:`+data+`> :name ?n;
    <http://project#:draftYear> ?dy;
    <http://project#:draftRound> ?dr;
    <http://project#:draftNumber> ?dn;
    <http://project#:country> ?cou;
    <http://project#:college> ?col

} order by asc(?season)`;

  var query = `PREFIX : <http://project#>

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

function printStat(){
  var param_text;
  param_text = document.getElementById("stats_select").options[document.getElementById('stats_select').selectedIndex].text;
  var str;
  str = document.getElementById("stats_select").options[document.getElementById('stats_select').selectedIndex].value;
  var res_stats = str.split(",");

  var season_selected;
  season_selected = document.getElementById("season_select").options[document.getElementById('season_select').selectedIndex].value;
  var res_season = season_selected.split(" ");
  console.log("option selected : ",param_text);
  console.log("season selected : ", res_season);

  var element_table = document.getElementById("headerTable");
  while (element_table.firstChild) {
      element_table.removeChild(element_table.firstChild);
  }
  let th_season = document.createElement("th");
  let th_season_txt = document.createTextNode("Saisons");
  th_season.appendChild(th_season_txt);
  element_table.appendChild(th_season);

  let th_param = document.createElement("th");
  let param_txt_lower = param_text.toLowerCase();
  let th_param_txt = document.createTextNode("Moyenne "+param_txt_lower+" pour tous les joueurs");
  th_param.appendChild(th_param_txt);
  element_table.appendChild(th_param);


  var body_table = document.getElementById("bodyTable");
  while (body_table.firstChild) {
      body_table.removeChild(body_table.firstChild);
  }
  var endpoint = "http://127.0.0.1:3030/nba_dataset/sparql";

  var queryStats = `PREFIX : <http://project#/>

    SELECT DISTINCT
      ?season ?p ?o
    where {
      ?season ?p ?o.
    } LIMIT 5`;
    window.dataGraph = [];
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
                    success: function(data){
                      $.each(data.results.bindings, function(index, bs) {
                          let tr_season = document.createElement("tr");
                          let att = document.createAttribute("id");
                          att.value = "SeasonId"+index;
                          tr_season.setAttributeNode(att);
                          let td_season = document.createElement("td");
                          let temp_txt = "Saison " + bs.season.value;
                          let td_season_txt = document.createTextNode(temp_txt);
                          window.dataGraph[index] = [index, temp_txt, 10];
                          td_season.appendChild(td_season_txt);
                          tr_season.appendChild(td_season);
                          body_table.appendChild(tr_season);
                    });},
                    error: displayError
            });

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
