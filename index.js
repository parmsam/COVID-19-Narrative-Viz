// set the dimensions and margins of the graph
var margin = {top: 60, right: 70, bottom: 35, left:45},
    width = 900 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
            "July", "Aug", "Sep", "Oct", "Nov", "Dec"]
var weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";


// function setupSelections(chartConfig, rawData) {
//   const confirmedRadio = document.getElementById("confirmed");
//   const DeathsRadio = document.getElementById("Deaths");
//
// addChangeListener(confirmedRadio);

//Read the data
d3.csv("https://raw.githubusercontent.com/parmsam/covid-19-narrative-viz-indy/master/covid_report_county_date.csv",

function(data) {

    data.forEach(function(d) {
      // d.name = d.name;
      // d.year = d.year;
      // d.n = +d.n;
      d.name = d.COUNTY_NAME;
      d.year = d3.timeParse("%Y-%m-%d")(d.DATE);
      d.Deaths = +d.COVID_DEATHS;
      d.Cases = +d.COVID_COUNT;
      d.Tests = +d.COVID_TEST;
      d.case_07da = +d.case_07da;
      // d.death_07da = +d.death_07da;
    });

    var allGroup1 = ["Cases", "Deaths"];

    d3.select("#selectMeasure")
       .selectAll('myOptions')
      	.data(allGroup1)
       .enter()
     	.append('option')
       .text(function (d) { return d; }) // text showed in the menu
       .attr("value", function (d) { return d; }) // corresponding value returned by the button

    //var selectedOption = d3.select("#selectMeasure").property("value")
    var selectedOption = 'Cases';
    //console.log(selectedOption);
    // List of groups (here I have one group per column)
    var allGroup = d3.map(data, function(d){return(d.name)}).keys()

    // add the options to the button
    d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(allGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button
      .property("selected", function(d){ return d === "Marion"; })

    // A color scale: one color for each group
    // var myColor = d3.scaleOrdinal()
    //   .domain(allGroup)
    //   .range(d3.schemeTableau10);

    var myColor = {
      "Cases":"#2b83ba",
      "Deaths":"#d7191c"
    };

    mytooltipColor = {
      "Cases":"lightblue",
      "Deaths":"salmon"
    };
    tooltipColor = mytooltipColor[selectedOption];

    // Tooltip
    var tooltip = d3.select("#my_dataviz")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("frameborder","black")
      .style("background", tooltipColor);


    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return d.year; }))
      .range([ 0, width ]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    var xaxistextLabel = svg.append("text")
       .attr("transform","translate(" + (width/2) + " ," +
                            (height + margin.bottom-0.9) + ")")
       .style("text-anchor", "middle")
       .text("Date");

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d[selectedOption]; })])
      .range([ height, 0 ]);

    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y));
      // text label for the y axis
    var yaxistextLabel = svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0  - margin.left - 4)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(selectedOption);



  // This allows to find the closest X index of the mouse:
    var bisect = d3.bisector(function(d) { return d.year; }).left;

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Create the circle that travels along the curve of chart
    var focus = svg
      .append('g')
      .append('circle')
        .style("fill", "lightcyan")
        .attr("stroke", "black")
        .attr('r', 15)
        .style("opacity", 0)
        .attr("stroke-width","2px");


    // Create the text that travels along the curve of chart
    var focusText = svg
      .append('g')
      .append('text')
        .style("opacity", 1)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")
        .attr("font-weight","normal");

    var choice = "Marion";
    // Initialize line with first group of the list
    var line = svg
      .append('g')
      .append("path")
        .datum(data.filter(function(d){return d.name==choice}))
        .attr("d", d3.line()
          .x(function(d) { return x(d.year) })
          .y(function(d) { return y(d[selectedOption]) })
          .curve(d3.curveMonotoneX)
        )
        .attr("stroke", function(d){ return myColor[selectedOption]})
        .style("stroke-width", 2)
        .style("fill", "none")

    var line2 = svg
      .append('g')
      .append("path")
        .datum(data.filter(function(d){return d.name==choice}))
        .attr("d", d3.line()
          .x(function(d) { return x(d.year) })
          .y(function(d) { return y(d.case_07da) })
          .curve(d3.curveMonotoneX)
        )
        .attr("stroke", function(d){ return "black"})
        .style("stroke-width", 3)
        .style("fill", "none");

        /////

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


  // Add annotations to the chart
  svg
    .append("line")
      .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-03-06")) )
      .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-03-06")) )
      .attr("y1", y(0))
      .attr("y2", y(265))
      .attr("stroke", "grey")
      .attr("stroke-dasharray", "4")
  svg
    .append("text")
    .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-03-06"))+-12+"px")
    .attr("y", y(315))
    .text("Public Health Emergency Declared")
    .call(wrap, 70)
    .style("font-size", "9px")


  svg
    .append("line")
      .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-03-15")) )
      .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-03-15")) )
      .attr("y1", y(0))
      .attr("y2", y(265))
      .attr("stroke", "grey")
      .attr("stroke-dasharray", "4")
  svg
    .append("text")
    .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-03-15"))+-12+"px")
    .attr("y", y(305))
    .text("First Indiana Case")
    .call(wrap, 70)
    .style("font-size", "9px")

    svg
      .append("line")
        .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-05-05")) )
        .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-05-05")) )
        .attr("y1", y(0))
        .attr("y2", y(285))
        .attr("stroke", "grey")
        .attr("stroke-dasharray", "4")
    svg
      .append("text")
      .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-05-05"))+4+"px")
      .attr("y", y(325))
      .text("Marion County Case Peak")
      .call(wrap, 70)
      .style("font-size", "9px")

    svg
      .append("line")
        .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-07-12")) )
        .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-07-12")) )
        .attr("y1", y(0))
        .attr("y2", y(265))
        .attr("stroke", "grey")
        .attr("stroke-dasharray", "4")
    svg
      .append("text")
      .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-07-12"))+-12+"px")
      .attr("y", y(315))
      .text("Recent rise in many counties")
      .call(wrap, 70)
      .style("font-size", "9px")

    svg
      .append("line")
        .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-03-16")) )
        .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-03-16")) )
        .attr("y1", y(0))
        .attr("y2", y(355))
        .attr("stroke", "grey")
        .attr("stroke-dasharray", "4")
    svg
      .append("text")
      .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-03-16"))+-5+"px")
      .attr("y", y(365))
      .text("A")
      .style("font-size", "12px")

    svg
      .append("line")
        .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-03-23")) )
        .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-03-23")) )
        .attr("y1", y(0))
        .attr("y2", y(355))
        .attr("stroke", "grey")
        .attr("stroke-dasharray", "4")
    svg
      .append("text")
      .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-03-23"))+-5+"px")
      .attr("y", y(365))
      .text("B")
      .style("font-size", "12px")

    svg
      .append("line")
        .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-04-02")) )
        .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-04-02")) )
        .attr("y1", y(0))
        .attr("y2", y(355))
        .attr("stroke", "grey")
        .attr("stroke-dasharray", "4")
    svg
      .append("text")
      .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-04-02"))+-5+"px")
      .attr("y", y(365))
      .text("C")
      .style("font-size", "12px")

    svg
      .append("line")
        .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-05-01")) )
        .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-05-01")) )
        .attr("y1", y(0))
        .attr("y2", y(355))
        .attr("stroke", "grey")
        .attr("stroke-dasharray", "4")
    svg
      .append("text")
      .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-05-01"))+-5+"px")
      .attr("y", y(365))
      .text("D")
      .style("font-size", "12px")

    svg
      .append("line")
        .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-03-20")) )
        .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-03-20")) )
        .attr("y1", y(0))
        .attr("y2", y(385))
        .attr("stroke", "grey")
        .attr("stroke-dasharray", "4")
    svg
      .append("text")
      .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-03-20"))+-19+"px")
      .attr("y", y(390))
      .text("Stage 1")
      .style("font-size", "13px")

    svg
      .append("line")
        .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-05-04")) )
        .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-05-04")) )
        .attr("y1", y(0))
        .attr("y2", y(385))
        .attr("stroke", "grey")
        .attr("stroke-dasharray", "4")
    svg
      .append("text")
      .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-05-04"))+-19+"px")
      .attr("y", y(390))
      .text("Stage 2")
      .style("font-size", "13px")

    svg
      .append("line")
        .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-05-22")) )
        .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-05-22")) )
        .attr("y1", y(0))
        .attr("y2", y(385))
        .attr("stroke", "grey")
        .attr("stroke-dasharray", "4")
    svg
      .append("text")
      .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-05-22"))+-19+"px")
      .attr("y", y(390))
      .text("Stage 3")
      .style("font-size", "13px")

    svg
      .append("line")
        .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-06-12")) )
        .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-06-12")) )
        .attr("y1", y(0))
        .attr("y2", y(385))
        .attr("stroke", "grey")
        .attr("stroke-dasharray", "4")
    svg
      .append("text")
      .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-06-12"))+-19+"px")
      .attr("y", y(390))
      .text("Stage 4")
      .style("font-size", "13px")

    svg
      .append("line")
        .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-07-04")) )
        .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-07-04")) )
        .attr("y1", y(0))
        .attr("y2", y(385))
        .attr("stroke", "grey")
        .attr("stroke-dasharray", "4")
    svg
      .append("text")
      .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-07-04"))+-19+"px")
      .attr("y", y(390))
      .text("Stage 4.5")
      .style("font-size", "13px")
  // Create a rect on top of the svg area: this rectangle recovers mouse position

    svg
      .append('rect')
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr('width', width)
      .attr('height', height)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseout', mouseout);
    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
      focus.style("opacity", 1);
      focusText.style("opacity",1);
      tooltip.style("opacity", 1);

    }
    function mousemove() {
      // recover coordinate we need
      var x0 = x.invert(d3.mouse(this)[0]);
      var i = bisect(data.filter(function(d){return d.name==choice}), x0, 1);
      selectedData = data.filter(function(d){return d.name==choice})[i];

      focus
        .attr("cx", x(selectedData.year))
        .attr("cy", y(selectedData.case_07da))

      focusText.html(monthShortNames[(selectedData.year).getMonth()] + " " +
          (selectedData.year).getDate() +
          ": " + selectedData[selectedOption] + " " + selectedOption.toLowerCase())
          // .attr("x",  d3.mouse(this)[0])
          // .attr("y",  d3.mouse(this)[1]);
          .attr("x", x(selectedData.year)+-40+"px")
          .attr("y", y(selectedData.case_07da)+-50+"px");

      tooltip.html("<b>Quick Summary:</b> On " + weekday[(selectedData.year).getDay()] + " " +
        monthShortNames[(selectedData.year).getMonth()] + ", " +
        (selectedData.year).getDate() + " in " + choice + " County, IN " + " there were " +
        "<b>"+ selectedData[selectedOption] +" "+ selectedOption + "</b>" +
        " with a rolling <b>7 day average of " +
        selectedData.case_07da + "</b>" + ". There were <b>" + selectedData.Tests + " tests conducted.<b>")
        // .style("left", (d3.event.pageX+30) + "px")
        // .style("top", (d3.event.pageY+30) + "px")
              //.style("left", d3.select(this).attr("cx")+ "px")
              // .style("top", d3.select(this).attr("cy")+ 20 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
               .style("top", 15+  "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
               //.style("top", (d3.mouse(this)[1]-30) + "px").duration(2)
      }
    function mouseout() {
      focus.style("opacity", 0)
      focusText.style("opacity", 0)
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
    }
    //var svg = d3.select("#my_dataviz")

    // Handmade legend
    svg.append("circle").attr("cx",350).attr("cy",-50).attr("r", 6).style("fill", "black")
    svg.append("text").attr("x", 370).attr("y", -50).text("Rolling 7 day average").
    style("font-size", "15px").attr("alignment-baseline","middle")

    svg.append("circle").attr("cx",160).attr("cy",-50).attr("r", 6).style("fill", myColor[selectedOption])
    svg.append("text").attr("x", 180).attr("y", -50).text("Cases").
    style("font-size", "15px").attr("alignment-baseline","middle")


    // A function that update the chart
    function updateChart(selectedGroup, selectedMeasure) {


      selectedMeasure = selectedMeasure.toString();

      //limit legend unless user selected deaths then add that to legend;
      if (selectedMeasure =="Deaths" && (typeof death_legend === 'undefined')){ //only add deaths to legend once
        svg.append("circle").attr("cx",250).attr("cy",-50).attr("r", 6).
        style("fill", myColor[selectedMeasure])
        svg.append("text").attr("x", 270).attr("y", -50).text(selectedMeasure)
        .style("font-size", "15px").attr("alignment-baseline","middle")
        death_legend = "On"; //global var
      }

      // Create new data with the selection?
      var dataFilter = data.filter(function(d){return d.name==selectedGroup})
      //x.domain(d3.extent(dataFilter, function(d) { return d.year; }));
      //y.domain([d3.min(dataFilter, function(d) { return d.n; }), d3.max(dataFilter, function(d) { return d.n; })]);

      //not updating axis to avoid tooltip update right now;
      x = d3.scaleTime()
        .domain(d3.extent(dataFilter, function(d) { return d.year; }))
        .range([ 0, width ]);

      svg.selectAll(".x.axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      y = d3.scaleLinear()
        .domain([0, d3.max(dataFilter, function(d) { return +d[selectedMeasure]; })])
        .range([ height, 0 ]);
      //svg.append("g")
      //  .call(d3.axisLeft(y));
      svg.selectAll(".y.axis")
           .call(d3.axisLeft(y));

      yaxistextLabel.text(selectedMeasure)

      // Give these new data to update line
      line
          .datum(dataFilter)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(d.year) })
            .y(function(d) { return y(+d[selectedMeasure]) })
            .curve(d3.curveMonotoneX)
          )
          .attr("stroke", function(d){ return myColor[selectedMeasure] })

      switch (selectedMeasure) {
        case "Deaths":
          rolling_avg = "death_07da";
          break;
        case "Cases":
          rolling_avg = "case_07da";
          break;
      };

      line2
          .datum(dataFilter)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(d.year) })
            .y(function(d) { return y(+d[rolling_avg]) })
            .curve(d3.curveMonotoneX)
          )
          .attr("stroke", function(d){ return 'black' })
      d3.select(".cx").remove();
      d3.select(".cy").remove();

      function mousemove() {
        // recover coordinate we need
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = bisect(dataFilter.filter(function(d){return d.name==choice}), x0, 1);
        selectedData = dataFilter.filter(function(d){return d.name==choice})[i]
        focus
          .attr("cx", x(selectedData.year))
          .attr("cy", y(selectedData[rolling_avg]))

        focusText.html(monthShortNames[(selectedData.year).getMonth()] + " " +
          (selectedData.year).getDate() +
          ": " + selectedData[selectedMeasure] + " " + selectedMeasure.toLowerCase())
          // .attr("x",  d3.mouse(this)[0])
          // .attr("y",  d3.mouse(this)[1]);
          .attr("x", x(selectedData.year)+-40+"px")
          .attr("y", y(selectedData[rolling_avg])-50+"px");


        tooltip.html("<b>Quick Summary:</b> On " + weekday[(selectedData.year).getDay()] + " " +
          monthShortNames[(selectedData.year).getMonth()] + ", " +
          (selectedData.year).getDate() + " in " + choice + " County, IN " + " there was " +
          "<b>"+ selectedData[selectedMeasure] +" "+ selectedMeasure + "</b>"+ " with a rolling <b>7 day average of " +
          selectedData[rolling_avg] + "</b>"  + ". There were <b>" + selectedData.Tests + " tests conducted.<b>")
                //.style("left", (d3.mouse(this)[0]+400) + "px")
      }

      svg
      .select('rect')
      .on('mousemove', null);

      svg
      .select('rect')
      .on('mousemove', mousemove);

//      tooltipColor= mytooltipColor[selectedOption];

      tooltip.style("background", mytooltipColor[selectedMeasure]);
    }


    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
        // recover the county option that has been chosen
        var selectedOption = d3.select(this).property("value");
        var selectedMeasure = d3.select("#selectMeasure").property("value");
        //console.log(selectedOption);
        //console.log(selectedMeasure);
        // run the updateChart function with this selected option
        updateChart(selectedOption, selectedMeasure)
        choice = selectedOption;
    })

    d3.select("#selectMeasure").on("change", function(d) {
        // recover the county option that has been chosen
        var selectedMeasure = d3.select(this).property("value");
        var selectedOption = d3.select("#selectButton").property("value");

        // run the updateChart function with this selected option
        updateChart(selectedOption, selectedMeasure)
        choice = selectedOption;
    })

})
