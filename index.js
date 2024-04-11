class Keyboard {
  constructor(zeroPosition) {
    this.TOP = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
    this.MIDDLE = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];
    this.BOTTOM = ["z", "x", "c", "v", "b", "n", "m"];

    this.x0 = zeroPosition[0];
    this.y0 = zeroPosition[1];

    this.top_offset = 0;
    this.middle_offset = 10;
    this.bottom_offset = 20;

    this.x_delta = 10;
    this.y_delta = 40;

    this.max_x = this.TOP.length * this.x_delta;
    this.max_y = this.y_delta * 2 + this.y0 * 2;
  }

  getPosition(char) {
    if (this.TOP.includes(char)) {
      return [
        this.x0 + this.top_offset + this.TOP.indexOf(char) * this.x_delta,
        this.y0 + this.y_delta * 0,
      ];
    } else if (this.MIDDLE.includes(char)) {
      return [
        this.x0 + this.middle_offset + this.MIDDLE.indexOf(char) * this.x_delta,
        this.y0 + this.y_delta * 1,
      ];
    } else if (this.BOTTOM.includes(char)) {
      return [
        this.x0 + this.bottom_offset + this.BOTTOM.indexOf(char) * this.x_delta,
        this.y0 + this.y_delta * 2,
      ];
    } else {
      return [null, null];
    }
  }

  getPerPosition(char) {
    const [x, y] = this.getPosition(char);
    return [x / this.max_x, y / this.max_y];
  }

  getLetters() {
    return [...this.TOP, ...this.MIDDLE, ...this.BOTTOM];
  }

  getDimensions() {
    return [this.TOP.length * this.x_delta, this.y_delta * 2 + this.y0 * 2];
  }
}

var STATE = [];
const board = new Keyboard([5, 10]);
const [boardWidth, boardHeight] = board.getDimensions();

function getHash() {
  return decodeURIComponent(window.location.hash).slice(1);
}

function setHash(value) {
  history.replaceState(null, null, `#${value}`);
}

window.onload = () => {
  board.getLetters().forEach((letter) => {
    const [x, y] = board.getPosition(letter);
    const svg = document.getElementById("qwanji");
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.innerHTML = letter;
    text.setAttribute("x", x - 5);
    text.setAttribute("y", y);
    text.setAttribute("fill", "#EEEEEE");
    svg.appendChild(text);
  });

  const initialValue = getHash();

  input = document.getElementById("input");
  input.addEventListener("input", onInputChange);
  input.value = initialValue;
  drawPhrase(initialValue);
};

function onInputChange(e) {
  drawPhrase(e.target.value);
  setHash(e.target.value);
}

function drawWord(index, word) {
  const svgID = `svg-${index}`;
  let svg = document.getElementById(svgID);
  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", svgID);
    svg.setAttribute("viewBox", `0 0 ${boardWidth} ${boardHeight}`);
    document.getElementById("container").appendChild(svg);
  }
  // Add the SVG reference to our state array
  STATE[index] = svg;

  const points = [...word].map((char) => board.getPosition(char));

  let paths = [];
  if (points.length >= 1) {
    const [x, y] = points[0];
    paths.push(
      `M ${x} ${y} C ${x - 5} ${y - 10} ${x - 10} ${y - 5} ${x + 5} ${y + 5}`
    );
  }
  if (points.length > 1) {
    for (let index = 1; index < points.length; index++) {
      const [x0, y0] = points[index - 1];
      const [x1, y1] = points[index];
      paths.push(
        `M ${x0} ${y0} C ${x1 - 10} ${y1 - 10} ${x1 - 5} ${y1 - 5} ${x1} ${y1}`
      );
    }
  }

  // Remove extra path elements we don't need any more
  [...svg.getElementsByTagName("path")].slice(paths.length).forEach((path) => {
    path.remove();
  });

  for (let [pathIndex, svgPath] of paths.entries()) {
    const pathID = `${svgID}-path-${pathIndex - 1}`;
    let path = document.getElementById(pathID);
    if (!path) {
      path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("id", pathID);
      svg.appendChild(path);
    } else if (path.getAttribute("d") != svgPath) {
      path.remove();
      path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("id", pathID);
      svg.appendChild(path);
    }

    path.setAttribute("fill", "transparent");
    path.setAttribute("stroke", "#EEEEEE");
    path.setAttribute("class", "path");
    path.setAttribute("d", svgPath);
  }
}

function drawPhrase(phrase) {
  const words = phrase
    .replace(/([^a-z\s+]+)/gi, "")
    .split(/\s+/)
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 0);

  for (const [index, word] of words.entries()) {
    drawWord(index, word);
  }
  // Remove left-over state
  STATE.slice(words.length).forEach((svg) => {
    svg.remove();
    STATE.pop();
  });
}
