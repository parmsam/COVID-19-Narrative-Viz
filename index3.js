// set the dimensions and margins of the graph
var margin = {top: 0, right: 0, bottom: 0, left:0},
    width = 875;
    height = 500;

//following code based on http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922;
//using d3.v4 instead of v3 which tutorial above is based on

// D3 Projection
var projection = d3.geoAlbersUsa()
            .translate([width/2, height/2])    // translate to center of screen
            .scale([1000]);          // scale things down so see entire US

var path = d3.geoPath().projection(projection);

// Define linear scale for output
var color = d3.scaleLinear()
			  .range(["lightblue","crimson"]);

var legendText = ["Indiana", "Rest of USA"];

//Create SVG element and append map to the SVG
var svg = d3.select("#my_dataviz")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

// Append Div for tooltip to SVG
var div = d3.select("#my_dataviz")
		    .append("div")
   		.attr("class", "tooltip")
   		.style("opacity", 0);

// JS wrap text function (wrapping function taken from https://stackoverflow.com/questions/24784302/wrapping-text-in-d3/24785497)
function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1,
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0,
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}

// Load in my states data!
d3.csv("https://raw.githubusercontent.com/parmsam/covid-19-narrative-viz-indy/master/07-24-2020.csv", function(data) {

color.domain([0,1]); // setting the range of the input data
// Load GeoJSON data and merge with states data
  d3.json("https://raw.githubusercontent.com/parmsam/covid-19-narrative-viz-indy/master/us-states.json", function(json) {
    // Loop through each state data value in the .csv file
    for (var i = 0; i < data.length; i++) {

    	// Grab State Name
    	var dataState = data[i].state;

    	// Grab data value
    	var mystate = data[i].mystate;
    	var confirmed	 = data[i].Confirmed	;
    	var deaths = data[i].Deaths;
    	var recovered = data[i].Recovered;
      var tested = data[i].People_Tested;
      var hospitalized = data[i].People_Hospitalized;

    	var incident_rate = data[i].Incident_Rate;
    	var mortality_rate = data[i].Mortality_Rate;
    	var test_rate = data[i].Testing_Rate;
    	var hospitalization_rate = data[i].Hospitalization_Rate;


    	// Find the corresponding state inside the GeoJSON
    	for (var j = 0; j < json.features.length; j++)  {
    		var jsonState = json.features[j].properties.name;

    		if (dataState == jsonState) {

    		// Copy the data value into the JSON
        json.features[j].properties.mystate = mystate;
        json.features[j].properties.confirmed = confirmed;
        json.features[j].properties.deaths = deaths;
        json.features[j].properties.recovered = recovered;
        json.features[j].properties.tested = tested;
        json.features[j].properties.hospitalized = hospitalized;


        json.features[j].properties.incident_rate = incident_rate;
        json.features[j].properties.mortality_rate = mortality_rate;
        json.features[j].properties.test_rate = test_rate;
        json.features[j].properties.hospitalization_rate = hospitalization_rate;

    		// Stop looking through the JSON
    		break;
    		}
    	}
    }

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
    	.data(json.features)
    	.enter()
    	.append("path")
    	.attr("d", path)
    	.style("stroke", "#fff")
    	.style("stroke-width", "1")
      .on("mouseover", function(d) {
             	div.transition()
               	   .duration(400)
                  .attr("data-html", "true")
                    .style("opacity", 0.8)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");
              div.html("<b>" + d.properties.name + "</b>" + "<br>" +
                "Cases: " + d.properties.confirmed +"<br>" +
                "Deaths: " + d.properties.deaths +"<br>" +
                // "Hosp.: " + d.properties.hospitalized + "<br>" +
                 "Tests: " + d.properties.tested + "<br><br>" +
                "Case Rate (per 100K): " + Math.round(d.properties.incident_rate) + "<br>" +
                "Death Rate (per 100CCs): " + Math.round(d.properties.mortality_rate*100)/100 + "<br>"
                // "Hosp Rate (%): " + Math.round(d.properties.hospitalization_rate) + "<br>"
                 // "Testing Rate (per 100K): " + Math.round(d.properties.test_rate*10)/10 + "<br>"
              )
          	})

             // fade out tooltip on mouse out
             .on("mouseout", function(d) {
                 div.transition()
                    .duration(500)
                    .style("opacity", 0);
             })
    	.style("fill", function(d) {

    	// Get data value
    	var value = d.properties.mystate;

    	if (value) {
    	//If value exists…
    	return color(value);
    	} else {
    	//If value is undefined…
    	return "rgb(213,222,217)";
    	}
    })
    ;


    // Map Indianapolis;
    d3.csv("https://raw.githubusercontent.com/parmsam/covid-19-narrative-viz-indy/master/cities.csv", function(data) {

    svg.selectAll("circle")
    	.data(data)
    	.enter()
    	.append("circle")
    	.attr("cx", function(d) {
    		return projection([d.lon, d.lat])[0];
    	})
    	.attr("cy", function(d) {
    		return projection([d.lon, d.lat])[1];
    	})
    	.attr("r", function(d) {
    		return Math.sqrt(d.years) * 2;
    	})
    		.style("fill", "darkred")
    		.style("opacity", 0.85)

    	// Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
    	// http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
    	.on("mouseover", function(d) {
       	div.transition()
         	   .duration(200)
              .style("opacity", .9);
        div.html("<b>"+d.place+ "</b>" +"<br>" + "Cases: "+ d.counts +
        "<br>" + "Deaths: " + d.deaths +
        "<br>" + "Tests: " + d.tests +
        "<br>" +
        "<br>" + "Case Rate (per 100K): " + (d.case_rate) +
        "<br>" + "Death Rate (per 100K): " + (d.death_rate)
      )
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
    	})

       // fade out tooltip on mouse out
       .on("mouseout", function(d) {
           div.transition()
              .duration(500)
              .style("opacity", 0);
       });
    });

    // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
    var legend = d3.select("body").append("svg")
         			.attr("class", "legend")
        			.attr("width", 140)
       			.attr("height", 200)
      				.selectAll("g")
      				.data(color.domain().slice().reverse())
      				.enter()
      				.append("g")
        			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

     	legend.append("rect")
      		  .attr("width", 18)
      		  .attr("height", 18)
      		  .style("fill", color);

     	legend.append("text")
     		  .data(legendText)
         	  .attr("x", 24)
         	  .attr("y", 9)
         	  .attr("dy", ".35em")
         	  .text(function(d) { return d; });
	});

});
