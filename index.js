// set the dimensions and margins of the graph
var margin = {top: 30, right: 70, bottom: 30, left:30},
    width = 800 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

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

//Read the data
d3.csv("https://raw.githubusercontent.com/parmsam/covid-19-narrative-viz-indy/master/covid_report_county_date.csv",

function(data) {

    data.forEach(function(d) {
      // d.name = d.name;
      // d.year = d.year;
      // d.n = +d.n;
      d.name = d.COUNTY_NAME;
      d.year = d3.timeParse("%Y-%m-%d")(d.DATE);
      d.n_deaths = +d.COVID_COUNT;
      d.n_cases = +d.COVID_COUNT;
      d.n_tests = +d.COVID_TEST;
      d.case_07da = +d.case_07da;
    });
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
    var myColor = d3.scaleOrdinal()
      .domain(allGroup)
      .range(d3.schemeTableau10);

    // Tooltip
    var tooltip = d3.select("#my_dataviz")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("background", myColor("valueA"));


    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return d.year; }))
      .range([ 0, width ]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.n_deaths; })])
      .range([ height, 0 ]);

    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y));


  // This allows to find the closest X index of the mouse:
    var bisect = d3.bisector(function(d) { return d.year; }).left;

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Create the circle that travels along the curve of chart
    var focus = svg
      .append('g')
      .append('circle')
        .style("fill", "lightsteelblue")
        .attr("stroke", "black")
        .attr('r', 8.5)
        .style("opacity", 0)

    // Create the text that travels along the curve of chart
    var focusText = svg
      .append('g')
      .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    var choice = "Marion";
    // Initialize line with first group of the list
    var line = svg
      .append('g')
      .append("path")
        .datum(data.filter(function(d){return d.name==choice}))
        .attr("d", d3.line()
          .x(function(d) { return x(d.year) })
          .y(function(d) { return y(d.n_deaths) })
          .curve(d3.curveMonotoneX)
        )
        .attr("stroke", function(d){ return myColor("valueA") })
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
        .style("fill", "none")

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
      //focusText.style("opacity",1);
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
      // focusText.html(weekday[(selectedData.year).getDay()] + " " +
      //   monthShortNames[(selectedData.year).getMonth()] + " " +
      //   (selectedData.year).getDate() +
      //   " = " + selectedData.n)
      //   .attr("x", x(selectedData.year) + 15)
      //   .attr("y", y(selectedData.n) - 15);
        tooltip.html("On " + weekday[(selectedData.year).getDay()] + " " +
        monthShortNames[(selectedData.year).getMonth()] + ", " +
        (selectedData.year).getDate() + " in " + choice + " County, IN " + " there was " +
        "<b>"+ selectedData.n_deaths + " case(s)</b>" + " with a rolling <b>7 day average of " +
        selectedData.case_07da +"</b>")
              .style("left", (d3.mouse(this)[0]+400) + "px")
               //.style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
               //.style("top", (d3.mouse(this)[1]-30) + "px").duration(2)
      }
    function mouseout() {
      focus.style("opacity", 0)
      focusText.style("opacity", 0)
    }


    // A function that update the chart
    function updateChart(selectedGroup) {

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
        .domain([0, d3.max(dataFilter, function(d) { return +d.n_deaths; })])
        .range([ height, 0 ]);
      //svg.append("g")
      //  .call(d3.axisLeft(y));
      svg.selectAll(".y.axis")
           .call(d3.axisLeft(y));

      // Give these new data to update line
      line
          .datum(dataFilter)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(d.year) })
            .y(function(d) { return y(+d.n_deaths) })
            .curve(d3.curveMonotoneX)
          )
          .attr("stroke", function(d){ return myColor(selectedGroup) })

      line2
          .datum(dataFilter)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(d.year) })
            .y(function(d) { return y(+d.case_07da) })
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
          .attr("cy", y(selectedData.case_07da))
        tooltip.html("On " + weekday[(selectedData.year).getDay()] + " " +
        monthShortNames[(selectedData.year).getMonth()] + ", " +
        (selectedData.year).getDate() + " in " + choice + " County, IN " + " there was " +
        "<b>"+ selectedData.n + " case(s)</b>")
               .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
               .style("top", (d3.mouse(this)[1]-30) + "px").duration(2)
      }

      tooltip.style("background", myColor(selectedGroup));
    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        updateChart(selectedOption)
        choice = selectedOption;
    })

})
