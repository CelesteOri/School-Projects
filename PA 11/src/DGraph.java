/* *****************************************************************************
* AUTHOR: Honor Jang
* FILE: DGraph.java
* ASSIGNMENT: Programming Assignment 11 - Traveling Salesman
* COURSE: CSc 210; Fall 2021
* 
* PURPOSE: 
* 	Creates a weighted "graph", so that every point is connected by an "edge"
* 	or "path" with an associated "cost".
* 	Also attempts to find the shortest possible path that visits all points
* 	on the graph through the method named in the method name. Details
* 	in the methods in question (heuristic, mine, backtrack).
*
* USAGE: 
* 	Make an "graph" of points that connect to every other point in the graph
* 	with a certain weighted edge. Calculates the shortest path (heuristic may
* 	not find the true shortest path, but will find the path with the individual
* 	paths with lowest costs from point A to point B).
* 	Contains several methods, including:
* 		- DGraph(int numVertices): constructor; initializes a DGraph object
* 			with the given number of vertices, or "points"
* 		- addEdge(int start, int end, double w): adds a path between a start
* 			and end point, with an associated weight of w
* 		- heuristic(int start, boolean print): finds a path through all points
* 			without passing through the same point twice; picks the shortest
* 			path between valid adjacent points but may not actually give the 
* 			true shortest path; has the print boolean so it doesn't need to
* 			print the path itself if the TIME command is run
* 		- backtrack(int start, boolean print)): starts the corresponding
* 			pathfinding method; has the print boolean so it doesn't need to
* 			print the path itself if the TIME command is run
* 		- backtrackSteps(List<Integer> path, double pathCost): finds a path
* 			through all points without passing through the same point twice;
* 			recursively finds all possible paths (there will be (numVertices)!
* 			end results) and saves the current best (least costly) path to the
* 			private BacktrackVers object
* 		- mine(int start, boolean print)): modified version of backtrack; 
* 			starts the corresponding pathfinding method; has the print boolean
* 			so it doesn't need to print the path itself if the TIME command is
* 			run
* 		- mySteps(List<Integer> path, double pathCost): finds a path through
* 			all points without passing through the same point twice;
* 			recursively finds the possible paths that do not exceed the current
* 			best (least costly) path's cost (if that path is null, the first
* 			found path will be saved into the private BacktrackVers object, and
* 			the program continues as normal); saves the best path to the 
* 			private BacktrackVers object
* 		- time(int start, boolean print): times the heuristic, mine, and
* 			backtrack methods; has the boolean for debug reasons, but should 
* 			not affect the user
* 		- printHelp(List<Integer> path, String totalCost, boolean print): helps
* 			with printing for all pathfinding methods
* 	Also contains internal classes. Check code for details.
*/

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class DGraph {
	/*
	* A private class for use in DGraph. Creates an edge, which saves an end
	* point and a weight; meant to be stored in a List, where the index 
	* represents the starting point
	* 
	* It has one method:
	* 	- Edge(int v, double w): constructor; initializes an Edge
	*/
	private class Edge {
		private int label;
		private double weight;
		
		public Edge(int v, double w) {
			label = v;
			weight = w;
		}
	}
	
	/*
	* A private class for use in DGraph. Creates an object that stores a path
	* and a cost. This is meant to be a path with its associated cost.
	* Used to save the lowest-cost path in mine and backtrack.
	* 
	* It has one method:
	* 	- BacktrackVers(List<Integer> p, double w): constructor; initializes
	* 		a BacktrackVers object
	*/
	private class BacktrackVers {
		private List<Integer> path;
		private double cost;
		
		public BacktrackVers(List<Integer> p, double w) {
			path = p;
			cost = w;
		}
	}
	
	// Get reinitialized every time mine or backtrack is run
	private BacktrackVers best;
	
	private int numVertices;
	private List<LinkedList<Edge>> adjList = new ArrayList<>();
	
	public DGraph(int numVertices) { 
		this.numVertices = numVertices; 
		for (int i = 0; i < numVertices; i++) {
			adjList.add(new LinkedList<Edge>());
		}
	} 
 
	public void addEdge(int start, int end, double w) { 
		adjList.get(start).add(new Edge(end,w)); 
	} 
	
	public double heuristic(int start, boolean print) {
		List<Integer> path = new ArrayList<>(); 
		path.add(start);
		double totalCost = 0;
		
		while (path.size() <= numVertices)  {
			LinkedList<Edge> newStart = adjList.get(path.get(path.size()-1));
			int next = -1;
			double cost = -1;
			
			for (int i = 0; i < newStart.size(); i++) {
				int v = newStart.get(i).label;
				double c = newStart.get(i).weight;
				if (v == 0 && path.size() == numVertices){
					totalCost += c;
				} else if ((cost == -1 || c <= cost) && !path.contains(v)) {
					if (next == -1 || (c == cost && v < next) || c < cost) {
						next = v;
						cost = c;
					}
				}
			}
			if (path.size() < numVertices) {
				path.add(next); 
				totalCost += cost;
			} else {
				break;
			}
		}
		printHelp(path, String.format("%.1f",totalCost), print);
		return totalCost;
	}
	
	private void printHelp(List<Integer> path, String totalCost,
			boolean print) {
		if (print) {
			String text = "cost = " + totalCost + ", visitOrder = [";
			if (path != null) {
				for (int i = 0; i < path.size(); i++) {
					text += Integer.toString(path.get(i) + 1);
					if (i<path.size()-1) {
						text += ", ";
					}
				}
			}
			System.out.println(text + "]");
		}
	}

	public double backtrack(int start, boolean print) {
		List<Integer> path = new ArrayList<>(); 
		best = new BacktrackVers(null, -1);
		path.add(start);
		backtrackSteps(path, 0);
		printHelp(best.path, String.format("%.1f",best.cost), print);
		return best.cost;
	}
	
	private void backtrackSteps(List<Integer> path, double pathCost) {
		LinkedList<Edge> newStart = adjList.get(path.get(path.size()-1));

    	for (int i = 0; i < newStart.size(); i++) {
    		int v = newStart.get(i).label;
    		double c = newStart.get(i).weight;
    		
    		if (path.size() == numVertices && v == 0){
    			pathCost += c;
        		if (best.path == null || best.cost > pathCost) {
        			best.cost = pathCost;
        			best.path = new ArrayList<Integer>();
        			for (int j = 0; j < path.size(); j++) {
        				best.path.add(path.get(j));
        			}
        		}
        		break;
        	}
    		if (!path.contains(v)) {
    			path.add(v);
    			backtrackSteps(path, pathCost + c);
    			// backtrack for the path
    			path.remove(path.size() - 1);
    		}
    	}
    }
	
	public double mine(int start, boolean print) {
		List<Integer> path = new ArrayList<>(); 
		best = new BacktrackVers(null, -1);
		path.add(start);
		mySteps(path, 0);
		printHelp(best.path, String.format("%.1f",best.cost), print);
		return best.cost;
	}
	
	private void mySteps(List<Integer> path, double pathCost) {
		LinkedList<Edge> newStart = adjList.get(path.get(path.size()-1));

    	for (int i = 0; i < newStart.size(); i++) {
    		int v = newStart.get(i).label;
    		double c = newStart.get(i).weight;
    		if (path.size() == numVertices && v == 0){
    			pathCost += c;
        		if (best.path == null || best.cost > pathCost) {
        			best.cost = pathCost;
        			best.path = new ArrayList<Integer>();
        			for (int j = 0; j < path.size(); j++) {
        				best.path.add(path.get(j));
        			}
        		}
        		break;
        	}
    		
    		if (!path.contains(v)) {
    			if (pathCost + c < best.cost || best.path == null) {
	    			path.add(v);
	    			mySteps(path, pathCost + c);
	    			// backtrack for the path
	    			path.remove(path.size() - 1);
    			}
    		}
    	}
    }

	public void time(int start, boolean print) {
		long startTime = System.nanoTime();
		double trip = heuristic(start, print);
		long endTime = System.nanoTime();
		long duration = (endTime - startTime) / 1000000;
		System.out.println("heuristic: cost = " + trip + ", " + duration +
		" milliseconds");
		
		startTime = System.nanoTime();
		trip = mine(start, print);
		endTime = System.nanoTime();
		duration = (endTime - startTime) / 1000000;
		System.out.println("mine: cost = " + trip + ", " + duration +
		" milliseconds");
		
		startTime = System.nanoTime();
		trip = backtrack(start, print);
		endTime = System.nanoTime();
		duration = (endTime - startTime) / 1000000;
		System.out.println("backtrack: cost = " + trip + ", " + duration +
		" milliseconds");
	}
}