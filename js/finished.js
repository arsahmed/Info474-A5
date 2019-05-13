'use strict';

(function() {

  let data = ""; // keep data in global scope
  let svgContainer = ""; // keep SVG reference in global scope

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 520);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./data/data.csv")
      .then((csvData) => makeBarChart(csvData));
  }

  // make bar chart with avg line
  function makeBarChart(csvData) {
    data = csvData;

    // get an array of gre year and an array of chance of views
    let year = data.map((row) => parseFloat(row["Year"]));
    let avgView = data.map((row) => parseInt(row["Avg. Viewers (mil)"]));

    let axesLimits = findMinMax(year, avgView);

    // draw axes with ticks and return mapping and scaling functions
    let mapFunctions = drawTicks(axesLimits);

    // plot the data using the mapping and scaling functions
    plotData(mapFunctions);

	// make lables for the axis
	makeLabels();

	// make line to show the avg.
	makeLine();
  }

  // plot all the data points on the SVG
  function plotData(map) {
    let xMap = map.x;
    let yMap = map.y;
	let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('rect')
        .attr('x', xMap)
        .attr('y', yMap)
		.attr('width', '25')
		.attr('height', (d) => 450 - yMap(d))
        .attr('fill', "#4ccec8")
		.attr('stroke-width', '1')
		.attr('stroke', 'rgb(47,79,79)')
		.attr("opacity", 0.9)
		.on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html("<h2>Season: " + d.Season + "</h2><b>Year: </b>" + numberWithCommas(d["Year"])
						    + "<br/> <b>Episodes: </b>" + numberWithCommas(d["Episodes"])
						    + "<br/> <b>Avg. Viewers (mil): </b>" + numberWithCommas(d["Avg. Viewers (mil)"])
						    + "<br/> <b>Most watched episode: </b>" + numberWithCommas(d["Most watched episode"])
						    + "<br/> <b>Viewers (mil): </b>" + numberWithCommas(d["Viewers (mil)"]))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
		
	svgContainer.selectAll('.dot')
      .data(data)
      .enter()
	  .append("text")
        .attr("dy", "-0.5em")
		.attr("dx", "0.9em")
        .attr("y", yMap)
        .attr("x", xMap)
        .attr("text-anchor", "middle")
		.attr("font-family", "sans-serif")
		.attr("font-size", "13px")
		.text(function(d) { return d["Avg. Viewers (mil)"]});
		
  }

  // draw the axes and ticks
  function drawTicks(limits) {
    // return year from a row of data
    let xValue = function(d) { return +d["Year"]; }

    // function to scale year
    let xScale = d3.scaleLinear()
      .domain([limits.yearMin, limits.yearMax + 1]) // give domain buffer room
      .range([55, 850]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return views from a row of data
    let yValue = function(d) { return +d["Avg. Viewers (mil)"]}

    // function to scale views
    let yScale = d3.scaleLinear()
      .domain([limits.viewMax + 1, limits.viewMin - 0.05]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for year and views
  function findMinMax(Year, avgView) {

    // get min/max year
    let yearMin = d3.min(Year);
    let yearMax = d3.max(Year);

    // round x-axis limits
    yearMax = Math.round(yearMax*10)/10;
    yearMin = Math.round(yearMin*10)/10;

    // get min/max views
    let viewMin = 0;
    let viewMax = d3.max(avgView);

    // round y-axis limits to nearest 0.05
    viewMax = Number((Math.ceil(viewMax*20)/20).toFixed(2));
    viewMin = Number((Math.ceil(viewMin*20)/20).toFixed(2));

    // return formatted min/max data as an object
    return {
      yearMin : yearMin,
      yearMax : yearMax,
      viewMin : viewMin,
      viewMax : viewMax
    }
  }
  
  // function to make the line which reflects average views
  function makeLine() {				
	let average = d3.mean(data, function(d) { return d["Avg. Viewers (mil)"]});
	let y = average * 19;
	svgContainer.append('line')
	  .attr("x1", 50)
	  .attr("y1", y)
	  .attr("x2", 850)
	  .attr("y2", y)
	  .attr("stroke-width", 2)
	  .attr("stroke", "grey")
	  .style("stroke-dasharray", ("4, 3"));
	  
	svgContainer.append('text')
      .attr('x', 55)
      .attr('y', y - 2)
      .style('font-size', '10pt')
      .text(Number((average).toFixed(1)));
  }

  // function that makes the lables
  function makeLabels() {

    svgContainer.append('text')
      .attr('x', 400)
      .attr('y', 500)
      .style('font-size', '11pt')
      .text('Year');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 320)rotate(-90)')
      .style('font-size', '11pt')
      .text('Avg. Viewers (in millions)');
  }
  
  
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
