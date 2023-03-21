function WorldMap() {
  // this.x = x;
  // this.y = y;
  // this.size = size;
  // this.borderColor = borderColor;
  // this.fill = fill;
  this.name = 'World Population';
  this.id = 'world-map'

  this.size = 0.5
  let countryObj = {};
  let startColor = color(218, 165, 32);
  let endColor = color(72, 61, 139);

  this.loaded = false;

  this.preload = function () {
    //preload data
    let self = this;
    //load data set
    this.data = loadTable(
      './data/choropleth/population-data.csv', 'csv', 'header',

      //callback, sets this.loaded to true when data is finished loading
      function () {
        self.loaded = true;
      });
  };

  this.setup = function () {
    for (let i = 0; i < country.length; i++) {
      if (!countryObj[country[i].name]) countryObj[country[i].name] = [];
      countryObj[country[i].name] = (this.convertPathToPoly(country[i].vertexPoint));
    };

  };

  this.destroy = function () {
    countryObj = {};
  };

  this.draw = function () {
    let collision = false;
    stroke(255);
    strokeWeight(0.75);
    for (const country in countryObj) {
      let population = this.findData(country);
      fill(this.fillColor(population));
      if (!collision && mouseIsPressed) {
        collision = countryObj[country].some(poly => this.collisionDetection(poly, mouseX, mouseY));
        if (collision) {
          fill(255, 25, 10);
          console.log('Mouse is pressed on ', country, ' with population ', population);
        }
      }

      for (const poly of countryObj[country]) {
        beginShape();
        for (const vert of poly) {
          vertex(...vert);
        }
        endShape();
      }

    }
  }

  this.fillColor = function (key) {
    // use if-else to assign color fill based on key value
    if (key > 500000000) {
      return endColor;
    } else if (key > 100000000) {
      return lerp(startColor, endColor, 0.88)
    } else if (key > 50000000) {
      return lerp(startColor, endColor, 0.5)
    } else return startColor;
  }

  this.findData = function (country) {
    let index = -1;
    for (let i = 0; i < this.data.getRowCount(); i++) {
      if (this.data.getString(i, 'Country') == country) {
        index = i;
        break;
      }
    }
    // console.log(this.data.getString(index, 0));
    return this.data.getNum(index, '1960');
  }

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
