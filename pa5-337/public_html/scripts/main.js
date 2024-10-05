/******************************************************************************
 * Author: Honor Jang
 * Course: CSc 337
 * Project: PA 5
 * Description: The script for Welcome to the Jumble, which handles the
 *	conversion of plain text into their Caesar and square cipher 
 * 	equivalents. It also deals with the shuffling of the square cipher
 *	key. See functions for more specific information.
 * 
 *****************************************************************************/

/* 
This function converts plain text into Caesar text as well as handles its
formatting (due to CSS's overflow apparently not applying to new text).

Parameters:
	None
Return:
	None; updates the HTML to display the Caesar cipher text
*/
function caesarCipher() {
	/* Handles the shift and shift display */
	let shift = document.getElementById("shift").value;
	document.getElementById("shiftNum").innerHTML = shift;	

	let text = document.getElementById("plainText").value.toUpperCase();
	let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let cipher = "";

	/* Going through the plain text */
	for (var i = 0; i < text.length; i++) {
		/* Only applies cipher to alphabetical characters */
		if (alphabet.includes(text.charAt(i))) {
			/* Converts ASCII to equivalent cipher letter value */
			let place = text.charCodeAt(i) - 65 + Number(shift);
			if (place  > 25) { place  -= 26; }

			cipher += alphabet.charAt(place);
		} else {
			/* Just add any other character */
			cipher += text.charAt(i);
		}
	}

	/* Put the text into the caesarText div */
	document.getElementById("caesarText").style.wordWrap = "break-word";
	document.getElementById("caesarText").innerHTML = cipher;	
}

/* 
This function returns the cell that contains relevant content for a letter's
conversion to the square cipher equivalent. It gets the whole number portion
of dividing the place of the letter in the alphabet by 5 to find the row and 
the remainder of this division to find its column on the table. This gets the
character of the place-th cell, which is what is used in the cipher.

Parameters:
	place: an int representing a letter's position in the alphabet, where
		A = 0 and Y = 24
Return:
	the item in the place-th cell, calculated based on the fact this uses
		a 5x5 grid
*/
function getLetter(place) {
	let table = document.getElementById("squareShift");

	/* This converts place into coordinates for the item in the table */
        let x = place%5;
        let y = Math.floor(place/5)

	return table.rows.item(y).cells.item(x);
}

/* 
This function shuffles the contents of the square to create a new square cipher
key. Upon shuffling, it updates the square cipher text to work with the key.
Note that Z is not included in this cipher.

Parameters:
	None
Return:
	None; updates the square cipher key as well as the square cipher
	text.
*/
function updateSquare() {
	let table = document.getElementById("squareShift");
	let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXY";
	
	for (var i = 0; i < 25; i++) {
		/* Get a random letter and make the i-th letter that*/
		let place = Math.floor(Math.random() * alphabet.length);
		getLetter(i).innerHTML = alphabet.charAt(place);

		/* Remove letter from pool of letters before repeating */
		alphabet = alphabet.slice(0, place) +
			alphabet.slice(place + 1, alphabet.length);
	}
	
	squareCipher();
}

/* 
This function converts plain text into square cipher text as well as handles
its formatting (due to CSS's overflow apparently not applying to new text).
Note that Z is not included in this cipher.

Parameters:
	None
Return:
	None; updates the HTML to display the square cipher text
*/
function squareCipher() {
	let text = document.getElementById("plainText").value.toUpperCase();

	let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXY";
	let cipher = "";
	for (var i = 0; i < text.length; i++) {
		/* Only applies cipher to alphabetical characters from A-Y */
		if (alphabet.includes(text.charAt(i))) {
			/* Converts ACSII to letter placement in alphabet */
			/* This makes A = 0 and Y = 24 */
			let place = text.charCodeAt(i) - 65;
			let letter = getLetter(place).innerHTML;

			cipher += letter;
		} else {
			/* Just add any other character */
			cipher += text.charAt(i);
		}
	}
	
	/* Put the text into the squareText div */
	document.getElementById("squareText").style.wordWrap = "break-word";
	document.getElementById("squareText").innerHTML = cipher;	
}