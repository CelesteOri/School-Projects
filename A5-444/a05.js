// 
// a05.js
// CSC444 Assignment 05, Spring 2024
// Base by Joshua A. Levine <josh@email.arizona.edu>
// Functions filled by Honor Jang <honorljang@arizona.edu>
//
// This file gave the skeleton code for A05. It generates (using index.html
// and data.js) grids of 50x50 rectangles to visualize the Hurricane Isabel
// dataset.
//
// The four color functions were implemented as per the specs, with P3 being
// a little more complex for the sake of readability. Function comments 
// provide a little more information. Unedited code (everything but the color
// functions were not given further comments.
//


//////////////////////////////////////////////////////////////////////////////
// Global variables, preliminaries to draw the grid of rectangles

var svgSize = 500;
var bands = 50;

var xScale = d3.scaleLinear().domain([0, bands]).  range([0, svgSize]);
var yScale = d3.scaleLinear().domain([-1,bands-1]).range([svgSize, 0]);

function createSvg(sel)
{
    return sel
        .append("svg")
        .attr("width", svgSize)
        .attr("height", svgSize);
}

function createRects(sel)
{
    return sel
        .append("g")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) { return xScale(d.Col); })
        .attr("y", function(d) { return yScale(d.Row); })
        .attr("width", 10)
        .attr("height", 10)
}

d3.selection.prototype.callAndReturn = function(callable)
{
    return callable(this);
};

//////////////////////////////////////////////////////////////////////////////
// Color functions 

/*
This function calculates the color for some shape (a rect, in usage)
based on the temperature. It uses the RGB colorspace, and those has some
distortion (does not have a uniform percieved difference). Due to how the
data is, this is hard to see.

Args: 
	- d: an Object with a T field that is associated with an int value
		between -70 and -60 (inclusive)
Returns:
	- a color based on the T field between a purple (#583c87) and white
*/
function colorT1(d) {
     let cMap = d3.scaleLinear()	
               .domain([-70, -60])
               .range(["#583c87", "white"])

     return cMap(d.T)
}

/*
This function calculates the color for some shape (a rect, in usage)
based on the temperature. It has a uniform percieved difference by using
HCL interpolation. Due to how the data is, this is hard to see. However, 
the graph does look purpler than the version using colorT1.

Args: 
	- d: an Object with a T field that is associated with an int value
		between -70 and -60 (inclusive)
Returns:
	- a color based on the T field between a purple (#583c87) and white
		using HCL interpolation
*/
function colorT2(d) {
     let cMap = d3.scaleLinear()	
               .domain([-70, -60])
               .range(["#583c87", "white"])
               .interpolate(d3.interpolateHcl);

     return cMap(d.T)
}

/*
This function calculates the color for some shape (a rect, in usage)
based on the pressure. It uses Lab values to make the magnitudes consistent
based on distance from 0. Negative pressures are blue, postives are yellow.
The lightness is ramped up as the pressure approaches 0 to make neutral areas
more apparent.

Args: 
	- d: an Object with a P field that is associated with an int value
		between -500 and 200 (inclusive); in practice, it can take
		-500 to 500 (inclusive).
Returns:
	- a color based on the P field between blue and yellow
*/
function colorP3(d) {
     // Makes the whole thing more readable by ramping L toward the center
     let plScale = d3.scaleLinear()
                   .domain([-500, 0, 500])
                   .range([10, 100, 10])

     // Colors based on P along the yellow-blue "axis"
     let pScale = d3.scaleLinear()
                   .domain([-500, 500])
                   .range([-100, 100])

     return d3.lab(plScale(d.P), 0, pScale(d.P));
}

/*
This function calculates the color for some shape (a rect, in usage)
based on the pressure and temperature. It uses Lab values to make the
magnitudes consistent based on distance from 0. Negative pressures are blue,
postives are yellow. The lightness is dependent on temperature (darker is
colder).

Args: 
	- d: an Object with a P field that is associated with an int value
		between -500 and 200 (inclusive) [in practice, it can take
		-500 to 500 (inclusive)] and a T field that is associated
		with an int value between -70 and -60 (inclusive)
Returns:
	- a color based on the P and T fields between blue and yellow and
		given a lightness based on T
*/
function colorPT4(d) {
     // Colors based on P along the yellow-blue "axis"
     let pScale = d3.scaleLinear()
                   .domain([-500, 500])
                   .range([-100, 100])

     // Changes lightness of the color based on T
     let tScale = d3.scaleLinear()
                   .domain([-70,-60])
                   .range([40,100])

     return d3.lab(tScale(d.T), 0, pScale(d.P));
}


//////////////////////////////////////////////////////////////////////////////
// Hook up the color functions with the fill attributes for the rects


d3.select("#plot1-temperature")
    .callAndReturn(createSvg)
    .callAndReturn(createRects)
    .attr("fill", colorT1);

d3.select("#plot2-temperature")
    .callAndReturn(createSvg)
    .callAndReturn(createRects)
    .attr("fill", colorT2);

d3.select("#plot3-pressure")
    .callAndReturn(createSvg)
    .callAndReturn(createRects)
    .attr("fill", colorP3);

d3.select("#plot4-bivariate")
    .callAndReturn(createSvg)
    .callAndReturn(createRects)
    .attr("fill", colorPT4);



