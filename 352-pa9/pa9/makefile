gcc_args = -Wall -Werror -std=c11

generator: 3d.o generator.c
	gcc $(gcc_args) -o generator generator.c 3d.o -lm
3d.o: 3d.c 3d.h
	gcc $(gcc_args) -c 3d.c -lm
clean: 
	rm -f 3d.o
	rm -f generator