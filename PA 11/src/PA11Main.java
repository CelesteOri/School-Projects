/* *****************************************************************************
* AUTHOR: Honor Jang
* FILE: PA11Main.java
* ASSIGNMENT: Programming Assignment 11 - Traveling Salesman
* COURSE: CSc 210; Fall 2021
* 
* PURPOSE: 
* 	Runs as the main program, so that it can take in command line arguments,
* 	save file data, and put it into a DGraph object.
*
* USAGE: 
* 	Meant to take a command argument to read two arguments.
* 	The first is a file name, and the program opens the file to save the data
* 	into a DGraph object.
* 	It then executes a method of the DGraph according to the second argument,
* 	which will attempt to search for the shortest path in that way.
* 	Contains a method:
* 		- fileReader(String fileName): opens a file and reads the data; ignores
* 			any line that starts with a %; copies data into a DGraph object;
* 			returns a DGraph object.
* 		
*/

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;

public class PA11Main {
	
	/*
	* A private method that opens a file and reads the data; ignores
	* any line that starts with a %; copies data into a DGraph object;
	* returns a DGraph object.
	*
	* @param fileName, a string that gives a file name / its directory
	* @return a DGraph with all the information found in the file
	*/ 
	private static DGraph fileReader(String fileName) {
		DGraph graph = null;
		
		Scanner rawFile = null;
		// Handles error-checking for unfound files.
		try { rawFile = new Scanner(new File(fileName));}
		catch(FileNotFoundException e) {e.printStackTrace();}
		
		// Reads all lines and splits at whitespace
	    while (rawFile.hasNext()) {
	    	String[] line = rawFile.nextLine().split("( )+");
	    	
	    	// Ignore lines that start with %; those are comments
	    	if (line[0].charAt(0) != '%') {
	    		// First line initializes the graph
	    		if (graph == null) {
	    			int size = Integer.parseInt(line[0]);
	    			graph = new DGraph(size);
	    		} 
	    		// All following lines give data for the graph edges
	    		else {
	    			int start = Integer.parseInt(line[0])-1;
	    			int end = Integer.parseInt(line[1])-1;
	    			double cost = Double.parseDouble(line[2]);
	    			graph.addEdge(start, end, cost);
	    		}
	    	}
	    }
		
		return graph;
	}

	public static void main(String[] args) {
		DGraph graph = fileReader(args[0]);
		
		// All commands, case sensitive. Check DGraph.java for details
		if (args[1].equals("HEURISTIC")) {
			graph.heuristic(0, true);
		} else if (args[1].equals("BACKTRACK")) {
			graph.backtrack(0, true);
		} else if (args[1].equals("MINE")) {
			graph.mine(0, true);
		} else if (args[1].equals("TIME")) {
			graph.time(0, false);
		}
		
	}

}
