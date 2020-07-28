// set the dimensions and margins of the graph
var margin = {top: 60, right: 70, bottom: 70, left:65},
    width = 875 - margin.left - margin.right,
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

d3.csv("https://raw.githubusercontent.com/parmsam/covid-19-narrative-viz-indy/master/idwd_unemployement_init_claims_2019_2020.csv",
function(data) {
  data.forEach(function(d) {
    // d.name = d.name;
    // d.year = d.year;
    // d.n = +d.n;
    d.year = d3.timeParse("%m/%d/%Y")(d.Date);
    d.Cases = +d.Initial_Claims
    d.Pct = d.Pct_Change_from_Same_Week_Last_Year;
  });
  var allGroup1 = ["Cases"];

  //var selectedOption = d3.select("#selectMeasure").property("value")
  var selectedOption = 'Cases';
  //console.log(selectedOption);
  // List of groups (here I have one group per column)

  tooltipColor= "#ffffbf";
  // Tooltip
  var tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("background", tooltipColor);

  // Add X axis --> it is a date format
  var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.year; }))
    .range([ 0, width ]);

    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
    .ticks(38))
    .selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "-.5em")
  .attr("transform", "rotate(-90)");
    ;

  var xaxistextLabel = svg.append("text")
     .attr("transform","translate(" + (width/2) + " ," +
                          (height + margin.bottom-0.7) + ")")
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
    .attr("y", 0  - margin.left - 3)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Weekly Unemployment Claims");

// This allows to find the closest X index of the mouse:
  var bisect = d3.bisector(function(d) { return d.year; }).left;

  var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  // Create the circle that travels along the curve of chart
  var focus = svg
    .append('g')
    .append('circle')
      .style("fill", tooltipColor)
      .attr("stroke", "black")
      .attr('r', 8.5)
      .style("opacity", 0);

  //Create the text that travels along the curve of chart
  var focusText = svg
    .append('g')
    .append('text')
      .style("opacity", 0)
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle")
      .style("font-size", "12px");

  var line = svg
    .append('g')
    .append("path")
    .datum(data)
      .attr("d", d3.line()
        .x(function(d) { return x(d.year) })
        .y(function(d) { return y(d[selectedOption]) })
        .curve(d3.curveMonotoneX)
      )
      .attr("stroke", function(d){ return "Black" })
      .style("stroke-width", 2)
      .style("fill", "none")

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

        //Drastic uptick in unemployement claims
      svg
        .append('circle')
        .attr("cx",x(new d3.timeParse("%Y-%m-%d")("2020-03-28")))
        .attr("cy",y(120000))
        .attr('r', 70)
        .style("stroke","black")
        .style("fill","none");
      svg
        .append("line")
        .style("stroke", "black")          // colour the line
        .style("stroke-width", 1)         // adjust line width
        .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-05-19")))     // x position of the first end of the line
        .attr("y1", y(120000))     // y position of the first end of the line
        // .attr("y1", 300)     // y position of the first end of the line
        .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-06-13")))     // x position of the second end of the line
        .attr("y2", y(120000));    // y position of the second end of the line
        // .attr("y2", 200);    // y position of the second end of the line
      svg
        .append("text")
        .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-06-13")))
        .attr("y", y(130000))
        .text("Drastic uptick in unemployement claims")
        .style("fill","black")
        .call(wrap, 70)
        .style("font-size", "13px")

      //small uptick in unemployement clains
      svg
        .append('circle')
        .attr("cx",x(new d3.timeParse("%Y-%m-%d")("2020-06-23")))
        .attr("cy",y(41000))
        .attr('r', 30)
        .style("stroke","black")
        .style("fill","none");
      svg
        .append("line")
        .style("stroke", "black")          // colour the line
        .style("stroke-width", 1)         // adjust line width
        .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-07-15")))     // x position of the first end of the line
        .attr("y1", y(40000))     // y position of the first end of the line
        // .attr("y1", 300)     // y position of the first end of the line
        .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-07-24")))     // x position of the second end of the line
        .attr("y2", y(40000));    // y position of the second end of the line
        // .attr("y2", 200);    // y position of the second end of the line
      svg
        .append("text")
        .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-07-25")))
        .attr("y", y(46000))
        .text("Second smaller uptick in claims")
        .style("fill","black")
        .call(wrap, 70)
        .style("font-size", "10px")


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
    var i = bisect(data, x0, 1);
    selectedData = data[i]
    //data = data;
    focus
      .attr("cx", x(selectedData.year))
      .attr("cy", y(selectedData.Cases))

    focusText.html(monthShortNames[(selectedData.year).getMonth()] + " " +
          (selectedData.year).getDate() +
          ": " + selectedData.Cases + " claims")
      .attr("x", x(selectedData.year)+-40+"px")
      .attr("y", y(selectedData.Cases)+-35+"px");

    tooltip.html("For the week ending on " + weekday[(selectedData.year).getDay()] + " " +
      monthShortNames[(selectedData.year).getMonth()] + ", " +
      (selectedData.year).getDate() + " there were " +
      "<b>" + selectedData.Cases + " unemployement claims</b>." + " This was a <b>" +
      selectedData.Pct +  " change </b> from last year. </b>")
       //.style("left", 500+ "px")
       .style("top", -260 +  "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
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
  // svg.append("circle").
  // attr("cx",350).
  // attr("cy",-10).
  // attr("r", 6).
  // style("fill", "black")
  //
  // svg.append("text").
  // attr("x", 370).
  // attr("y", -10).
  // text("Initial Claims").
  // style("font-size", "15px").
  // attr("alignment-baseline","middle")


  // Add annotations to the chart
  svg
    .append("line")
      .attr("x1", x(new d3.timeParse("%Y-%m-%d")("2020-03-15")) )
      .attr("x2", x(new d3.timeParse("%Y-%m-%d")("2020-03-15")) )
      .attr("y1", y(0))
      .attr("y2", y(55000))
      .attr("stroke", "grey")
      .attr("stroke-dasharray", "4")

  svg
    .append("text")
    .attr("x", x(new d3.timeParse("%Y-%m-%d")("2020-03-15"))+-29+"px")
    .attr("y", y(69000))
    .text("First Indiana COVID-19 Case")
    .call(wrap, 70)
    .style("font-size", "10px")

});
