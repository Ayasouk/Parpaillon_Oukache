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

$("#player2").remove();
// Chargement des données lié au joueur
  data = data.split(" ");
  for(i=0;i<data.length; i++){
    data[i]= data[i].capitalize();
  }
  data = data.join("_");
  data = data.replace("'", "_");
  $("#graph_section").removeClass("displayBlock");
  $("#graph_section").addClass('displayNone');

  // chargement des saisons d où le joueur a joué
  var endpoint = "http://127.0.0.1:3030/project/sparql";
  //Load each season
  var query = `PREFIX : <http://project#>

  SELECT DISTINCT ?season
  WHERE {
      :`+data+` :statistics [
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
                    $("#season_options")
                      .empty()
                      .append('<option selected="selected" value="Toutes les saisons">Toutes les saisons</option>');
                    $.each(data.results.bindings, function(index, bs) {
                        var season_txt = "Saison " + bs.season.value;
                        $('#season_options').append("<option value="+bs.season.value+">"+season_txt+"</option>");
                    });
                },
                error: displayError
        });


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

function displayError(xhr, textStatus, errorThrown) {
    console.log(textStatus);
    console.log(errorThrown);
}

function displayResultPlayer(data) {
    var player = document.createElement("div");
    $.each(data.results.bindings, function(index, bs) {
        player.id="player2"
        player.innerHTML = `<div id='name2'>Nom : `+bs.n.value+`</div><br>
                            <div id='country'>Pays :`+bs.cou.value+`</div><br>
                            <div id='college'>Université: `+bs.col.value+`</div><br>
                            <div id='dy'>Année de sélection : `+bs.dy.value+`</div><br>
                            <div id='dr'>Tour de sélection : `+bs.dr.value+`</div><br>
                            <div id='dn'>Numéro de sélection : `+bs.dn.value+`</div><br>
        `;
        $("#player_info").append(player);
        //$("body").append(JSON.stringify(bs) + "<hr/>")
    });

}

function printStat(){
  // statistique numérique
  var notNumStat = ["college", "country", "draftYear", "draftRound", "draftNumber", "team"];
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
  tagname = $("#name").val()
  tagname = tagname.split(" ");
  for(i=0;i<tagname.length; i++){
    tagname[i]= tagname[i].capitalize();
  }
  tagname = tagname.join("_");
  tagname = tagname.replace("'", "_");


  var endpoint = "http://127.0.0.1:3030/project/sparql";

  if (param_text=="Toutes statistiques"){
    if(res_season=="Toutes les saisons"){
      alert("Nous ne pouvons afficher toutes les statistiques seulement pour une saison donnée")
    }
    $("#graph_section").removeClass("displayBlock");
    $("#graph_section").addClass('displayNone');
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
                        $.each(data.results.bindings, function(index, bs) {
                          if ($("#stats") != undefined){
                            $("#stats").remove()
                          }
                          stats = document.createElement('div')
                          stats.id="stats"
                          stats.innerHTML = `<div id='team'>Équipe : `+bs.team.value+`</div><br>
                                              <div id='pts'>Points moyens :`+bs.pts.value+`</div><br>
                                              <div id='rb'>Rebonds : `+bs.rb.value+`</div><br>
                                              <div id='as'>Assistances: `+bs.as.value+`</div><br>
                                              <div id='asp'>Pourcentage d'assistances: `+bs.asp.value+`</div><br>
                                              <div id='orb'>Rebonds offensives : `+bs.orb.value+`</div><br>
                                              <div id='drb'>Rebonds défensives: `+bs.drb.value+`</div><br>
                                              <div id='s'>Pourcentage d'efficacité de shoot: `+bs.s.value+`</div><br>
                                              <div id='tp'>Pourcentage de temps joué en équipe : `+bs.tp.value+`</div><br>
                                              <div id='tp'>Différentiel de point pour 100 possessions : `+bs.net.value+`</div><br>
                          `;
                          $("#stat_info").append(stats)
                          $("#graph_section").removeClass("displayBlock");
                          $("#graph_section").addClass("displayNone");
                      });},
                      error: displayError
              });
  }
  else {
    // Créer le graphe selon la statistique
    $("#stats").remove();
    if (true){
      $("#graph_section").removeClass("displayNone");
      $("#graph_section").addClass('displayBlock');

      if (res_stats[0] == "team") {
        if (res_season == "Toutes les saisons") {
          query = `PREFIX : <http://project#>

          SELECT DISTINCT ?td ?team ?season
          WHERE {
            :`+tagname+` :statistics
            [
              :team ?team;
              :season ?season
            ]
          }
          ORDER BY asc(UCASE(str(?season)))`;
        }
        else {
          query = `PREFIX : <http://project#>

          SELECT DISTINCT ?td ?team
          WHERE {
            :`+tagname+` :statistics
            [
              :team ?team;
              :season "`+res_season+`"
            ]
          }
          ORDER BY asc(UCASE(str(?team)))`;
        }
      }
      else {
        query = `PREFIX : <http://project#>

        SELECT DISTINCT ?td ?obj ?season
        WHERE {
          :`+tagname+` :statistics [
            :`+res_stats[0]+` ?obj;
            :season ?season
          ]
        }
        ORDER BY asc(UCASE(str(?season)))`;
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
        success: function(data) {
          // console.log(data);
          setDataGraphAllSeasons = [];
          dataForHistogramAllSeasons = [];
          var head1 = data.head.vars[1]; //object

          if ($("#stats") != undefined){
            $("#stats").remove()
          }
          stats = document.createElement('div')
          stats.id="stats"
          stats.innerHTML = "";

          $.each(data.results.bindings, function(index, bs) {
            let res = ["",tagname];
            let res_space = res[1].replace("_", " ");
            let val_string;
            if (head1 == "team") {
              if (res_season == "Toutes les saisons") {
                stats.innerHTML += `<div id='team'>Équipe de la saison `+bs.season.value+` : `+bs.team.value+`</div><br>
                `;
              }
              else {
                stats.innerHTML = `<div id='team'>Équipe de la saison `+res_season+` : `+bs.team.value+`</div><br>
                `;
              }
            }
            else {
              val_string = bs.obj.value;
              season = bs.season.value;
              setDataGraphAllSeasons.push(val_string);
              setDataGraphAllSeasons.push(season);
              dataForHistogramAllSeasons.push([val_string, res_space]);
            }
          });
          if (head1 != "team") {
            printBarPlotAllSeasons(param_text, dataForHistogramAllSeasons, setDataGraphAllSeasons);
          }
          else {
            $("#stat_info").append(stats)
            $("#graph_section").removeClass("displayBlock");
            $("#graph_section").addClass("displayNone");
          }
        },
        error: displayError
      });
    }
  }
}


function printBarPlotAllSeasons(param_text_x, dataForHistogram, dataDistinct) {
  //get the width in pixels of the name of the parameter to position it as we want on the x-axis
  let text2X = document.createElement("span");
  document.body.appendChild(text2X);

  text2X.style.font = "times new roman";
  text2X.style.fontSize = 16 + "px";
  text2X.style.height = 'auto';
  text2X.style.width = 'auto';
  text2X.style.position = 'absolute';
  text2X.style.whiteSpace = 'no-wrap';
  text2X.innerHTML = "Saison";

  let widthX = Math.ceil(text2X.clientWidth);
  formattedWidth = widthX;

  document.body.removeChild(text2X);
  if ($("#my_dataviz")!=undefined){
    $("#my_dataviz").remove();
    dataviz = document.createElement('div');
    dataviz.id="my_dataviz";
    $("#graph_section td").append(dataviz)
  }
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: formattedWidth+20, bottom: 100, left: 40},
      width = 1000 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;
  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 50)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
  // append toolkit to svg object

  const div = d3.select("#my_dataviz").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // X axis
  var data = [];
  for (let i = 0; i < dataDistinct.length-1; i+=2) {
    data.push([dataDistinct[i], dataDistinct[i+1]]);
  }

  //get the height in pixels of a text to position it as we want on the axis
  let textX = document.createElement("span");
  document.body.appendChild(textX);

  textX.style.font = "times new roman";
  textX.style.fontSize = 16 + "px";
  textX.style.height = 'auto';
  textX.style.width = 'auto';
  textX.style.position = 'absolute';
  textX.style.whiteSpace = 'no-wrap';
  textX.innerHTML = "bla";

  let heightX = Math.ceil(textX.clientHeight);
  formattedHeight = heightX;

  document.body.removeChild(textX);

  //draw x axis
  var x = d3.scaleBand()
    .domain(data.map(function(d) { return d[1]; }))
    .range([0, width])
    .padding(0.2);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")      // This controls the vertical position of the Axis
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-20,20)rotate(-45)");
  svg.append("text")  //add x label
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width + formattedWidth +5)
    .attr("y", height)
    .text("Saison");

  // Y axis
  //get the width in pixels of the name of the parameter to position it as we want on the axis
  let textY = document.createElement("span");
  document.body.appendChild(textY);

  textY.style.font = "times new roman";
  textY.style.fontSize = 16 + "px";
  textY.style.height = 'auto';
  textY.style.width = 'auto';
  textY.style.position = 'absolute';
  textY.style.whiteSpace = 'no-wrap';
  textY.innerHTML = param_text_x;

  let widthY = Math.ceil(textY.clientWidth);
  formattedWidth = widthY;

  document.body.removeChild(textY);

  //yMax and yMin for the domain
  let yMax = d3.max(data, function(d) { return +d[0]; });
  let yMin = 0;
  if (param_text_x == "Différentiel de points pour 100 possessions") {
    yMin = d3.min(data, function(d) { return +d[0]; });
    yMin -= 2;
  }
  var y = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y))
  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -formattedHeight)
    .attr("x", formattedWidth + 5)
    .attr("dy", ".75em")
    .text(param_text_x);

  // append the bar rectangles to the svg element
  svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d[1]); })
        .attr("y", function(d) { return y(d[0]); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d[0]); })
        .attr("fill", "#69b3a2")
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d[0])
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 50) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
}
