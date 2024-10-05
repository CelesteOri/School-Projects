// 
// a10.js
// Template code for CSC444 Assignment 10, Spring 2024
// Joshua A. Levine <josh@arizona.edu>
// Added to By Honor Jang
//
// This implements an editable transfer function to be used in concert
// with the volume renderer defined in volren.js
//
// It expects a div with id 'tfunc' to place the d3 transfer function
// editor
//
// No new function comments per say but the individual steps are all
// commented if I thought they were important


////////////////////////////////////////////////////////////////////////
// Global variables and helper functions

// colorTF and opacityTF store a list of transfer function control
// points.  Each element should be [k, val] where k is a the scalar
// position and val is either a d3.rgb or opacity in [0,1] 
let colorTF = [];
let opacityTF = [];

// D3 layout variables
let size = 500;
let svg = null;

// Variables for the scales
let xScale = null;
let yScale = null;
let colorScale = null;

// makes it easier to adjust for margin differences
margin = {top: 20, right: 20, bottom: 80, left: 50}

////////////////////////////////////////////////////////////////////////
// Visual Encoding portion that handles the d3 aspects

// Function to create the d3 objects
function initializeTFunc() {
  svg = d3.select("#tfunc")
    .append("svg")
    .attr("width", size)
    .attr("height", size);

  // Offset for the graph/axes drawing
  g = svg.append("g")
	.attr("transform", "translate(" + margin.left + "," 
		+ margin.top + ")");

  w = +svg.attr("width") - margin.left - margin.right,
  h = +svg.attr("height") - margin.top - margin.bottom

  //Initialize the axes
  let x = g.append("g").attr("id", "x-axis")
             .attr("transform", "translate(0," + h + ")");
  let y = g.append("g").attr("id", "y-axis");

  //Initialize path for the opacity TF curve
  g.append("g")
    .attr("id", "datapath")
    .append("path").attr("class", "datapath")


  //Initialize circles for the opacity TF control points
  let drag = d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);

  g.append("g")
    .attr("class", "points")
    .selectAll("circle")
    .data(opacityTF)
    .enter()
    .append("circle")
    .attr("index", (d,i) => i)
    .style('cursor', 'pointer')
    .call(drag);

  //Create the color bar to show the color TF
  let cb = g.append("g").attr("id", "colorbar")
           .attr("transform", "translate(0," + (h+20) + ")")
           .attr("width", w)
           .attr("height", 50);

  //After initializing, set up anything that depends on the TF arrays
  updateTFunc();
}

// Call this function whenever a new dataset is loaded or whenever
// colorTF and opacityTF change

function updateTFunc() {
  svg = d3.select("#tfunc").select("svg")
  w = +svg.attr("width") - margin.left - margin.right,
  h = +svg.attr("height") - margin.top - margin.bottom

  //update scales
  xScale = d3.scaleLinear()
             .domain([dataRange[0], dataRange[1]])
             .rangeRound([0, w]);
 
  yScale = d3.scaleLinear()
             .domain([0, 1])
             .rangeRound([h, 0]);

  // Start with sequential colormap
  if (!colorScale) { makeSequential(); }


  //hook up axes to updated scales
  d3.select("#x-axis").call(d3.axisBottom(xScale));
  d3.select("#y-axis").call(d3.axisLeft(yScale));

  // Handle the path
  path = d3.select("#datapath")
  path.selectAll("path").call(setPAttrs);
    
  // Function to draw the path based on the opacity points
  function pathF(d) {
    coords = opacityTF.map((p) => [xScale(p[0]), yScale(p[1])]) 
    return d3.line()( coords );
  }

  // Set attributes for the path (based on the path selection)
  function setPAttrs(sel) {
    sel.attr("d", pathF)
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr("stroke", "black")
  }

  //update opacity curves
  d3.select(".points")
    .selectAll("circle")
    .data(opacityTF).enter()
  d3.selectAll("circle").call(setCAttrs);   

  // Set attributes for the circle (based on the circle selection)
  function setCAttrs(sel) {
    sel.attr("r", 5)
       .attr("cx", (d) => xScale(d[0]) )
       .attr("cy", (d) => yScale(d[1]) )
       .attr("fill", (d) => colorScale(d[0]) )
  }

  // Info for the colorbar
  cbWidth = d3.select("#colorbar").attr("width")
  cbHeight = d3.select("#colorbar").attr("height")
  cbData = Array.apply(null, {length: cbWidth})
                .map(function (x, i) { return i; });

  //update colorbar
  d3.select("#colorbar").selectAll("rect")
    .data(cbData).enter().append("rect")
  d3.selectAll("rect").call(setCBAttrs);   

  // Set attributes for the colorbar (based on the rect selection)
  function setCBAttrs(sel) {
    sel.attr("width", 1)
       .attr("height", cbHeight)
       .attr("x", (d) => d )
       .attr("y", 0)
       .attr("fill", (d) => colorScale(xScale.invert(d)) )
  }
}


// To start, let's reset the TFs and then initialize the d3 SVG canvas
// to draw the default transfer function

resetTFs();
initializeTFunc();


////////////////////////////////////////////////////////////////////////
// Interaction callbacks

// Will track which point is selected
let selected = null;

// Called when mouse down
function dragstarted(event,d) {
  selected = parseInt(d3.select(this).attr("index"));
}

// Called when mouse drags
function dragged(event,d) {
  if (selected != null) {
    let pos = [];
    pos[0] = opacityTF[selected][0];
    pos[1] = opacityTF[selected][1];

    // if not the endpoints
    if (selected > 0 && selected < opacityTF.length-1) {
        x = xScale.invert(event.x)
        // bind it between the two neighbors's x positions
        if (opacityTF[selected-1][0] < x 
            && opacityTF[selected+1][0] > x) { pos[0] = x; }
    }

    y = yScale.invert(event.y - margin.top)
    // stay within the graph in the y axis
    if (y >= 0 && y <= 1) { pos[1] = y; }

    opacityTF[selected] = pos;

    //update TF window
    updateTFunc();
    
    //update volume renderer
    updateVR(colorTF, opacityTF);
  }
}

// Called when mouse up
function dragended() {
  selected = null;
}




////////////////////////////////////////////////////////////////////////
// Function to read data

// Function to process the upload
function upload() {
  if (input.files.length > 0) {
    let file = input.files[0];
    console.log("You chose", file.name);

    let fReader = new FileReader();
    fReader.readAsArrayBuffer(file);

    fReader.onload = function(e) {
      let fileData = fReader.result;

      //load the .vti data and initialize volren
      initializeVR(fileData);

      //upon load, we'll reset the transfer functions completely
      resetTFs();

      //Update the tfunc canvas
      updateTFunc();
      
      //update the TFs with the volren
      updateVR(colorTF, opacityTF, false);
    }
  }
}

// Attach upload process to the loadData button
var input = document.getElementById("loadData");
input.addEventListener("change", upload);


////////////////////////////////////////////////////////////////////////
// Functions to respond to buttons that switch color TFs

function resetTFs() {
  makeSequential();
  makeOpacity();
}

// Make a default opacity TF
function makeOpacity() { 
  // Five opacity points
  base = [0, 1, 2, 3, 4];

  // Make them equidistant on the x and y axes
  opacityTF = base.map((d) => 
       [((dataRange[0] * (4-d)) + (dataRange[1] * d)) / 4 , d/4]);
}

// Make a sequential color TF (magma color scheme)
function makeSequential() {
  // Using nine control points
  base = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  // even dists (nine pieces, eight "cuts"), even color ditribution
  colorTF = base.map((d) => 
       [((dataRange[0] * (8-d)) + (dataRange[1] * d)) / 8 ,
         d3.rgb(d3.interpolateMagma(d/8))]);

  dom = base.map((d) => colorTF[d][0]),
  rag = base.map((d) => colorTF[d][1]);

  colorScale = d3.scaleLinear().domain(dom).range(rag);
}

// Make a diverging color TF (red-white-blue color scheme)
function makeDiverging() {
  // Using nine control points
  base = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  // even dists (nine pieces, eight "cuts"), even color ditribution
  colorTF = base.map((d) => 
       [((dataRange[0] * (8-d)) + (dataRange[1] * d)) / 8 ,
         d3.rgb(d3.interpolateRdBu(d/8))]);
  console.log(colorTF);

  dom = base.map((d) => colorTF[d][0]),
  rag = base.map((d) => colorTF[d][1]);
  console.log(dom);

  colorScale = d3.scaleLinear().domain(dom).range(rag);
}

// Make a sequential color TF (schemeSet1 color scheme)
function makeCategorical() {
  // Using nine control points
  base = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  // whole domain for quantized color scale
  colorScale = d3.scaleQuantize()
      .domain([dataRange[0], dataRange[1]])
  
  // Get the threshold and add 0 to get 9 boundaries
  dom = colorScale.thresholds();
  dom.unshift(0);

  // map to the boundaries in dom, pair with color in schemeSet1
  colorTF = base.map((d) => 
       [((dataRange[0] * (8-d)) + (dataRange[1] * d)) / 8 ,
         d3.rgb(d3.schemeSet1[d])]);

  // Get the range and apply to colorScale
  rag = base.map((d) => colorTF[d][1]);
  colorScale = colorScale.range(rag);
}

// Configure callbacks for each button
d3.select("#sequential").on("click", function() {
  makeSequential();
  updateTFunc();
  updateVR(colorTF, opacityTF, false);
});

d3.select("#diverging").on("click", function() {
  makeDiverging();
  updateTFunc();
  updateVR(colorTF, opacityTF, false);
});

d3.select("#categorical").on("click", function() {
  makeCategorical();
  updateTFunc();
  updateVR(colorTF, opacityTF, true);
});