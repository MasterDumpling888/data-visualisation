function WorldMap() {
  this.name = 'World Population';
  this.id = 'world-map'

  this.size = 0.5
  let countryObj = {};

  this.loaded = false;

  this.preload = function () {
    //preload data
    let self = this;
    //load data set
    this.data = loadTable(
      './data/choropleth/population-data.csv', 'csv', 'header',

      function () {
        self.loaded = true;
      });
  };

  this.setup = function () {
    for (let i = 0; i < country.length; i++) {
      if (!countryObj[country[i].name]) countryObj[country[i].name] = [];
      countryObj[country[i].name] = (this.convertPathToPoly(country[i].vertexPoint));
    };

    // Create a select DOM element: referenced from P5 reference page (search string: createSelect)
    this.select = createSelect();

    // set the select position
    this.select.position(width/1.6, height/4.5);

    // Populate select options with country names
    for (let i = 1; i < this.data.getColumnCount(); i++) {
      this.select.option(this.data.columns[i]);
    }

    // Create color picker for graph fill: referenced from P5 reference page (search string: createColorPicker)
    //set default colour to 60, 236, 177
    this.colorPicker = createColorPicker(color(128, 255,219));

    // Set the color picker position
    this.colorPicker.position(width/1.2, height/4.5);
  };

  this.destroy = function () {
    this.colorPicker.remove();
    this.select.remove()
    countryObj = {};
  };

  this.draw = function () {
    let collision = false;
    let c = this.colorPicker.color();
    stroke(255);
    strokeWeight(0.75);
    for (const country in countryObj) {
      let population = this.findData(country);
      fill(this.fillColor(population, c));
      if (!collision && mouseIsPressed) {
        collision = countryObj[country].some(poly => this.collisionDetection(poly, mouseX, mouseY));
        if (collision) {
          fill(255, 25, 10);
          push();
          fill(0)
          textSize(24);
          textAlign(CENTER, CENTER);
          text(country + 'Population:' + population, width/2, height + 200)
          pop();
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
  this.mapColour = function(colour){
    return map(colour,minpop)
  }

  this.fillColor = function (pop, colour) {
    // use if-else to assign colour fill based on population
    let invColour = invertColor(colour); //invert the color from the color picker
    if (pop > 500000000) {
      return invColour;
    } else if (pop > 100000000) {
      return lerpColor(invColour, colour, 0.3)
    } else if (pop > 30000000) {
      return lerpColor(invColour, colour, 0.45)
    } else if (pop > 10000000) {
      return lerpColor(invColour, colour, 0.65)
    } else if (pop > 1000000) {
      return lerpColor(invColour, colour, 0.80)
    } else return colour;
  }

  this.findData = function (country) {
    let index = -1;
    for (let i = 0; i < this.data.getRowCount(); i++) {
      if (this.data.getString(i, 'Country') == country) {
        index = i;
        break;
      }
    }
    //return population data of year selected
    return this.data.getNum(index, this.select.value());
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
