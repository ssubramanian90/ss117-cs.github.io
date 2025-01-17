function bubbleChart() {
  var width = 1200;
  var height =700;


  // location to centre the bubbles
  var centre = { x: width/2, y: height/2 };

  var countryCenters = {

    US: { x: width / 9, y: height / 2 },
    UK: { x: 2*width / 9, y: height / 2 },
    China: { x: 3 * width / 9, y: height / 2 },
    France: { x: 4 * width / 9, y: height / 2 },
    Spain:{ x:5 * width / 9, y: height / 2 },
    Germany:{ x:6 * width / 9, y: height / 2 },
    Italy:{ x:7 * width / 9, y: height / 2 },
    Others:{ x: 8 * width / 9, y: height / 2 }

  };

  // X locations of the country titles.
  var countryTitleX = {
    US: width / 9,
    UK: 2*width / 9,
    China: 3 * width / 9,
    France: 4 * width / 9,
    Spain: 5 * width / 9,
    Germany:6 * width / 9,
    Italy:7 * width / 9,
    Others: 8 * width / 9
  };

  // strength to apply to the position forces
  var forceStrength = 0.03;

  // these will be set in createNodes and chart functions
  var svg = null;
  var bubbles = null;
  var labels = null;
  var nodes = [];

  // charge is dependent on size of the bubble, so bigger towards the middle
  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }

  // create a force simulation and add forces to it
  var simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('charge', d3.forceManyBody().strength(charge))
    .force('x', d3.forceX().strength(forceStrength).x(centre.x))
    .force('y', d3.forceY().strength(forceStrength).y(centre.y))
    .on('tick', ticked);


  // force simulation starts up automatically, which we don't want as there aren't any nodes yet
  simulation.stop();


  const fillColour = d3.scaleOrdinal(d3.schemeCategory10)
  .domain(['US','UK','China','France','Spain','Germany', 'Italy','Others']);


  function createNodes(rawData) {

    var maxAmount = d3.max(rawData, function (d) { return +d.flights; });


    var radiusScale = d3.scalePow()
      .exponent(0.5)
      .range([2, 85])
      .domain([0, maxAmount]);



    var myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: radiusScale(+d.flights/32),
        flights: +d.flights,
        city: d.city,
        country: d.country,
        x: Math.random() * 600,
        y: Math.random() * 600
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.flights - a.flights; });

    return myNodes;
  }


  var chart = function chart(selector, rawData) {
    // convert raw data into nodes data
    nodes = createNodes(rawData);

    // create svg element inside provided selector
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)


    elements = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    svg.append("g").append("rect").attr("x", 10)
                                                .attr("y", 10)
                                               .attr("width", 600)
                                               .attr("height", 30)
                                               .style("fill", "red")
                                               .attr("transform",
                                                function(d){ return "translate(400,100)";});;

    svg.append("g").append("text")
          .attr("transform",
                function(){ return "translate(420,130)";})
          .attr("font-size", "2em")
          .attr("color", "black")
          .text("US and Others have the highest number of flights ");




      var tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('pointer-events', 'none')
        .style('width', 240)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");


    var mouseover = function(d) {
            tooltip
                .style("opacity", 1)
                .style("visibility", "visible")
                .html
                ('<span class="name">City: </span><span class="value">' +
                                d.city +
                                '</span><br/>' +
                                '<span class="name">Flights: </span><span class="value">' +
                                d.flights +
                                '</span><br/>' +
                                '<span class="name">Country: </span><span class="value">' +
                                d.country +
                                '</span>')
                .style("left", (d3.event.pageX) + "px")
                         .style("top", (d3.event.pageY - 28) + "px");;

          d3.select(this)
                                  .style("stroke", "black")
                                  .style("opacity", 1)
          }


    var mouseleave = function(d) {
          d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
          tooltip
              .style("opacity", 0)
        }

    bubbles = elements
      .enter()
      .append('circle')
      .classed('bubble', true)
      .attr('r', d => d.radius)
      .attr('fill', d => fillColour(d.country))
      .attr('stroke-width', 2)
      .on('mouseover',mouseover)
      .on("mouseleave", mouseleave);






    // set simulation's nodes to our newly created nodes array
    // simulation starts running automatically once nodes are set
    simulation.nodes(nodes);


    groupBubbles();
  }

  function ticked() {
    bubbles
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)


  }

  function nodeCountryPos(d) {
    return countryCenters[d.country].x;
  }

  function groupBubbles() {
    hideCountryTitles();


    simulation.force('x', d3.forceX().strength(forceStrength).x(centre.x));


    simulation.alpha(1).restart();
  }

  function hideCountryTitles() {
    svg.selectAll('.country').remove();
  }

  function splitBubbles() {
    showCountryTitles();


    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeCountryPos));


    simulation.alpha(1).restart();
  }

  function showCountryTitles() {
    var countryData = d3.keys(countryTitleX);
    var country = svg.selectAll('.country')
      .data(countryData);

    country.enter().append('text')
      .attr('class', 'country')
      .attr('x', function (d) { return countryTitleX[d]; })
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }




  chart.toggleDisplay = function (displayName) {
    if (displayName === 'country') {
      splitBubbles();
    } else {
      groupBubbles();
    }
  };
  return chart;
}


var myBubbleChart = bubbleChart();


function display(data) {

  myBubbleChart('#vis', data);
}


function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.

      myBubbleChart.toggleDisplay(buttonId);
    });
}


// load data
d3.csv('data/bubble.csv').then(display);

setupButtons();
