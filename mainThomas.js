$(document).ready(function(){
  var endpoint = "http://127.0.0.1:3030/project/sparql";
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
                        $('#season_options').append("<option>"+season_txt+"</option>");
                    });
                    //global Count(players) : 2231
                    var query = `PREFIX : <http://project#>

                    SELECT (COUNT(?s) as ?sCount)
                    WHERE
                    {
                      ?s :name ?o .
                    }`;
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
                                      window.totalPlayers = data.results.bindings[0].sCount.value;
                                  },
                                  error: displayError
                          });
                },
                error: displayError
        });
});

function printStat() {
  $("#errorParameterAllSeasons").html("");
  $("svg").remove()
  var param_text;
  param_text = document.getElementById("stats_select").options[document.getElementById('stats_select').selectedIndex].text;
  var str;
  str = document.getElementById("stats_select").options[document.getElementById('stats_select').selectedIndex].value;
  var res_stats = str.split(",");

  var season_selected;
  season_selected = document.getElementById("season_select").options[document.getElementById('season_select').selectedIndex].value;
  var res_season = season_selected.split(" ");

  var endpoint = "http://127.0.0.1:3030/project/sparql";

  var notStats = ["name", "college", "country", "draftYear", "draftRound", "draftNumber"];
  var query;

  if (res_season[1] == "les") {
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
                        window.dataGraph = [];
                        var notAllSeasons = ["college", "country", "draftYear", "draftRound", "draftNumber", "team"];

                        if (notAllSeasons.includes(res_stats[0])) {
                          return notAllSeasons_function(res_stats[0]);
                        }
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


                            if (notStats.includes(res_stats[0])) {
                              query = `PREFIX : <http://project#>

                              SELECT ?name ?`+res_stats[1]+` ?index
                              WHERE {
                                BIND(`+index+` AS ?index)
                                ?name :`+res_stats[0]+` ?`+res_stats[1]+` .
                                ?name :statistics
                                [
                                  :season "`+bs.season.value+`"
                                ]
                              }
                              ORDER BY asc(UCASE(str(?name)))`;
                            }
                            else {
                              query = `PREFIX : <http://project#>

                              SELECT ?name ?`+res_stats[1]+` ?index
                              WHERE {
                                BIND(`+index+` AS ?index)
                                ?name :statistics
                                [
                                  :season "`+bs.season.value+`";
                                  :`+res_stats[0]+` ?`+res_stats[1]+`
                                ]
                              }
                              ORDER BY asc(UCASE(str(?name)))`;
                            }
                            $.ajax({
                              async: false,
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
                              success: displayResultAllSeasons,
                              error: displayError
                            });
                        });
                        printGraph();
                    },
                    error: displayError
            });
  }
  else {
    var element_table = document.getElementById("headerTable");
    while (element_table.firstChild) {
        element_table.removeChild(element_table.firstChild);
    }
    let th_player = document.createElement("th");
    let th_player_txt = document.createTextNode("Joueur");
    th_player.appendChild(th_player_txt);
    element_table.appendChild(th_player);

    let th_param = document.createElement("th");
    let th_param_txt = document.createTextNode(param_text);
    th_param.appendChild(th_param_txt);
    element_table.appendChild(th_param);
    if (notStats.includes(res_stats[0])) {
      query = `PREFIX : <http://project#>

      SELECT ?name ?`+res_stats[1]+`
      WHERE {
        ?name :`+res_stats[0]+` ?`+res_stats[1]+` .
        ?name :statistics
        [
          :season "`+res_season[1]+`"
        ]
      }
      ORDER BY asc(UCASE(str(?name)))`;
    }
    else {
      query = `PREFIX : <http://project#>

      SELECT ?name ?`+res_stats[1]+`
      WHERE {
        ?name :statistics
        [
          :season "`+res_season[1]+`";
          :`+res_stats[0]+` ?`+res_stats[1]+`
        ]
      }
      ORDER BY asc(UCASE(str(?name)))`;
    }
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
      success: displayResult,
      error: displayError
    });
  }
}

function displayError(xhr, textStatus, errorThrown) {
    console.log(textStatus);
    console.log(errorThrown);
}

function displayResult(data) {
    var element_table = document.getElementById("bodyTable");
    while (element_table.firstChild) {
        element_table.removeChild(element_table.firstChild);
    }
    $.each(data.results.bindings, function(index, bs) {
        var head0 = data.head.vars[0]; //name
        var head1 = data.head.vars[1]; //object
        var res = bs.name.value.split("http://project#");
        var res_space = res[1].replace("_", " ");

        let element_tr = document.createElement("tr");
        let td_property = document.createElement("td");
        let td_object = document.createElement("td");
        let td_property_txt = document.createTextNode(res_space);
        var td_object_txt;

        switch (head1)
        {
          case "age":
            td_object_txt = document.createTextNode(bs.age.value);
            break;
          case "college":
            td_object_txt = document.createTextNode(bs.college.value);
            break;
          case "country":
            td_object_txt = document.createTextNode(bs.country.value);
            break;
          case "player_weight":
            td_object_txt = document.createTextNode(bs.player_weight.value);
            break;
          case "player_height":
            td_object_txt = document.createTextNode(bs.player_height.value);
            break;
          case "team_abbreviation":
            td_object_txt = document.createTextNode(bs.team_abbreviation.value);
            break;
          case "draft_year":
            td_object_txt = document.createTextNode(bs.draft_year.value);
            break;
          case "draft_round":
            td_object_txt = document.createTextNode(bs.draft_round.value);
            break;
          case "draft_number":
            td_object_txt = document.createTextNode(bs.draft_number.value);
            break;
          case "pts":
            td_object_txt = document.createTextNode(bs.pts.value);
            break;
          case "reb":
            td_object_txt = document.createTextNode(bs.reb.value);
            break;
          case "ast":
            td_object_txt = document.createTextNode(bs.ast.value);
            break;
          case "net_rating":
            td_object_txt = document.createTextNode(bs.net_rating.value);
            break;
          case "oreb_pct":
            td_object_txt = document.createTextNode(bs.oreb_pct.value);
            break;
          case "dreb_pct":
            td_object_txt = document.createTextNode(bs.dreb_pct.value);
            break;
          case "usg_pct":
            td_object_txt = document.createTextNode(bs.usg_pct.value);
            break;
          case "ts_pct":
            td_object_txt = document.createTextNode(bs.ts_pct.value);
            break;
          case "ast_pct":
            td_object_txt = document.createTextNode(bs.ast_pct.value);
            break;

          default: //gamesPlayed by default
            td_object_txt = document.createTextNode(bs.gp.value);
        }

        td_property.appendChild(td_property_txt);
        td_object.appendChild(td_object_txt);
        element_tr.appendChild(td_property);
        element_tr.appendChild(td_object);
        element_table.appendChild(element_tr);

    });
}

function displayResultAllSeasons(data) {
  var sum = 0;
  $.each(data.results.bindings, function(index, bs) {
        var head1 = data.head.vars[1]; //object
        switch (head1)
        {
          case "age":
            sum += Number(bs.age.value);
            break;
          case "player_weight":
            sum += Number(bs.player_weight.value);
            break;
          case "player_height":
            sum += Number(bs.player_height.value);
            break;
          case "pts":
            sum += Number(bs.pts.value);
            break;
          case "reb":
            sum += Number(bs.reb.value);
            break;
          case "ast":
            sum += Number(bs.ast.value);
            break;
          case "net_rating":
            sum += Number(bs.net_rating.value);
            break;
          case "oreb_pct":
            sum += Number(bs.oreb_pct.value);
            break;
          case "dreb_pct":
            sum += Number(bs.dreb_pct.value);
            break;
          case "usg_pct":
            sum += Number(bs.usg_pct.value);
            break;
          case "ts_pct":
            sum += Number(bs.ts_pct.value);
            break;
          case "ast_pct":
            sum += Number(bs.ast_pct.value);
            console.log(sum);
            break;

          default: //gamesPlayed by default
            sum += Number(bs.gp.value);
        }
    });
  let temp = "SeasonId"+data.results.bindings[0].index.value;
  var element_table = document.getElementById(temp);

  let td_object = document.createElement("td");
  let average = sum / data.results.bindings.length;
  average = Math.round(average*1000) / 1000;
  let td_object_txt = document.createTextNode(average);

  td_object.appendChild(td_object_txt);
  element_table.appendChild(td_object);
  window.dataGraph[data.results.bindings[0].index.value][2] = average;
}

function notAllSeasons_function(data) {
  var element_table = document.getElementById("headerTable");
  while (element_table.firstChild) {
      element_table.removeChild(element_table.firstChild);
  }
  $("#errorParameterAllSeasons").html("Can't load "+data+" for all seasons");
}

function printGraph() {
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = 1000 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 50)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
  // X axis
  let domainSeason = [];
  window.dataGraph.forEach(element => domainSeason.push(element[1]));
  var x = d3.scalePoint()
    .domain(domainSeason)
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")      // This controls the vertical position of the Axis
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-20,20)rotate(-45)");
      // .style("text-anchor", "end")
      // .style("font-size", 20)
      // .style("fill", "#69a3b2");

  // Y axis
  let domainStat = [];
  window.dataGraph.forEach(element => domainStat.push(element[2]));
  let yMax = Math.max(...domainStat);
  let yMin = Math.min(...domainStat);
  let range2 = (yMax - yMin) / 2;
  var y = d3.scaleLinear()
    .domain([yMin - range2, yMax + range2])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add the line
  svg.append("path")
    .datum(window.dataGraph)
    .attr("fill", "none")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d[1]) })
      .y(function(d) { return y(d[2]) })
      )
  // Add the points
  svg
    .append("g")
    .selectAll("dot")
    .data(window.dataGraph)
    .enter()
    .append("circle")
      .attr("cx", function(d) { return x(d[1]) } )
      .attr("cy", function(d) { return y(d[2]) } )
      .attr("r", 5)
      .attr("fill", "#69b3a2")
}
