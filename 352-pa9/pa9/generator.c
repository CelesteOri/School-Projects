/* ****************************************************************************
Author: Honor Jang
Class: CSc 352

Description:
This program creates a scene and makes an STL file for it (output.stl). The 
scene in question shows low-poly "text" reading "CSC 352", accompanied by a
two sparkles made from pyramids, a cubestep fractal, and a sphere. After
creating the STL file, the program frees up all used memory.

Note: This is pretty much the exact same program as the last generator (from
PA 8), replacing two sparkles with a sphere and fractal. This should fulfill
the requirements, but I apologize for the laziness.
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "3d.h"

/*
This function draws a C onto the scene with three cuboids, where the origin is
the center of the bottom cuboid.
Args:	scene, a pointer to the Scene3D we want to draw a C onto
	origin, a Coordinate3D that gives the location of the center of C's
		bottom cuboid
Return: nothing; draws a C onto the scene
*/
void draw_C(Scene3D* scene, Coordinate3D origin) {
	Coordinate3D top = (Coordinate3D) // As in top of the C
		{origin.x, origin.y, origin.z - 100};
	Coordinate3D side = (Coordinate3D) // As in side of the C
		{origin.x - 30, origin.y, origin.z - 50};

	Scene3D_add_cuboid(scene, origin, 80, 20, 20);
	Scene3D_add_cuboid(scene, side, 20, 20, 120);
	Scene3D_add_cuboid(scene, top, 80, 20, 20);
}

/*
This function draws a 3 onto the scene with four cuboids, where the origin is
the center of the bottom cuboid.
Args:	scene, a pointer to the Scene3D we want to draw a 3 onto
	origin, a Coordinate3D that gives the location of the center of 3's
		bottom cuboid
Return: nothing; draws a 3 onto the scene
*/
void draw_3(Scene3D* scene, Coordinate3D origin) {
	Coordinate3D top = (Coordinate3D) // As in top of the 3
		{origin.x, origin.y, origin.z - 100};
	Coordinate3D mid = (Coordinate3D) // As in middle of the 3
		{origin.x, origin.y, origin.z - 50};
	Coordinate3D side = (Coordinate3D) // As in side of the C
		{origin.x + 30, origin.y, origin.z - 50};

	Scene3D_add_cuboid(scene, origin, 80, 20, 20);
	Scene3D_add_cuboid(scene, mid, 80, 20, 20);
	Scene3D_add_cuboid(scene, side, 20, 20, 120);
	Scene3D_add_cuboid(scene, top, 80, 20, 20);
}

/*
This function draws an S, 5, or 2 onto the scene with five cuboids, where
the origin is the center of the bottom cuboid. S and 5 are identical; 2
has a different placement of the sides. The one that's drawn is indicated
by the third parameter, type.
Args:	scene, a pointer to the Scene3D we want to draw a 3 onto
	origin, a Coordinate3D that gives the location of the center of 3's
		bottom cuboid
	type, an int that indicates what should be drawn (only draws 2 if
		type = 2)
Return: nothing; draws an S or 5 (if type is not 2), or 2 (if type is 2), onto
		the scene
*/
void draw_S_or_2_or_5(Scene3D* scene, Coordinate3D origin, int type) {
	Coordinate3D top = (Coordinate3D) 
		{origin.x, origin.y, origin.z - 100};
	Coordinate3D mid = (Coordinate3D) 
		{origin.x, origin.y, origin.z - 50};
	Coordinate3D side1 = (Coordinate3D)
		{origin.x - 30, origin.y, origin.z - 75};
	Coordinate3D side2 = (Coordinate3D)
		{origin.x + 30, origin.y, origin.z - 25};

	// Change side placement if it's supposed to draw a 2
	if (type == 2) {
		side1 = (Coordinate3D)
			{origin.x + 30, origin.y, origin.z - 75};
		side2 = (Coordinate3D)
			{origin.x - 30, origin.y, origin.z - 25};
	}

	Scene3D_add_cuboid(scene, origin, 80, 20, 20);
	Scene3D_add_cuboid(scene, side1, 20, 20, 70);
	Scene3D_add_cuboid(scene, mid, 80, 20, 20);
	Scene3D_add_cuboid(scene, side2, 20, 20, 70);
	Scene3D_add_cuboid(scene, top, 80, 20, 20);
}

/*
This function is a slightly edited version of the star code given in the
specs. It makes a star out of six pyramids of a given size at a given
location in the scene.
Args:	scene, a pointer to the Scene3D we want to draw a star onto
	origin, a Coordinate3D that gives the location of the center of the
		star
	size, a long that indicates the size of the star (ie, the pyramids'
		widths and heights equal this value)
Return: nothing; draws a star
*/
void draw_star(Scene3D* scene, Coordinate3D origin, long size) {
	char* directions[] = {"up", "down", "left", "right", "forward", "backward"};
	for (int i = 0; i <= 5; i ++) {
		Scene3D_add_pyramid(scene, origin, size, size, directions[i]);
	}
}

int main() {
	Scene3D* scene = Scene3D_create();
	
	// CSC
	Coordinate3D place_C1 = (Coordinate3D) {0, 0, 0};
	draw_C(scene, place_C1);
	Coordinate3D place_S = (Coordinate3D) {100, 0, 0};
	draw_S_or_2_or_5(scene, place_S, 5);
	Coordinate3D place_C2 = (Coordinate3D) {200, 0, 0};
	draw_C(scene, place_C2);

	// 352
	Coordinate3D place_3 = (Coordinate3D) {350, 0, 0};
	draw_3(scene, place_3);
	Coordinate3D place_5 = (Coordinate3D) {450, 0, 0};
	draw_S_or_2_or_5(scene, place_5, 5);
	Coordinate3D place_2 = (Coordinate3D) {550, 0, 0};
	draw_S_or_2_or_5(scene, place_2, 2);

	// Sparkles
	Coordinate3D star1 = (Coordinate3D) {0, 0, -150};
	draw_star(scene, star1, 20);
	Coordinate3D star2 = (Coordinate3D) {-80, 0, -40};
	draw_star(scene, star2, 10);

	// Here's the sphere
	Coordinate3D sphere = (Coordinate3D) {600, 0, -150};
	Scene3D_add_sphere(scene, sphere, 10, 5);

	// Here's a fractal (it's hard to distinguish from afar)
	Coordinate3D fractal = (Coordinate3D) {630, 0, 10};
	Scene3D_add_fractal(scene, fractal, 20, 4);

	// If you want the text version, uncomment the line below
	//Scene3D_write_stl_text(scene, "output_txt.stl");

	Scene3D_write_stl_binary(scene, "output_bin.stl");

	Scene3D_destroy(scene);

	return 0;
}