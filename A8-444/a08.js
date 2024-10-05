// 
// a08.js
// CSC444 Assignment 08, Spring 2024
// Honor Jang
// Base by Joshua A. Levine <josh@arizona.edu>
//
// This file provides draws treemaps based on a data set of a given
// format, namely something like this:
// { "name": "root",
//    "children": [
//        {
//          "name": "child1",
//          "size": 10
//        }
//    ] };
// It allows for four different drawing patterns, such that the boxes
// are drawn based on size or count (see functions) and split either
// based on depth or if width/height is larger.


////////////////////////////////////////////////////////////////////////
// Global variables for the dataset 

// HINT: Start with one of the smaller test datesets included in
// test-cases.js instead of the larger tree in flare.js
//let data = test_1;
//let data = test_2;
let data = flare;



////////////////////////////////////////////////////////////////////////
// Tree related helper functions


/*
This function calculates the sizes of each node based on either the
data supplying a size or the sum of the sizes of the node's children.

Args: 
	- tree, an Object representing a tree node
Returns:
	- tree.size, the size of tree (as well as setting the size of
		this node and its children)
*/
function setTreeSize(tree)
{
  if (tree.children !== undefined) {
    let size = 0;
    for (let i=0; i<tree.children.length; ++i) {
      size += setTreeSize(tree.children[i]);
    }
    tree.size = size;
  }
  if (tree.children === undefined) {
    // do nothing, tree.size is already defined for leaves
  }
  return tree.size;
};

/*
This function calculates the count of each node based on the number of
children it has.

Args: 
	- tree, an Object representing a tree node
Returns:
	- tree.count, the count of tree (1 if it has no children, the
		number of children if it does)
*/
function setTreeCount(tree)
{
  if (tree.children !== undefined) {
    let count = 0;
    for (let i=0; i<tree.children.length; ++i) {
      count += setTreeCount(tree.children[i]);
    }
    tree.count = count;
  }
  if (tree.children === undefined) {
    tree.count = 1;
  }
  return tree.count;
}

/*
This function calculates the depth of each node based on distance from
root (which has a depth of 0)

Args: 
	- tree, an Object representing a tree node
        - depth, an int representing the depth of this node
Returns:
	- height, an int representing the max depth of the tree
        - also sets the depth of tree and its children.
*/
function setTreeDepth(tree, depth)
{
  height = depth
  if (tree.children !== undefined) {
    for (let i=0; i<tree.children.length; ++i) {
      // Finds maximum depth
      let sub = setTreeDepth(tree.children[i], depth+1);
      if (height < sub) { height = sub; }
    }
  }
  tree.depth = depth;
  return height;
};


// Initialize the size, count, and depth variables within the tree
setTreeSize(data);
setTreeCount(data);
let maxDepth = setTreeDepth(data, 0);

// Colormap. I like the colors :)
let cMap = d3.scaleLinear()
               .domain([maxDepth+2, 0])
               .range(["white", "#583c87"])
               .interpolate(d3.interpolateHcl);

////////////////////////////////////////////////////////////////////////
// Main Code for the Treemapping Technique

/*
This function creates the rectangles for the treemap data and scales
them according to what attrFun gives for the data (t.size or t.count)
and the first rect information (in x1 x2 y1 y2 format). The mode 
indicates if the normal alternating split is used or the "best"
direction (width if wide, height if tall) is used instead.

Args: 
        - rect, an Object representing the first tree rect 
	- tree, an Object representing a tree node
        - attrFun, a function that returns a certain attribute 
		(t.size / t.count)
	- mode, a string indicating if we should use the "best" 
		direction ("best") or not (anything else) 
Returns:
	- nothing; sets the rectangle coords.
*/
function setRectangles(rect, tree, attrFun, mode)
{
  tree.rect = rect;

  if (tree.children !== undefined) {
    // get the attribute info
    let cumulativeSizes = [0];
    for (let i=0; i<tree.children.length; ++i) {
      cumulativeSizes.push(cumulativeSizes[i] + attrFun(tree.children[i]));
    }
    
    let rectWidth = rect.x2 - rect.x1;
    let rectHeight = rect.y2 - rect.y1; 
    let border = 5;

    // determine how to split.
    let comp = tree.depth % 2 == 0;
    if (mode == "best") { comp = rectWidth > rectHeight; }
    
    
    let scale = d3.scaleLinear()
            .domain([0, cumulativeSizes[cumulativeSizes.length-1]]);
    
    if (comp) { scale = scale.range([0, rectWidth - border*2]) } 
    else { scale = scale.range([0, rectHeight - border*2]) }

    
    let pos = { x: rect.x1 + border, y: rect.y1 + border };
    for (let i=0; i<tree.children.length; ++i) {
      let newRect = { x1: pos.x, x2: rect.x2 - border, 
                      y1: pos.y, y2: rect.y2 - border };

      // Calculate positions
      let diff = scale(attrFun(tree.children[i]));
      if (comp) {
        newRect.x2 = pos.x + diff; pos.x += diff;
      } else {
        newRect.y2 = pos.y + diff; pos.y += diff;
      }

      // recurse
      setRectangles(newRect, tree.children[i], attrFun, mode);
    }
  }
}

// initialize the tree map
let winWidth = window.innerWidth;
let winHeight = window.innerHeight;

// compute the rectangles for each tree node
setRectangles(
  {x1: 0, y1: 0, x2: winWidth, y2: winHeight}, data,
  function(t) { return t.size; }, ""
);

// make a list of all tree nodes;
function makeTreeNodeList(tree, lst)
{
  lst.push(tree);
  if (tree.children !== undefined) {
    for (let i=0; i<tree.children.length; ++i) {
      makeTreeNodeList(tree.children[i], lst);
    }
  }
}

let treeNodeList = [];
makeTreeNodeList(data, treeNodeList);



////////////////////////////////////////////////////////////////////////
// Visual Encoding portion

// d3 selection to draw the tree map 
let gs = d3.select("#svg")
           .attr("width", winWidth)
           .attr("height", winHeight)
           .selectAll("g")
           .data(treeNodeList)
           .enter()
           .append("g");

function setAttrs(sel) {
  // TODO: WRITE THIS PART.
  sel.attr("width", function(treeNode) { // set to 0 if neg
                       let w = treeNode.rect.x2 - treeNode.rect.x1; 
                       if (w < 0) { return 0; } return w
           })
     .attr("height", function(treeNode) { // set to 0 if neg
                       let h = treeNode.rect.y2 - treeNode.rect.y1; 
                       if (h < 0) { return 0; } return h
          })
     .attr("x", function(treeNode) { return treeNode.rect.x1; })
     .attr("y", function(treeNode) { return treeNode.rect.y1; })
     .attr("fill", function(treeNode) { return cMap(treeNode.depth); })
     .attr("stroke", function(treeNode) { return "black"; });
}

gs.append("rect").call(setAttrs);



////////////////////////////////////////////////////////////////////////
// Callbacks for buttons

d3.select("#size").on("click", function() {
  setRectangles(
    {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data, 
    function(t) { return t.size; }, ""
  );
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});

d3.select("#count").on("click", function() {
  setRectangles(
    {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data, 
    function(t) { return t.count; }, ""
  );
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});


d3.select("#best-size").on("click", function() {
  setRectangles(
    {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data, 
    function(t) { return t.size; }, "best"
  );
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});

d3.select("#best-count").on("click", function() {
  setRectangles(
    {x1: 0, x2: winWidth, y1: 0, y2: winHeight}, data, 
    function(t) { return t.count; }, "best"
  );
  d3.selectAll("rect").transition().duration(1000).call(setAttrs);
});