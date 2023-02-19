const ASCII_BORDER_LEFT = "||";
const PADDING_LEFT = 1;
const BORDER_LEFT = ASCII_BORDER_LEFT.length + PADDING_LEFT;

const ASCII_BORDER_RIGHT = "||";
const PADDING_RIGHT = 1;
const BORDER_RIGHT = ASCII_BORDER_RIGHT.length + PADDING_RIGHT;

const ASCII_BORDER_LINE_TOP = "-";
const BORDER_TOP = 2;
const BORDER_BOTTOM = 4;

const INPUT_STR = "input: ";

// Don't try and break it with too-low screen dimensions
class Display {
  // The actual screen dimensions
  private readonly screen_width: number;
  private readonly screen_height: number;

  // The dimensions of the canvas we can draw on
  private readonly height: number;
  private readonly width: number;

  private screen: string[][];
  private curr_row: number;
  private curr_col: number;
  private overflow: boolean;

  constructor(width: number, height: number) {
    // Setup the screen
    this.screen_width = width;
    this.screen_height = height;
    this.screen = new Array<Array<string>>(this.screen_height);
    for (let i = 0; i < this.screen.length; i++) {
      // populate the rows
      this.screen[i] = new Array<string>(this.screen_width);

      // fill row with whitespace
      for (let j = 0; j < this.screen[i].length; j++) {
        this.screen[i][j] = " ";
      }
    }

    this.width = width - (BORDER_LEFT + BORDER_RIGHT);
    this.height = height - (BORDER_TOP + BORDER_BOTTOM);

    this.curr_row = 0;
    this.curr_col = 0;
    this.overflow = false;

    // Prepare for writing
    this.draw_background();
  }

  public clear(): void {
    this.curr_row = 0;
    this.curr_col = 0;
    this.overflow = false;

    // wipe canvas clean, replace all chars with whitespace
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        this.screen[row + BORDER_LEFT][col + BORDER_TOP] = " ";
      }
    }

    // clear input line
    for (
      let col = BORDER_LEFT + INPUT_STR.length;
      col < this.screen_width - BORDER_RIGHT;
      col++
    ) {
      this.screen[this.screen_height - 2][col] = " ";
    }
  }

  // Draws the screen ascii borders
  private draw_background(): void {
    // Draw the left and right borders
    for (let row_index = 0; row_index < this.screen.length; row_index++) {
      let row = this.screen[row_index];
      // Left Border
      for (let row = 0; row < this.screen_height; row++) {
        let char = 0;
        for (let col = 0; col < ASCII_BORDER_LEFT.length; col++) {
          this.screen[row][col] = ASCII_BORDER_LEFT.charAt(char);
          char++;
        }
      }

      // Right Border
      for (let row = 0; row < this.screen_height; row++) {
        let char = 0;
        for (
          let col = this.screen_width - ASCII_BORDER_RIGHT.length;
          col < this.screen_width;
          col++
        ) {
          this.screen[row][col] = ASCII_BORDER_RIGHT.charAt(char);
          char++;
        }
      }

      // Horizontal separators
      [0, this.screen_height - 1, this.screen_height - 3].forEach((row) => {
        for (
          let i = ASCII_BORDER_LEFT.length;
          i < this.screen_width - ASCII_BORDER_RIGHT.length;
          i++
        ) {
          this.screen[row][i] = ASCII_BORDER_LINE_TOP;
        }
      });

      // Draw input line:
      for (let i = 0; i < INPUT_STR.length; i++) {
        const row = this.screen_height - 2;
        this.screen[row][i + BORDER_LEFT] = INPUT_STR.charAt(i);
      }
    }
  }

  // Writes the char to the next current char in the display (and wraps text)
  private writechar(c: string) {
    // Don't print past the "screen"
    if (this.curr_row === this.height) {
      this.overflow = true;
      return;
    }

    // Constrain printing to a single char
    if (c.length == 0) {
      return;
    } else if (c.length > 1) {
      c = c.charAt(0);
    }

    // Print the char
    if (c === "\n") {
      this.curr_row++;
      this.curr_col = 0;
    } else {
      // determine real screen coordinates (of ascii console)
      const row = BORDER_TOP + this.curr_row;
      const col = BORDER_LEFT + this.curr_col;

      // overwrite char at location
      this.screen[row][col] = c;

      this.curr_col++;
    }

    // Ensure this.curr_row and this.curr_col wrap around
    if (this.curr_col === this.width) {
      this.curr_col = 0;
      this.curr_row++;
    }
  }

  // Prints the given string
  public print(str: string): void {
    for (let i = 0; i < str.length; i++) {
      const c = str.charAt(i);
      this.writechar(c);
    }
  }

  // Prints the received string plus a newline, or just a newline if no string
  // was provided
  public println(str?: string): void {
    if (str !== undefined) {
      this.print(str);
    }
    this.writechar("\n");
  }

  private write_input_state(input: string | undefined) {
    if (input !== undefined) {
      // write the last (input space - 1) chars
      const input_space =
        this.screen_width - (BORDER_LEFT + BORDER_RIGHT + INPUT_STR.length) - 1;

      let start;
      // TODO determine whihc char to start with
      // SPACE
      // ___________________
      // myinputisverylongsoyeah
      // ->
      //     ___________________
      // myinputisverylongsoyeah
      //     ^ start at the p
      for (let col = 0; col < input.length; col++) {}
    }
  }

  // Displays the screen within the given DOM element, giving all 'p' elements
  // the provided classname
  public display(id: string, classname?: string, input?: string): void {
    let container = document.getElementById(id);
    if (container !== null) {
      container.innerHTML = "";

      this.write_input_state(input);

      // Constructs the lines to display
      let lines: string[] = [];
      for (let row = 0; row < this.screen.length; row++) {
        const line = this.screen[row].join("");
        lines.push(line);
      }

      // Convert entire screen into elements and display
      for (const line_index in lines) {
        // Process line into a text element
        const line = lines[line_index].replace(/  /g, "\u00a0\u00a0");

        // Create the element to store the ASCII line
        let p = document.createElement("p");
        if (classname !== undefined) {
          p.className = classname;
        }
        p.textContent = line;

        // Print this next line
        container.append(p);
      }
    } else {
      console.log(
        'ERROR - attempt to display WUMPUS screen failed. element with id "' +
          id +
          '" was not found in the DOM'
      );
    }
  }
}
