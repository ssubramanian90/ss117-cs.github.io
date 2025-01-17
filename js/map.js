//Initialize the variables
  var cleanedData= d3.csv("data/map.csv")
  var countriesJson=d3.json("data/raw_data/countries.geo.json")

  var width =  600;
  var height = 400;

  var margin = {
    top: 10,
    bottom: 100,
    left: 130,
    right: 10
  }
  var bodyHeight = height - margin.top - margin.bottom;
  var bodyWidth = width - margin.left - margin.right;

  var projection = d3.geoMercator().scale(97).translate([width / 2, height / 2 + 20]);

  var dataSets={}




  function airlineGrouping(data) {

    var airlineDict = data.reduce((airlineDict, d) => {

      //Get present values of the the airline.
      var present = airlineDict[d.AirlineID] || {"AirlineID": d.AirlineID,"AirlineName": d.AirlineName,"numberOfFlights": 0}

      present.numberOfFlights +=  1 //Increment the count by 1.

      airlineDict[d.AirlineID] = present //Save the updated information in the dictionary using the airline id as key.

      return airlineDict;
    }, {})


    airlineKeys = Object.keys(airlineDict) // Get the keys
    airlineDict = airlineKeys.map(key => airlineDict[key])
    airlineDict = airlineDict.sort((x,y) => d3.descending(x.numberOfFlights, y.numberOfFlights))      //Sort in descending order of number of flights.

    return airlineDict
  }




  function displayFlightPaths(airlineID) {
      var flightpaths = dataSets.flightpaths

      var fPaths = flightpaths.filter(d => d.AirlineID === airlineID)//Filter flight paths by Airline ID

      var container = d3.select('#Map')
      var fData = container.selectAll("line").data(fPaths, d => d.ID) //filter which flightpaths have been added or removed.

      container.selectAll("line")
              .data(fPaths, d => d.ID).enter().append("line")
        .attr("x1", d => projection([d.SourceLongitude, d.SourceLatitude])[0])
        .attr("y1", d => projection([d.SourceLongitude, d.SourceLatitude])[1])
        .attr("x2", d => projection([d.DestinationLongitude, d.DestinationLatitude])[0])
        .attr("y2", d => projection([d.DestinationLongitude, d.DestinationLatitude])[1])
        .attr("stroke", "#2a5599")

      fData.exit().remove()
  }



  function displayBars(airlinesData) {


    var xScale = d3.scaleLinear()
          .range([0, bodyWidth])
          .domain([0, d3.max(airlinesData, d => d.numberOfFlights)])

    var yScale = d3.scaleBand()
          .range([0, bodyHeight])
          .domain(airlinesData.map(a => a.AirlineName))
          .padding(0.2)

   var xAxis = d3.axisBottom(xScale).ticks(5)
   var yAxis = d3.axisLeft(yScale).ticks(5)


   var container = d3.select("#AirlinesChart")

   container
     .attr("width", width)
     .attr("height", height)
     .append("g")
        .style("transform",
          `translate(${margin.left}px,${margin.top}px)`
        )
        .selectAll(".bar")
        .data(airlinesData)
        .enter()
        .append("rect")
        .attr("height", yScale.bandwidth())
        .attr("y", (d) => yScale(d.AirlineName))
        .attr("width", (d) => xScale(d.numberOfFlights))
        .attr("fill", "#2a5599")
        .on("mouseenter", function(d) {
          displayFlightPaths(d.AirlineID)
          d3.select(this)
            .attr("fill", "#992a2a")
         })
         .on("mouseleave", function(d) {
           displayFlightPaths(null)
           d3.select(this)
             .attr("fill", "#2a5599")
          })


     container.append("g")
           .style("transform",
               `translate(${margin.left}px,${height - margin.bottom}px)`
           )
           .call(xAxis)


     container.append("g")
           .style("transform",
               `translate(${margin.left}px,${margin.top}px)`
           )
           .call(yAxis)

    container.append("g").append("rect").attr("x", 10)
                                              .attr("y", 10)
                                             .attr("width", 200)
                                             .attr("height", 100)
                                             .style("fill", "red")
                                             .attr("transform",
                                              function(d){ return "translate(350,100)";});;

    container.append("g").append("text")
        .attr("transform",
              function(){ return "translate(370,130)";})
        .attr("font-size", "2em")
        .attr("color", "black")
        .text("Ryanair has the ");

   container.append("g").append("text")
            .attr("transform",
                  function(){ return "translate(370,150)";})
            .attr("font-size", "2em")
            .attr("color", "black")
            .text("highest number ");

  container.append("g").append("text")
            .attr("transform",
                  function(){ return "translate(370,170)";})
            .attr("font-size", "2em")
            .attr("color", "black")
            .text("of flights and is ");

  container.append("g").append("text")
                      .attr("transform",
                            function(){ return "translate(370,190)";})
                      .attr("font-size", "2em")
                      .attr("color", "black")
                      .text("conc. in Europe");

    container.append("g")
    .append('line')
    .style("stroke", "black")
    .style("stroke-width", 5)
    .attr("x1", 380)
    .attr("y1", 110)
    .attr("x2", 570)
    .attr("y2", 20);

    container.append("g")
    .append('line')
    .style("stroke", "black")
    .style("stroke-width", 5)
    .attr("x1", 550)
    .attr("y1", 150)
    .attr("x2", 600)
    .attr("y2", 150);

  }



  function displayAirports(airports, countries) {

    container = d3.select("#map");
    var path = d3.geoPath().projection(projection)

    container.attr("width", width).attr("height", height)
    .selectAll("path").data(countries.features)
    .enter().append("path")
    .attr("d",d => path(d))
    .attr("stroke", "#ccc")
    .attr("fill", "#eee")


    container.attr("width", width).attr("height", height)
    .selectAll("circle")
                        .data(airports)
                        .enter().append("circle")
                        .attr("r", 1)
                        .attr("cx", d => projection([d.Longitude, d.Latitude])[0])
                        .attr("cy", d => projection([d.Longitude, d.Latitude])[1])
                        .attr("fill", "#2a5599");
  }

  function airportGrouping(data) {
      var airlineDict = data.reduce((airlineDict, d) => {

          var presentDest = airlineDict[d.DestinationAirportID] || {
              "AirportID": d.DestinationAirportID,
              "Airport": d.DestinationAirport,
              "Latitude": +d.DestinationLatitude,
              "Longitude": +d.DestinationLongitude,
              "City": d.DestinationCity,
              "Country": d.DestinationCountry,
              "numberOfFlights": 0
          }

          presentDest.numberOfFlights += 1
          airlineDict[d.DestinationAirportID] = presentDest

          var presentSource = airlineDict[d.SourceAirportID] || {
              "AirportID": d.SourceAirportID,
              "Airport": d.SourceAirport,
              "Latitude": +d.SourceLatitude,
              "Longitude": +d.SourceLongitude,
              "City": d.SourceCity,
              "Country": d.SourceCountry,
              "numberOfFlights": 0
          }
          presentSource.numberOfFlights += 1
          airlineDict[d.SourceAirportID] = presentSource

          return airlineDict
      }, {})

      airlineKeys= Object.keys(airlineDict)
      airlineDict = airlineKeys.map(key => airlineDict[key])
      return airlineDict
  }




  function displayAll() {

    displayBars(airlineGrouping(dataSets.flightpaths))


    displayAirports(airportGrouping(dataSets.flightpaths),dataSets.geo)

    displayFlightPaths("24")
  }

  Promise.all([
      cleanedData,
      countriesJson,
  ]).then(datasets => {
      dataSets.flightpaths = datasets[0]; // Capture flightpaths/routes
      dataSets.geo = datasets[1]          //Capture country data from the JSON data
      return dataSets;
  }).then(displayAll);
