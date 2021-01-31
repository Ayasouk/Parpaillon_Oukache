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
    console.log("test")
    if (true){
      $("#graph_section").removeClass("displayNone");
      $("#graph_section").addClass('displayBlock');

      if (res_stats[0] == "team") {
        query = `PREFIX : <http://project#>

        SELECT DISTINCT ?td ?team
        WHERE {
          :`+tagname+` :statistics
          [
            :team ?team
          ]
        }
        ORDER BY asc(UCASE(str(?team)))`;
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
          var occurs = 0;
          var head1 = data.head.vars[1]; //object
          $.each(data.results.bindings, function(index, bs) {
            console.log("stat1 : ", bs);
            let res = ["",tagname];
            let res_space = res[1].replace("_", " ");
            console.log("bar plot : ",bs);
            let val_string;
            console.log("graph : ",head1);
            switch (head1)
            {
              case "team":
                val_string = bs.team.value;
                if (!(setDataGraphAllSeasons.includes(val_string))) {
                  if (setDataGraphAllSeasons.length != 0) {
                    setDataGraphAllSeasons.push(occurs);
                  }
                  setDataGraphAllSeasons.push(val_string);
                  occurs = 1;
                }
                else {
                  occurs++;
                }
                dataForHistogramAllSeasons.push([val_string, res_space]);
                break;

                case "obj":
                  val_string = bs.obj.value;
                  season = bs.season.value;
                  if (!(setDataGraphAllSeasons.includes(val_string))) {
                    if (setDataGraphAllSeasons.length != 0) {
                      setDataGraphAllSeasons.push(val_string);
                    }
                    setDataGraphAllSeasons.push(season);
                    occurs = 1;
                  }
                  else {
                    occurs++;
                  }
                  dataForHistogramAllSeasons.push([val_string, res_space]);
                  break;
              }
          });
          setDataGraphAllSeasons.push(occurs);
          console.log(dataForHistogramAllSeasons);
          printBarPlotAllSeasons(param_text, dataForHistogramAllSeasons, setDataGraphAllSeasons);
        },
        error: displayError
      });
    }
  }
    /*var tabStat = ["team", "gamesPlayed", "pointsScoredAverage", "reboundsAverage", "assistsAverage", "netRating", "offensiveReboundsPercentage", "defensiveReboundsPercentage", "teamPlaysPercentage", "shootingEfficiencyPercentage", "assistsPercentage"]
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
              });*/
}


function printBarPlotAllSeasons(param_text_x, dataForHistogram, dataDistinct) {
   console.log("data distinct : ",dataDistinct);
   console.log("data histo : ",dataDistinct);
  //get the width in pixels of the name of the parameter to position it as we want on the x-axis
  let text2X = document.createElement("span");
  document.body.appendChild(text2X);

  text2X.style.font = "times new roman";
  text2X.style.fontSize = 16 + "px";
  text2X.style.height = 'auto';
  text2X.style.width = 'auto';
  text2X.style.position = 'absolute';
  text2X.style.whiteSpace = 'no-wrap';
  text2X.innerHTML = param_text_x;

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
      width = 1200 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;
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
    .domain(data.map(function(d) { return d[0]; }))
    .range([0, width])
    .padding(0.2);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")      // This controls the vertical position of the Axis
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-20,20)rotate(-90)");
  svg.append("text")  //add x label
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width + formattedWidth + 5)
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
  let yMax = d3.max(data, function(d) { return +d[1]; });
  var y = d3.scaleLinear()
    .domain([0, yMax])
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
        .attr("x", function(d) { return x(d[0]); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d[1]); })
        .attr("fill", "#69b3a2")
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d[0] + "<br>" + d[1] + " fois")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 50) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("mouseup", function(d) {
            //create table for specific info when clicking on a bin
            let my_headerTable = document.getElementById("my_headerTable");
            while (my_headerTable.firstChild) {
                my_headerTable.removeChild(my_headerTable.firstChild);
            }
            let my_bodyTable = document.getElementById("my_bodyTable");
            while (my_bodyTable.firstChild) {
                my_bodyTable.removeChild(my_bodyTable.firstChild);
            }
            $("#my_bodyTable").removeClass("displayNone");
            $("#my_bodyTable").addClass('displayBlock');
            let th_my_data = document.createElement("th");
            let att = document.createAttribute("style");
            att.value = "border: 1px solid black; padding: 5px";
            th_my_data.setAttributeNode(att);
            let th_my_data_txt = document.createTextNode(d[0]);
            th_my_data.appendChild(th_my_data_txt);
            my_headerTable.appendChild(th_my_data);

            dataForHistogram.forEach(function(element){
              if (element[0] == d[0]) {
                let tr_elem = document.createElement("tr");

                let td1_elem = document.createElement("td");
                att = document.createAttribute("style");
                att.value = "border: 1px solid black; padding: 5px";
                td1_elem.setAttributeNode(att);
                let td1_elem_txt = document.createTextNode(element[1]);
                td1_elem.appendChild(td1_elem_txt);
                tr_elem.appendChild(td1_elem);

                my_bodyTable.appendChild(tr_elem);
              }
            })
        });
}

function printScatterPlotGraphAllSeasons(param_text_x, param_text_y) {
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

  const div = d3.select("#my_dataviz").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
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
  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text(param_text_x);

  // Y axis
  let domainStat = [];
  window.dataGraph.forEach(element => domainStat.push(element[2]));
  let yMax = Math.max(...domainStat);
  let yMin = Math.min(...domainStat);
  let range2 = (yMax - yMin) / 2;

  let textY = document.createElement("span");
  document.body.appendChild(textY);

  textY.style.font = "times new roman";
  textY.style.fontSize = 16 + "px";
  textY.style.height = 'auto';
  textY.style.width = 'auto';
  textY.style.position = 'absolute';
  textY.style.whiteSpace = 'no-wrap';
  textY.innerHTML = param_text_y;

  let widthY = Math.ceil(textY.clientWidth);
  formattedWidth = widthY;

  document.body.removeChild(textY);

  var y = d3.scaleLinear()
    .domain([yMin - range2, yMax + range2])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y))
  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 0)
    .attr("x", formattedWidth + 5)
    .attr("dy", ".75em")
    // .attr("transform", "rotate(-90)")
    .text(param_text_y);

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
      .attr("r", 6)
      .attr("fill", "#69b3a2")
      .on("mouseover", function(d) {
          div.transition()
              .duration(200)
              .style("opacity", .9);
          div.html(d[1] + "<br>" + "Moyenne : " + d[2])
              .style("left", (d3.event.pageX + 10) + "px")
              .style("top", (d3.event.pageY - 50) + "px");
      })
      .on("mouseout", function(d) {
          div.transition()
              .duration(500)
              .style("opacity", 0);
      })
}
