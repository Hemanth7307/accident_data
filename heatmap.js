// heatmap.js

// Set up the dimensions for the map
const width = 960;
const height = 600;

// Create an SVG element to draw the map
const svg = d3.select("#us-map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Set up a projection and path generator for the USA map
const projection = d3.geoAlbersUsa()  // U.S.-centric projection
  .translate([width / 2, height / 2])  // Center the map
  .scale(1200);  // Adjust the scale

const path = d3.geoPath()
  .projection(projection);

// Define the color scale for the heatmap (based on accident counts)
const color = d3.scaleSequential(d3.interpolateReds)
  .domain([0, 10000]);  // Example domain - adjust based on actual accident count

// Load the GeoJSON data for the USA map and bind it to the SVG
d3.json("https://d3js.org/us-10m.v1.json").then(function(us) {

  console.log("US TopoJSON data loaded: ", us);  // Debugging

  // Example accident data mapped to state FIPS codes (use real data here)
  const accidentsPerState = {
    "06": 5000,  // California (FIPS 06)
    "48": 4500,  // Texas (FIPS 48)
    "12": 3500,  // Florida (FIPS 12)
    "36": 3000,  // New York (FIPS 36)
    "17": 2500,  // Illinois (FIPS 17)
    // Add more states based on your dataset
  };

  // Log the accident data for debugging
  console.log("Accidents per state: ", accidentsPerState);

  // Draw the map - Process the states using TopoJSON
  svg.append("g")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
    .attr("d", path)
    .attr("fill", function(d) {
      const stateCode = d.id;  // TopoJSON states use FIPS codes
      const accidentCount = accidentsPerState[stateCode] || 0;
      console.log("State FIPS: ", stateCode, "Accidents: ", accidentCount);  // Debugging each state
      return color(accidentCount);  // Fill state based on accident count
    })
    .attr("stroke", "#333")
    .on("mouseover", function(event, d) {
      const stateCode = d.id;
      const accidentCount = accidentsPerState[stateCode] || 0;
      d3.select("#tooltip")
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY + 5) + "px")
        .style("display", "block")
        .html(`State: ${stateCode}<br>Accidents: ${accidentCount}`);
    })
    .on("mouseout", function() {
      d3.select("#tooltip").style("display", "none");
    });

  // Add a legend for the heatmap
  const legendWidth = 300;
  const legendHeight = 20;
  
  const legendSvg = svg.append("g")
    .attr("transform", `translate(${width - legendWidth - 20}, ${height - 40})`);

  const gradient = legendSvg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%");

  gradient.append("stop").attr("offset", "0%").attr("stop-color", d3.interpolateReds(0));
  gradient.append("stop").attr("offset", "100%").attr("stop-color", d3.interpolateReds(1));

  legendSvg.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#gradient)");

  const legendScale = d3.scaleLinear()
    .domain([0, d3.max(Object.values(accidentsPerState))])
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale)
    .ticks(5);

  legendSvg.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis);

}).catch(function(error) {
  console.error("Error loading or processing the TopoJSON: ", error);
});
