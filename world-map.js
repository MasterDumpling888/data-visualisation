function WorldMap() {
  // this.x = x;
  // this.y = y;
  // this.size = size;
  // this.borderColor = borderColor;
  // this.fill = fill;
  this.name = 'World Population';
  this.id = 'world-map'

  this.size = 0.5
  let countryPolygons = [];

  this.convertPathToPoly = function (path) {
    let pointCoord = [0, 0];
    let poly = [];
    let currentPoly = [];

    for (const node of path) {
      if (node[0] == 'm') {
        pointCoord[0] += node[1] * this.size;
        pointCoord[1] += node[2] * this.size;
        currentPoly = [];
      } else if (node[0] == 'M') {
        pointCoord[0] = node[1] * this.size;
        pointCoord[1] = node[2] * this.size;
        currentPoly = [];
      } else if (node == 'z') {
        currentPoly.push([...pointCoord]);
        poly.push(currentPoly);
      } else {
        currentPoly.push([...pointCoord]);
        pointCoord[0] += node[0] * this.size;
        pointCoord[1] += node[1] * this.size;
      }
    }

    return poly;
  };

  this.setup = function () {
    for (let i = 0; i < country.length; i++) {
      countryPolygons.push(this.convertPathToPoly(country[i].vertexPoint))
    };

  };

  this.draw = function () {
    push();
    translate(0, 0);

    let collision = false;
    for (let i = 0; i < countryPolygons.length; i++) {
      fill(100);
      if (!collision && mouseIsPressed) {
        collision = countryPolygons[i].some(poly => this.collisionDetection(poly, mouseX, mouseY));
        if (collision) {
          fill('blue');
        }
      }
    }

    stroke(255);
    strokeWeight(1);
    for (let i = 0; i < countryPolygons.length; i++) {
      fill(100);
      for (const poly of countryPolygons[i]) {
        beginShape();
        for (const vert of poly) {
          vertex(...vert);
        }
        endShape()
      }
    }

    pop();
  }

  this.collisionDetection = function (polygon, x, y) {
    let c = false;
    // for each edge of the polygon
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      // Compute the slope of the edge
      let slope = (polygon[j][1] - polygon[i][1]) / (polygon[j][0] - polygon[i][0]);

      // If the mouse is positioned within the vertical bounds of the edge
      if (((polygon[i][1] > y) != (polygon[j][1] > y)) &&
        // And it is far enough to the right that a horizontal line from the
        // left edge of the screen to the mouse would cross the edge
        (x > (y - polygon[i][1]) / slope + polygon[i][0])) {

        // Flip the flag
        c = !c;
      }
    }
    return c;
  }

}
