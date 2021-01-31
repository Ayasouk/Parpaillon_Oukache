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
                        $('#season_options').append("<option>"+season_txt+"</option>");
                    });
                },
                error: displayError
        });
});

function printStat() {
  window.workInProgressCollege = false;
  $("#errorParameterDisplayGraph").html("");
  $("#forewordGraph").html("");
  $("svg").remove()
  let my_headerTable = document.getElementById("my_headerTable");
  while (my_headerTable.firstChild) {
      my_headerTable.removeChild(my_headerTable.firstChild);
  }
  let my_bodyTable = document.getElementById("my_bodyTable");
  while (my_bodyTable.firstChild) {
      my_bodyTable.removeChild(my_bodyTable.firstChild);
  }
  $("#my_bodyTable").removeClass("displayBlock");
  $("#my_bodyTable").addClass('displayNone');
  $("#table_section").removeClass("displayBlock");
  $("#table_section").addClass('displayNone');
  $("#graph_section").removeClass("displayBlock");
  $("#graph_section").addClass('displayNone');
  $("#forewordGraph").removeClass("displayBlock");
  $("#forewordGraph").addClass('displayNone');
  $("#radio_div").removeClass("displayNone");
  $("#radio_div").addClass('displayBlock');
  $('input[name=displayName]').attr('checked',false);

  var param_text;
  param_text = document.getElementById("stats_select").options[document.getElementById('stats_select').selectedIndex].text;
  var str;
  str = document.getElementById("stats_select").options[document.getElementById('stats_select').selectedIndex].value;
  var res_stats = str.split(",");

  var season_selected;
  season_selected = document.getElementById("season_select").options[document.getElementById('season_select').selectedIndex].value;
  var res_season = season_selected.split(" ");

  var endpoint = "http://127.0.0.1:3030/nba_dataset/sparql";

  var notStatsRDF = ["name", "college", "country", "draftYear", "draftRound", "draftNumber"];
  var notNumStat = ["college", "country", "draftYear", "draftRound", "draftNumber", "team"];
  var query;

  if (res_season[1] == "les") {
      window.workInProgressTable = false;
      if (res_stats[0] == "college") {
        window.workInProgressCollege = true;
      }
      if (notNumStat.includes(res_stats[0])) {
        $("#radio_div").removeClass("displayBlock");
        $("#radio_div").addClass('displayNone');
        $("#graph_section").removeClass("displayNone");
        $("#graph_section").addClass('displayBlock');
        if (res_stats[0] == "team") {
          query = `PREFIX : <http://project#>

          SELECT DISTINCT ?name ?team
          WHERE {
            ?name :statistics
            [
              :team ?team
            ]
          }
          ORDER BY asc(UCASE(str(?team)))`;
        }
        else if (res_stats[0] == "draftNumber") {
          query = `PREFIX : <http://project#>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

          SELECT ?name ?draft_number
          WHERE {
            ?name :draftNumber ?draft_number .
          }
          ORDER BY xsd:decimal(?draft_number)`;
        }
        else {
          query = `PREFIX : <http://project#>

          SELECT ?name ?`+res_stats[1]+`
          WHERE {
            ?name :`+res_stats[0]+` ?`+res_stats[1]+` .
          }
          ORDER BY asc(UCASE(str(?`+res_stats[1]+`)))`;
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
          success: function(data) {
            // console.log(data);
            setDataGraphAllSeasons = [];
            dataForHistogramAllSeasons = [];
            var occurs = 0;
            var noneOrUndrafted = "";
            var head1 = data.head.vars[1]; //object
            $.each(data.results.bindings, function(index, bs) {
              let res = bs.name.value.split("http://project#");
              let res_space = res[1].replace("_", " ");
              let val_string;
              switch (head1)
              {
                case "country":
                  val_string = bs.country.value;
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
                case "draft_year":
                  val_string = bs.draft_year.value;
                  if (val_string != "Undrafted") {
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
                    noneOrUndrafted = "Undrafted";
                  }
                  break;
                case "draft_round":
                  val_string = bs.draft_round.value;
                  if (val_string != "Undrafted") {
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
                    noneOrUndrafted = "Undrafted";
                  }
                  break;
                case "draft_number":
                  val_string = bs.draft_number.value;
                  if (val_string != "Undrafted") {
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
                    noneOrUndrafted = "Undrafted";
                  }
                  break;
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
                default: //college by default
                  val_string = bs.college.value;
                  if (val_string != "None") {
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
                    noneOrUndrafted = "None";
                  }
                }
            });
            let dataLengthMinusOne = setDataGraphAllSeasons.length - 1
            if ((setDataGraphAllSeasons.indexOf("None") == dataLengthMinusOne) || setDataGraphAllSeasons.indexOf("Undrafted") == dataLengthMinusOne) {
              console.log("None or Undrafted is the last element");
            }
            else {
              setDataGraphAllSeasons.push(occurs);
            }
            printBarPlot(param_text, dataForHistogramAllSeasons, setDataGraphAllSeasons, noneOrUndrafted, "true");
          },
          error: displayError
        });
      }
      else {
        var element_table = document.getElementById("headerTable");
        while (element_table.firstChild) {
          element_table.removeChild(element_table.firstChild);
        }
        //prepare table
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

              if (notNumStat.includes(res_stats[0])) {
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
            printScatterPlotGraphAllSeasons("Saisons", param_text);
          },
          error: displayError
        });
      }
  }
  else {
    window.workInProgressTable = true;
    //Displaying data in table
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

    //var body_table = document.getElementById("bodyTable");
    //while (body_table.firstChild) {
    //     body_table.removeChild(body_table.firstChild);
    //}
    if (notStatsRDF.includes(res_stats[0])) {
      query = `PREFIX : <http://project#>

      SELECT DISTINCT ?name ?`+res_stats[1]+`
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

      SELECT DISTINCT ?name ?`+res_stats[1]+`
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

    // Displaying data as graph
    if (!(notNumStat.includes(res_stats[0]))) {
      query2 = `PREFIX : <http://project#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      SELECT DISTINCT ?name ?`+res_stats[1]+`
      WHERE {
        ?name :statistics
        [
          :season "`+res_season[1]+`";
          :`+res_stats[0]+` ?`+res_stats[1]+`
        ]
      }
      ORDER BY xsd:decimal(?`+res_stats[1]+`)`;
      $.ajax({
        url: endpoint,
        dataType: 'json',
        data: {
          traditional: true,
          queryLn: 'SPARQL',
          query: query2 ,
          limit: 'none',
          infer: 'true',
          Accept: 'application/sparql-results+json'
        },
        success: function(data) {
          var setDataGraph = [];
          var dataForHistogram = [];
          // window.dataGraph = [];
          var head1 = data.head.vars[1]; //object
          $.each(data.results.bindings, function(index, bs) {
            let res = bs.name.value.split("http://project#");
            let res_space = res[1].replace("_", " ");
            let val_rounded;
            console.log(head1);
            switch (head1)
            {
              case "age":
                // val_rounded = Math.round(bs.age.value);
                val_rounded = bs.age.value;
                if (!(setDataGraph.includes(val_rounded))) {
                  setDataGraph.push(val_rounded);
                  // window.dataGraph[val_rounded] = [val_rounded, 1];
                }
                // else {
                  //     window.dataGraph[val_rounded][1]++;
                  //   }
                dataForHistogram.push([val_rounded, res_space]);
                break;
              case "player_weight":
                val_rounded = bs.player_weight.value;
                if (!(setDataGraph.includes(val_rounded))) {
                  setDataGraph.push(val_rounded);
                }
                dataForHistogram.push([val_rounded, res_space]);
                break;
              case "player_height":
                val_rounded = bs.player_height.value;
                if (!(setDataGraph.includes(val_rounded))) {
                  setDataGraph.push(val_rounded);
                }
                dataForHistogram.push([val_rounded, res_space]);
                break;
              case "pts":
                val_rounded = bs.pts.value;
                if (!(setDataGraph.includes(val_rounded))) {
                  setDataGraph.push(val_rounded);
                }
                dataForHistogram.push([val_rounded, res_space]);
                break;
              case "reb":
                val_rounded = bs.reb.value;
                if (!(setDataGraph.includes(val_rounded))) {
                  setDataGraph.push(val_rounded);
                }
                dataForHistogram.push([val_rounded, res_space]);
                break;
              case "ast":
                val_rounded = bs.ast.value;
                if (!(setDataGraph.includes(val_rounded))) {
                  setDataGraph.push(val_rounded);
                }
                dataForHistogram.push([val_rounded, res_space]);
                break;
              case "oreb_pct":
                val_rounded = bs.oreb_pct.value;
                if (!(setDataGraph.includes(val_rounded))) {
                  setDataGraph.push(val_rounded);
                }
                dataForHistogram.push([val_rounded, res_space]);
                break;
              case "dreb_pct":
                val_rounded = bs.dreb_pct.value;
                if (!(setDataGraph.includes(val_rounded))) {
                  setDataGraph.push(val_rounded);
                }
                dataForHistogram.push([val_rounded, res_space]);
                break;
              case "usg_pct":
                val_rounded = bs.usg_pct.value;
                if (!(setDataGraph.includes(val_rounded))) {
                  setDataGraph.push(val_rounded);
                }
                dataForHistogram.push([val_rounded, res_space]);
                break;
              case "ts_pct":
                val_rounded = bs.ts_pct.value;
                if (!(setDataGraph.includes(val_rounded))) {
                  setDataGraph.push(val_rounded);
                }
                dataForHistogram.push([val_rounded, res_space]);
                break;
              case "ast_pct":
                val_rounded = bs.ast_pct.value;
                if (!(setDataGraph.includes(val_rounded))) {
                  setDataGraph.push(val_rounded);
                }
                dataForHistogram.push([val_rounded, res_space]);
                break;
              case "net_rating":
                val_rounded = bs.net_rating.value;
                if (!(setDataGraph.includes(val_rounded))) {
                  setDataGraph.push(val_rounded);
                }
                dataForHistogram.push([val_rounded, res_space]);
                break;

              default: //gamesPlayed by default
                val_rounded = bs.gp.value;
                if (!(setDataGraph.includes(val_rounded))) {
                  setDataGraph.push(val_rounded);
                }
                dataForHistogram.push([val_rounded, res_space]);
            }
          });
          printHistogram(param_text, dataForHistogram, setDataGraph, res_season[1]);
        },
        error: displayError
      });
    }
    else {
      if (res_stats[0] == "team") {
        query = `PREFIX : <http://project#>

        SELECT DISTINCT ?name ?team
        WHERE {
          ?name :statistics
          [
            :team ?team;
            :season "`+res_season[1]+`"
          ]
        }
        ORDER BY asc(UCASE(str(?team)))`;
      }
      else if (res_stats[0] == "draftNumber") {
        query = `PREFIX : <http://project#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

        SELECT ?name ?draft_number
        WHERE {
          ?name :draftNumber ?draft_number .
          ?name :statistics
          [
            :season "`+res_season[1]+`"
          ]
        }
        ORDER BY xsd:decimal(?draft_number)`;
      }
      else {
        query = `PREFIX : <http://project#>

        SELECT ?name ?`+res_stats[1]+`
        WHERE {
          ?name :`+res_stats[0]+` ?`+res_stats[1]+` .
          ?name :statistics
          [
            :season "`+res_season[1]+`"
          ]
        }
        ORDER BY asc(UCASE(str(?`+res_stats[1]+`)))`;
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
        success: function(data) {
          setDataGraph = [];
          dataForHistogram = [];
          var occurs = 0;
          var noneOrUndrafted = "";
          var head1 = data.head.vars[1]; //object
          $.each(data.results.bindings, function(index, bs) {
            let res = bs.name.value.split("http://project#");
            let res_space = res[1].replace("_", " ");
            let val_string;
            switch (head1)
            {
              case "country":
              val_string = bs.country.value;
              if (!(setDataGraph.includes(val_string))) {
                if (setDataGraph.length != 0) {
                  setDataGraph.push(occurs);
                }
                setDataGraph.push(val_string);
                occurs = 1;
              }
              else {
                occurs++;
              }
              dataForHistogram.push([val_string, res_space]);
              break;
              case "draft_year":
              val_string = bs.draft_year.value;
              if (val_string != "Undrafted") {
                if (!(setDataGraph.includes(val_string))) {
                  if (setDataGraph.length != 0) {
                    setDataGraph.push(occurs);
                  }
                  setDataGraph.push(val_string);
                  occurs = 1;
                }
                else {
                  occurs++;
                }
                dataForHistogram.push([val_string, res_space]);
                noneOrUndrafted = "Undrafted";
              }
              break;
              case "draft_round":
              val_string = bs.draft_round.value;
              if (val_string != "Undrafted") {
                if (!(setDataGraph.includes(val_string))) {
                  if (setDataGraph.length != 0) {
                    setDataGraph.push(occurs);
                  }
                  setDataGraph.push(val_string);
                  occurs = 1;
                }
                else {
                  occurs++;
                }
                dataForHistogram.push([val_string, res_space]);
                noneOrUndrafted = "Undrafted";
              }
              break;
              case "draft_number":
              val_string = bs.draft_number.value;
              if (val_string != "Undrafted") {
                if (!(setDataGraph.includes(val_string))) {
                  if (setDataGraph.length != 0) {
                    setDataGraph.push(occurs);
                  }
                  setDataGraph.push(val_string);
                  occurs = 1;
                }
                else {
                  occurs++;
                }
                dataForHistogram.push([val_string, res_space]);
                noneOrUndrafted = "Undrafted";
              }
              break;
              case "team":
              val_string = bs.team.value;
              if (!(setDataGraph.includes(val_string))) {
                if (setDataGraph.length != 0) {
                  setDataGraph.push(occurs);
                }
                setDataGraph.push(val_string);
                occurs = 1;
              }
              else {
                occurs++;
              }
              dataForHistogram.push([val_string, res_space]);
              break;
              default: //college by default
              val_string = bs.college.value;
              if (val_string != "None") {
                if (!(setDataGraph.includes(val_string))) {
                  if (setDataGraph.length != 0) {
                    setDataGraph.push(occurs);
                  }
                  setDataGraph.push(val_string);
                  occurs = 1;
                }
                else {
                  occurs++;
                }
                dataForHistogram.push([val_string, res_space]);
                noneOrUndrafted = "None";
              }
            }
          });
          let dataLengthMinusOne = setDataGraph.length - 1
          if ((setDataGraph.indexOf("None") == dataLengthMinusOne) || setDataGraph.indexOf("Undrafted") == dataLengthMinusOne) {
            console.log("None or Undrafted is the last element");
          }
          else {
            setDataGraph.push(occurs);
          }
          printBarPlot(param_text, dataForHistogram, setDataGraph, noneOrUndrafted, res_season[1]);
        },
        error: displayError
      });
    }
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

function notGraphable_function(data) {
  var element_table = document.getElementById("headerTable");
  while (element_table.firstChild) {
      element_table.removeChild(element_table.firstChild);
  }
  $("#errorParameterDisplayGraph").html("Can't load "+data+" as a graph for now");
}

function printScatterPlotGraphAllSeasons(param_text_x, param_text_y) {
  $("#forewordGraph").html("N'hésitez pas à passer la souris sur les points pour plus de détails !");
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

//param_text_x : nom "propre" du parametre choisi
//dataForHistogram : liste de tuples [abscisse, ordonnee]
//dataDistinct : liste de donnees (abscisse) distinctes (une sule fois, pour calculer le nombre de bins (rectangles) ,ecessaires)
//currentSeason : saison actuelle (sous la forme "1997-98")
function printHistogram(param_text_x, dataForHistogram, dataDistinct, currentSeason) {
  $("#forewordGraph").html("N'hésitez pas à passer la souris sur les barres ou cliquer dessus pour plus de détails !");
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 30, bottom: 30, left: 40},
      width = 1500 - margin.left - margin.right,
      height = 520 - margin.top - margin.bottom;
  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 50)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
  // append toolkit to svg object (display nicely the name of the players and their corresponding data in a table)
  const div = d3.select("#my_dataviz").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  // X axis
  //xMax and xMin for the domain
  let xMax = d3.max(dataForHistogram, function(d) { return +d[0] });
  let xMin = d3.min(dataForHistogram, function(d) { return +d[0] });
  console.log(dataForHistogram);
  console.log(xMin);
  console.log(xMax);

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

  //Bad solution for solving the problem of the last value being cut
  switch (param_text_x)
  {
    case "Âge":
      xMax += 2;
      break;
    case "Poids":
      xMax += 2;
      break;
    case "Taille":
      xMax += 2;
      break;
    case "Nombre moyen de points marqués":
      xMax += 1;
      break;
    case "Nombre moyen de rebonds":
      xMax += 1;
      break;
    case "Nombre moyen de passes décisives":
      xMax += 1;
      break;
    case "Pourcentage de rebonds offensifs":
      xMax += 0.02;
      break;
    case "Pourcentage de rebonds défensifs":
      xMax += 0.005;
      break;
    case "Pourcentage de jeux d'équipe":
      xMax += 0.002;
      break;
    case "Pourcentage d'efficacité du tir":
      xMax += 0.005;
      break;
    case "Pourcentage d'assistance aux jeux d'équipe":
      xMax += 0.002;
      break;
    case "Différentiel de points pour 100 possessions":
      xMax += 2;
      xMin -= 2;
      break;

    default: //gamesPlayed by default
      xMax += 1;
  }
  //draw x axis
  var x = d3.scaleLinear()
    .domain([xMin, xMax])
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")      // This controls the vertical position of the Axis
    .call(d3.axisBottom(x));
  svg.append("text")  //add x label
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + formattedHeight + 15)
    .text(param_text_x);

  // set the parameters for the histogram
  let nbins = 70; //set number (not adaptable to the dataset)
  let nbins2 = dataDistinct.length;
  var histogram = d3.histogram()
      .value(function(d) { return d[0]; })   // give the vector of value
      .domain(x.domain())  // then the domain of the graphic
      .thresholds(x.ticks(nbins2)); // then the numbers of bins

  // And apply this function to data to get the bins
  var bins = histogram(dataForHistogram);

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
  textY.innerHTML = "Nombre de joueurs";

  let widthY = Math.ceil(textY.clientWidth);
  formattedWidth = widthY;

  document.body.removeChild(textY);

  //yMax and yMin for the domain
  let yMax = d3.max(bins, function(d) { return d.length; });
  let yMin = d3.min(bins, function(d) { return d.length; });
  let range4 = (yMax - yMin) / 4;
  var y = d3.scaleLinear()
    // .domain([0, yMax + range4])
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
    .text("Nombre de joueurs");

  // append the bar rectangles to the svg element
  svg.selectAll(".bar")
      .data(bins)
      .enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", 1)
        .attr("cursor", "pointer")
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(param_text_x + " : " + d.x0 + "<br>" + d.length + " joueur(s)")
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
            // let th_my_data_txt = document.createTextNode("Joueur | " + param_text_x);
            let th_my_data_txt = document.createTextNode("Joueur(s)");
            th_my_data.appendChild(th_my_data_txt);
            my_headerTable.appendChild(th_my_data);

            d.forEach(function(element){
              let tr_elem = document.createElement("tr");

              let td1_elem = document.createElement("td");
              att = document.createAttribute("style");
              att.value = "border: 1px solid black; padding: 5px";
              td1_elem.setAttributeNode(att);
              let td1_elem_txt = document.createTextNode(element[1]);
              td1_elem.appendChild(td1_elem_txt);
              tr_elem.appendChild(td1_elem);

              let td2_elem = document.createElement("td");
              att = document.createAttribute("style");
              att.value = "border: 1px solid black; padding: 5px";
              td2_elem.setAttributeNode(att);
              let td2_elem_txt = document.createTextNode(element[0]);
              td2_elem.appendChild(td2_elem_txt);
              tr_elem.appendChild(td2_elem);

              my_bodyTable.appendChild(tr_elem);
            })
        });
  svg.append("text") //display current season
      .attr("x", (width / 2))
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("text-decoration", "underline")
      .text("Saison " + currentSeason);
}

function printBarPlot(param_text_x, dataForHistogram, dataDistinct, noneOrUndrafted, isAllSeasons) {
  if (param_text_x == "Université" && window.workInProgressCollege) {
    alert("Veuillez nous excuser, l'affichage des universités sous forme de graphe est encore en cours de construction d'où une présentation encore peu lisible.");
  }
  if (param_text_x == "Université" && !window.workInProgressCollege) {
    window.workInProgressCollege = true;
  }
  let forewordData = "";
  if (noneOrUndrafted == "None") {
    forewordData = "<br>Les joueurs dont l'université n'est pas renseignée ne sont pas pris en compte, par souci de lisibilité";
  }
  if (noneOrUndrafted == "Undrafted") {
    forewordData = "<br>Les joueurs non sélectionnés ne sont pas pris en compte, par souci de lisibilité";
  }
  $("#forewordGraph").html("N'hésitez pas à passer la souris sur les barres ou cliquer dessus pour plus de détails !"+forewordData);
  if (isAllSeasons == "true") {
    $("#forewordGraph").removeClass("displayNone");
    $("#forewordGraph").addClass('displayBlock');
  }
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
  formattedWidthX = widthX;

  document.body.removeChild(text2X);

  // set the dimensions and margins of the graph
  var margin = {top: 30, right: formattedWidthX+20, bottom: 100, left: 40},
      width = 1600 - margin.left - margin.right,
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

  var data = [];
  var varUSA;
  for (let i = 0; i < dataDistinct.length-1; i+=2) {
    if (dataDistinct[i] == "USA") {
      varUSA = dataDistinct[i+1];
    }
    else {
      data.push([dataDistinct[i], dataDistinct[i+1]]);
    }
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

  // X axis
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
      .style("text-anchor", "end")
      .attr("transform", "translate(-5,"+5+")rotate(-45)");
  svg.append("text")  //add x label
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width + formattedWidthX + 5)
    .attr("y", height)
    .text(param_text_x);

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
  textY.innerHTML = "Nombre de joueurs";

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
    .text("Nombre de joueurs");

  // append the bar rectangles to the svg element
  svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d[0]); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("cursor", "pointer")
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d[1]); })
        .attr("fill", "#69b3a2")
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d[0] + "<br>" + d[1] + " joueur(s)")
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
  if (param_text_x == "Pays") {
    svg.append("text")
      .attr("x", (3 * width / 4))
      .attr("y", -formattedHeight)
      .attr("text-anchor", "middle")
      .attr("cursor", "pointer")
      .attr("stroke", "#69b3a2")
      .style("font-size", "16px")
      .style("color", "red")
      .text("USA : " + varUSA + " joueurs")
      .data(data)
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
      let th_my_data_txt = document.createTextNode("USA");
      th_my_data.appendChild(th_my_data_txt);
      my_headerTable.appendChild(th_my_data);

      dataForHistogram.forEach(function(element){
        if (element[0] == "USA") {
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
  if (isAllSeasons != "true") {
    svg.append("text") //display current season
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Saison " + isAllSeasons);
  }

}

function getRadioButtonValue(rbutton) {
  for (var i = 0; i < rbutton.length; ++i) {
    if (rbutton[i].checked) {
      return rbutton[i].value;
    }
  }
  return null;
}

function handleDisplay() {
  let choice = getRadioButtonValue(document.radio_value.displayName);
  if (choice == "graph") {
    $("#table_section").removeClass("displayBlock");
    $("#table_section").addClass('displayNone');

    $("#graph_section").removeClass("displayNone");
    $("#graph_section").addClass('displayBlock');
    $("#forewordGraph").removeClass("displayNone");
    $("#forewordGraph").addClass('displayBlock');
    if (window.workInProgressCollege) {
      alert("Veuillez nous excuser, l'affichage des universités sous forme de graphe est encore en cours de construction d'où une présentation encore peu lisible.");
    }
  }
  if (choice == "table") {
    $("#graph_section").removeClass("displayBlock");
    $("#graph_section").addClass('displayNone');
    $("#forewordGraph").removeClass("displayBlock");
    $("#forewordGraph").addClass('displayNone');

    $("#table_section").removeClass("displayNone");
    $("#table_section").addClass('displayBlock');
    if (window.workInProgressTable) {
      alert("Veuillez nous excuser, l'affichage des tableaux pour une saison est encore en cours de construction d'où une présentation encore peu esthétique.");
    }
  }
  return false; // prevent further bubbling of event
}
