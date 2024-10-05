/* ****************************************************************************
Author: Honor Jang
Class: CSc 352

Description:
This program is the C file associated with 3d.h, which was written by Ben
Dickens. It contains all the code that handles the functionality of Scene3D,
including code for the operations of:
- creating a Scene3D
- adding a pyramid to the scene
- adding a cuboid (cubes and rectangular prisms) to the scene
- adding a sphere to the scene
- adding a cube-based fractal (cubestep) to the scene
- writing the scene's contents to a text-based STL file
- writing the scene's contents to a binary-based STL file
- destroying the scene

Please view 3d.h for most of the function comments; only helper functions that
were not defined by 3d.h have function comments here.
*/

#include <string.h>
#include <math.h>

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

#include "3d.h"

// See 3d.h for the function comment.
Scene3D* Scene3D_create() {
	Scene3D* scene = calloc(sizeof(Scene3D), 1);
	scene -> count = 0;
	scene -> root = NULL;	
	return scene;
}

// See 3d.h for the function comment.
void Scene3D_destroy(Scene3D* scene) {
	Triangle3DNode* cur = scene -> root;

	while (cur != NULL) {
		Triangle3DNode* next = cur -> next;
		free(cur);
		cur = next;
	}	

	free(scene);
}

// See 3d.h for the function comment.
void Scene3D_write_stl_text(Scene3D* scene, char* file_name) {
	Triangle3DNode* cur = scene -> root;

	// Opens file; returns if there's some error with opening it.
	FILE* ptr = fopen(file_name, "w");
	if (ptr == NULL) { return; }

	// Writes contents
	fprintf(ptr, "solid scene\n");
	while (cur != NULL) {
		
		Triangle3D tri = cur -> triangle;

		fprintf(ptr, "  facet normal 0.0 0.0 0.0\n");	
		fprintf(ptr, "    outer loop\n");
		
		// Writes in the vertex information
		fprintf(ptr, "      vertex %0.5f %0.5f %0.5f\n",
			tri.a.x, tri.a.y, tri.a.z);
		fprintf(ptr, "      vertex %0.5f %0.5f %0.5f\n",
			tri.b.x, tri.b.y, tri.b.z);
		fprintf(ptr, "      vertex %0.5f %0.5f %0.5f\n",
			tri.c.x, tri.c.y, tri.c.z);

		fprintf(ptr, "    endloop\n");
		fprintf(ptr, "  endfacet\n");

		cur = cur -> next;
	}
	fprintf(ptr, "endsolid scene\n");

	// Closes the file
	fclose(ptr);
}

/*
This function adds a triangle to the scene, then adds 1 to scene -> count.
There's not much more to say about it.
Args:	scene, a pointer to the Scene3D we want to add a triangle to
	tri, the Triangle3D we want to add to the scene
Return: cur or node, a pointer to an updated Triangle3DNode
*/
void Scene3D_add_triangle(Scene3D* scene, Triangle3D tri) {
	Triangle3DNode* node = calloc(sizeof(Triangle3DNode), 1);
	node -> triangle = tri;
	node -> next = scene -> root;
	scene -> root = node;

	scene -> count += 1;
}

// See 3d.h for the function comment; code came from the specs.
void Scene3D_add_quadrilateral(Scene3D* scene,
Coordinate3D a, Coordinate3D b, Coordinate3D c, Coordinate3D d) {
	Triangle3D triangle_1 = (Triangle3D) {a, b, c};
	Triangle3D triangle_2 = (Triangle3D) {b, c, d};
	Triangle3D triangle_3 = (Triangle3D) {a, c, d};
	Triangle3D triangle_4 = (Triangle3D) {a, b, d};
	
	Scene3D_add_triangle(scene, triangle_1);
	Scene3D_add_triangle(scene, triangle_2);
	Scene3D_add_triangle(scene, triangle_3);
	Scene3D_add_triangle(scene, triangle_4);
}

// See 3d.h for the function comment.
void Scene3D_add_pyramid(Scene3D* scene, Coordinate3D origin, 
    double width, double height, char* orientation) {
	double offset = width/2;

	// tl = top left, br = bottom right, etc.
	// might not be accurate to that, but I tried.
	Coordinate3D base_tl = {origin.x, origin.y, origin.z};
	Coordinate3D base_tr = {origin.x, origin.y, origin.z};
	Coordinate3D base_bl = {origin.x, origin.y, origin.z};	
	Coordinate3D base_br = {origin.x, origin.y, origin.z};
	Coordinate3D point = {origin.x, origin.y, origin.z};

	// Handles vertix placements, depending on orientation
	if (strcmp(orientation, "up") == 0) {
		base_tl.x -= offset; base_tl.y -= offset;
		base_bl.x -= offset; base_bl.y += offset;
		base_tr.x += offset; base_tr.y -= offset;
		base_br.x += offset; base_br.y += offset;
		point.z += height;
	} else if (strcmp(orientation, "down") == 0) {
		base_tl.x -= offset; base_tl.y -= offset;
		base_bl.x -= offset; base_bl.y += offset;
		base_tr.x += offset; base_tr.y -= offset;
		base_br.x += offset; base_br.y += offset;
		point.z -= height;
	} else if (strcmp(orientation, "right") == 0) {
		base_tl.z -= offset; base_tl.y -= offset;
		base_bl.z -= offset; base_bl.y += offset;
		base_tr.z += offset; base_tr.y -= offset;
		base_br.z += offset; base_br.y += offset;
		point.x += height;
	} else if (strcmp(orientation, "left") == 0) {
		base_tl.z -= offset; base_tl.y -= offset;
		base_bl.z -= offset; base_bl.y += offset;
		base_tr.z += offset; base_tr.y -= offset;
		base_br.z += offset; base_br.y += offset;
		point.x -= height;
	} else if (strcmp(orientation, "forward") == 0) {
		base_tl.z -= offset; base_tl.x -= offset;
		base_bl.z -= offset; base_bl.x += offset;
		base_tr.z += offset; base_tr.x -= offset;
		base_br.z += offset; base_br.x += offset;
		point.y += height;
	} else if (strcmp(orientation, "backward") == 0) {
		base_tl.z -= offset; base_tl.x -= offset;
		base_bl.z -= offset; base_bl.x += offset;
		base_tr.z += offset; base_tr.x -= offset;
		base_br.z += offset; base_br.x += offset;
		point.y -= height;
	} else { return; } // Invalid orientations don't get to be made.
	
	// Add faces
	Scene3D_add_quadrilateral(scene, base_tl, base_tr, base_bl, base_br);
	Scene3D_add_triangle(scene, (Triangle3D) {point, base_tl, base_tr});
	Scene3D_add_triangle(scene, (Triangle3D) {point, base_bl, base_br});
	Scene3D_add_triangle(scene, (Triangle3D) {point, base_br, base_tr});
	Scene3D_add_triangle(scene, (Triangle3D) {point, base_tl, base_bl});
}

// See 3d.h for the function comment.
void Scene3D_add_cuboid(Scene3D* scene, Coordinate3D origin, 
    double width, double height, double depth) {
	double offset_w = width/2;
	double offset_h = height/2;
	double offset_d = depth/2;

	// Could not figure a good naming, but they're vertices (v1 = vertix 1)
	// (v1, v2, v3, v4) and (v5, v6, v7, v8) were the original faces
	Coordinate3D v1 = (Coordinate3D) {origin.x - offset_w, 
		origin.y - offset_h, origin.z - offset_d};
	Coordinate3D v2 = (Coordinate3D) {origin.x + offset_w, 
		origin.y - offset_h, origin.z - offset_d};
	Coordinate3D v3 = (Coordinate3D) {origin.x - offset_w, 
		origin.y + offset_h, origin.z - offset_d};
	Coordinate3D v4 = (Coordinate3D) {origin.x + offset_w, 
		origin.y + offset_h, origin.z - offset_d};

	Coordinate3D v5 = (Coordinate3D) {origin.x - offset_w, 
		origin.y - offset_h, origin.z + offset_d};
	Coordinate3D v6 = (Coordinate3D) {origin.x + offset_w, 
		origin.y - offset_h, origin.z + offset_d};
	Coordinate3D v7 = (Coordinate3D) {origin.x - offset_w, 
		origin.y + offset_h, origin.z + offset_d};
	Coordinate3D v8 = (Coordinate3D) {origin.x + offset_w, 
		origin.y + offset_h, origin.z + offset_d};

	// Add the faces
	Scene3D_add_quadrilateral(scene, v1, v2, v3, v4);
	Scene3D_add_quadrilateral(scene, v5, v6, v7, v8);
	Scene3D_add_quadrilateral(scene, v1, v2, v5, v6);
	Scene3D_add_quadrilateral(scene, v3, v4, v7, v8);
	Scene3D_add_quadrilateral(scene, v2, v4, v6, v8);
	Scene3D_add_quadrilateral(scene, v1, v3, v5, v7);
}

/*
This function rounds a double to four decimal points; if the double is in the 
range [-0.00005, 0.00005), it will round the double to 0.
Args:	value, a double to be rounded, likely the x/y/z value of a
		Coordinate3D
Return: value, the rounded version of the original value
*/
double round_double(double value) {
	if (value >= 0) { 
		value = (double) ((int)(10000 * value + 0.5))/10000;
	} else {
		value = (double) ((int)(10000 * value - 0.5))/10000;
	}
	if (value >= -0.00005 && value < 0.00005) { return 0; }
	return value;			    
}

// See 3d.h for the function comment.
void Scene3D_add_sphere(Scene3D* scene, Coordinate3D origin,
    double radius, double increment) {
	for (double phi = increment; phi <= 180; phi += increment) {
		for (double theta = 0; theta < 360; theta += increment) {
			// con for conversion from degrees to radians
			double con = PI/180; 

			// Calculating coordinates as per instructions
			Coordinate3D v[4];
			v[0] = (Coordinate3D) {
				origin.x + (radius * sin(phi * con) *
				    cos(theta * con)),
				origin.y + (radius * sin(phi * con) *
				    sin(theta * con)),
				origin.z + (radius * cos(phi * con))
			};
			v[1] = (Coordinate3D) {
				origin.x + (radius * sin((phi - increment)
				    * con) * cos(theta* con)),
				origin.y + (radius * sin((phi - increment)
				    * con) * sin(theta* con)),
				origin.z + (radius * cos((phi - increment)
				    * con))
			};
			v[2] = (Coordinate3D) {
				origin.x + (radius * sin(phi * con) *
				    cos((theta - increment) * con)),
				origin.y + (radius * sin(phi * con) *
				    sin((theta - increment) * con)),
				origin.z + (radius * cos(phi * con))
			};
			v[3] = (Coordinate3D) {
				origin.x + (radius * sin((phi - increment)
				    * con) * cos((theta - increment)* con)),
				origin.y + (radius * sin((phi - increment)
				    * con) * sin((theta - increment)* con)),
				origin.z + (radius * cos((phi - increment)
				    * con))
			};

			// Handling rounding
			for (int i = 0; i < 4; i++) {
				v[i].x = round_double(v[i].x);
				v[i].y = round_double(v[i].y);
				v[i].z = round_double(v[i].z);
			}

			Scene3D_add_quadrilateral(scene,
				v[0], v[1], v[2], v[3]);
		}
	}
}

// See 3d.h for the function comment.
void Scene3D_add_fractal(Scene3D* scene, Coordinate3D origin,
    double size, int levels) {
	Scene3D_add_cuboid(scene, origin, size, size, size);

	if (levels > 1) {
		Coordinate3D origins[6];
		origins[0] =
		    (Coordinate3D) {origin.x, origin.y, origin.z + size/2};
		origins[1] = 
		    (Coordinate3D) {origin.x, origin.y, origin.z - size/2};
		origins[2] =
		    (Coordinate3D) {origin.x, origin.y + size/2, origin.z};
		origins[3] =
		    (Coordinate3D) {origin.x, origin.y - size/2, origin.z};
		origins[4] =
		    (Coordinate3D) {origin.x + size/2, origin.y, origin.z};
		origins[5] =
		    (Coordinate3D) {origin.x - size/2, origin.y, origin.z};

		for (int i = 0; i < 6; i++) {
			Scene3D_add_fractal(scene, origins[i],
			    size/2, levels-1);
		}
	}
}

// See 3d.h for the function comment.
void Scene3D_write_stl_binary(Scene3D* scene, char* file_name) {
	Triangle3DNode* cur = scene -> root;

	// Opens file; returns if there's some error with opening it.
	FILE* ptr = fopen(file_name, "wb");
	if (ptr == NULL) { return; }
	
	// Header
	int32_t zero = 0;
	for(int i = 0; i < 20; i++) {
    		fwrite(&zero, sizeof(int32_t), 1, ptr);
	}
	
	// Facet count
	fwrite(&(scene -> count), sizeof(uint32_t), 1, ptr);

	// Facets
	while (cur != NULL) {
		// First 12 bytes
		float temp = 0.0f;
		for (int i = 0; i < 3; i++) {
			fwrite(&temp, sizeof(float), 1, ptr);
		}

		// Corner locations
		Triangle3D tri = cur -> triangle;
		Coordinate3D vertices[3] = {tri.a, tri.b, tri.c};
		
		for (int i = 0; i < 3; i++) {
			float x = vertices[i].x;
			float y = vertices[i].y;
			float z = vertices[i].z;
			fwrite(&(x), sizeof(float), 1, ptr);
			fwrite(&(y), sizeof(float), 1, ptr);
			fwrite(&(z), sizeof(float), 1, ptr);
		}

		// End
		uint16_t end = 0;
		fwrite(&end, sizeof(uint16_t), 1, ptr);

		cur = cur -> next;
	}
	
	// Closes the file
	fclose(ptr);	
}
