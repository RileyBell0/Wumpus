var ASCII_BORDER_LEFT = "||";
var PADDING_LEFT = 1;
var BORDER_LEFT = ASCII_BORDER_LEFT.length + PADDING_LEFT;
var ASCII_BORDER_RIGHT = "||";
var PADDING_RIGHT = 1;
var BORDER_RIGHT = ASCII_BORDER_RIGHT.length + PADDING_RIGHT;
var ASCII_BORDER_LINE_TOP = "-";
var BORDER_TOP = 2;
var BORDER_BOTTOM = 4;
var INPUT_STR = "input: ";
// Don't try and break it with too-low screen dimensions
var Display = /** @class */ (function () {
    function Display(width, height) {
        // Setup the screen
        this.screen_width = width;
        this.screen_height = height;
        this.screen = new Array(this.screen_height);
        for (var i = 0; i < this.screen.length; i++) {
            // populate the rows
            this.screen[i] = new Array(this.screen_width);
            // fill row with whitespace
            for (var j = 0; j < this.screen[i].length; j++) {
                this.screen[i][j] = " ";
            }
        }
        this.width = width - (BORDER_LEFT + BORDER_RIGHT);
        this.height = height - (BORDER_TOP + BORDER_BOTTOM);
        this.curr_row = 0;
        this.curr_col = 0;
        this.overflow = false;
        // Prepare for writing
        this.drawborders();
    }
    Display.prototype.clear = function () {
        this.curr_row = 0;
        this.curr_col = 0;
        this.overflow = false;
        // wipe canvas clean, replace all chars with whitespace
        for (var row = 0; row < this.height; row++) {
            for (var col = 0; col < this.width; col++) {
                this.screen[row + BORDER_LEFT][col + BORDER_TOP] = " ";
            }
        }
        // clear input line
        for (var col = BORDER_LEFT + INPUT_STR.length; col < this.screen_width - BORDER_RIGHT; col++) {
            this.screen[this.screen_height - 2][col] = "_";
        }
    };
    // Draws the screen ascii borders
    Display.prototype.drawborders = function () {
        var _this = this;
        // Draw the left and right borders
        for (var row_index = 0; row_index < this.screen.length; row_index++) {
            var row = this.screen[row_index];
            // Left Border
            for (var row_1 = 0; row_1 < this.screen_height; row_1++) {
                var char = 0;
                for (var col = 0; col < ASCII_BORDER_LEFT.length; col++) {
                    this.screen[row_1][col] = ASCII_BORDER_LEFT.charAt(char);
                    char++;
                }
            }
            // Right Border
            for (var row_2 = 0; row_2 < this.screen_height; row_2++) {
                var char = 0;
                for (var col = this.screen_width - ASCII_BORDER_RIGHT.length; col < this.screen_width; col++) {
                    this.screen[row_2][col] = ASCII_BORDER_RIGHT.charAt(char);
                    char++;
                }
            }
            // Horizontal separators
            [0, this.screen_height - 1, this.screen_height - 3].forEach(function (row) {
                for (var i = ASCII_BORDER_LEFT.length; i < _this.screen_width - ASCII_BORDER_RIGHT.length; i++) {
                    _this.screen[row][i] = ASCII_BORDER_LINE_TOP;
                }
            });
            // Draw input line:
            for (var i = 0; i < INPUT_STR.length; i++) {
                var row_3 = this.screen_height - 2;
                this.screen[row_3][i + BORDER_LEFT] = INPUT_STR.charAt(i);
            }
        }
    };
    // Writes the char to the next current char in the display (and wraps text)
    Display.prototype.writechar = function (c) {
        // Don't print past the "screen"
        if (this.curr_row === this.height) {
            this.overflow = true;
            return;
        }
        // Constrain printing to a single char
        if (c.length == 0) {
            return;
        }
        else if (c.length > 1) {
            c = c.charAt(0);
        }
        // Print the char
        if (c === "\n") {
            this.curr_row++;
            this.curr_col = 0;
        }
        else {
            // determine real screen coordinates (of ascii console)
            var row = BORDER_TOP + this.curr_row;
            var col = BORDER_LEFT + this.curr_col;
            // overwrite char at location
            this.screen[row][col] = c;
            this.curr_col++;
        }
        // Ensure this.curr_row and this.curr_col wrap around
        if (this.curr_col === this.width) {
            this.curr_col = 0;
            this.curr_row++;
        }
    };
    // Prints the given string
    Display.prototype.print = function (str) {
        for (var i = 0; i < str.length; i++) {
            var c = str.charAt(i);
            this.writechar(c);
        }
    };
    // Prints the received string plus a newline, or just a newline if no string
    // was provided
    Display.prototype.println = function (str) {
        if (str !== undefined) {
            this.print(str);
        }
        this.writechar("\n");
    };
    // Displays the screen within the given DOM element, giving all 'p' elements
    // the provided classname
    Display.prototype.display = function (id, classname) {
        var container = document.getElementById(id);
        if (container !== null) {
            container.innerHTML = "";
            // Constructs the lines to display
            var lines = [];
            for (var row = 0; row < this.screen.length; row++) {
                var line = this.screen[row].join("");
                lines.push(line);
            }
            // Convert the lines of text into elements
            for (var line_index in lines) {
                // Process line into a text element
                var line = lines[line_index].replace(/  /g, "\u00a0\u00a0");
                // Create the element to store the ASCII line
                var p = document.createElement("p");
                if (classname !== undefined) {
                    p.className = classname;
                }
                p.textContent = line;
                // Print this next line
                container.append(p);
            }
        }
        else {
            console.log('ERROR - attempt to display WUMPUS screen failed. element with id "' +
                id +
                '" was not found in the DOM');
        }
    };
    return Display;
}());
