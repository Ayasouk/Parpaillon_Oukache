$(document).ready(function(){
  var endpoint = "http://127.0.0.1:3030/project/sparql";

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
  var param_text;
  param_text = document.getElementById("stats_select").options[document.getElementById('stats_select').selectedIndex].text;
  var str;
  str = document.getElementById("stats_select").options[document.getElementById('stats_select').selectedIndex].value;
  var res_stats = str.split(",");

  var season_selected;
  season_selected = document.getElementById("season_select").options[document.getElementById('season_select').selectedIndex].value;
  var res_season = season_selected.split(" ");

  var element_table = document.getElementById("headerTable");
  while (element_table.firstChild) {
      element_table.removeChild(element_table.firstChild);
  }
  let th_player = document.createElement("th");
  let th_player_txt = document.createTextNode("Joueur");
  th_player.appendChild(th_player_txt);
  element_table.appendChild(th_player);

  var endpoint = "http://127.0.0.1:3030/project/sparql";

  var notStats = ["name", "college", "country", "draftYear", "draftRound", "draftNumber"];
  var query;

  if (res_season[1] == "les") {
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
                            let th_season = document.createElement("th");
                            let th_season_txt = document.createTextNode("Saison " + bs.season.value);
                            th_season.appendChild(th_season_txt);
                            element_table.appendChild(th_season);

                            if (notStats.includes(res_stats[0])) {
                              query = `PREFIX : <http://project#>

                              SELECT ?name ?`+res_stats[1]+`
                              WHERE {
                                ?name :`+res_stats[0]+` ?`+res_stats[1]+` .
                                ?name :statistics
                                [
                                  :season "`+bs.season.value+`"
                                ]
                              }`;
                            }
                            else {
                              query = `PREFIX : <http://project#>

                              SELECT ?name ?`+res_stats[1]+`
                              WHERE {
                                ?name :statistics
                                [
                                  :season "`+bs.season.value+`";
                                  :`+res_stats[0]+` ?`+res_stats[1]+`
                                ]
                              }`;
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
                              success: displayResultAllSeasons,
                              error: displayError
                            });
                        });
                    },
                    error: displayError
            });
  }
  else {
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
      }`;
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
      }`;
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
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.age.value);
            break;
          case "college":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.college.value);
            break;
          case "country":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.country.value);
            break;
          case "player_weight":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.player_weight.value);
            break;
          case "player_height":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.player_height.value);
            break;
          case "team_abbreviation":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.team_abbreviation.value);
            break;
          case "draft_year":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.draft_year.value);
            break;
          case "draft_round":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.draft_round.value);
            break;
          case "draft_number":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.draft_number.value);
            break;
          case "pts":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.pts.value);
            break;
          case "reb":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.reb.value);
            break;
          case "ast":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.ast.value);
            break;
          case "net_rating":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.net_rating.value);
            break;
          case "oreb_pct":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.oreb_pct.value);
            break;
          case "dreb_pct":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.dreb_pct.value);
            break;
          case "usg_pct":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.usg_pct.value);
            break;
          case "ts_pct":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.ts_pct.value);
            break;
          case "ast_pct":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.ast_pct.value);
            break;

          default: //gamesPlayed by default
            // console.log(head1);
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
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.age.value);
            break;
          case "college":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.college.value);
            break;
          case "country":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.country.value);
            break;
          case "player_weight":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.player_weight.value);
            break;
          case "player_height":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.player_height.value);
            break;
          case "team_abbreviation":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.team_abbreviation.value);
            break;
          case "draft_year":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.draft_year.value);
            break;
          case "draft_round":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.draft_round.value);
            break;
          case "draft_number":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.draft_number.value);
            break;
          case "pts":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.pts.value);
            break;
          case "reb":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.reb.value);
            break;
          case "ast":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.ast.value);
            break;
          case "net_rating":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.net_rating.value);
            break;
          case "oreb_pct":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.oreb_pct.value);
            break;
          case "dreb_pct":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.dreb_pct.value);
            break;
          case "usg_pct":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.usg_pct.value);
            break;
          case "ts_pct":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.ts_pct.value);
            break;
          case "ast_pct":
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.ast_pct.value);
            break;

          default: //gamesPlayed by default
            // console.log(head1);
            td_object_txt = document.createTextNode(bs.gp.value);
        }

        td_property.appendChild(td_property_txt);
        td_object.appendChild(td_object_txt);
        element_tr.appendChild(td_property);
        element_tr.appendChild(td_object);
        element_table.appendChild(element_tr);

    });
}
