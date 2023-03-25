/**reference:
 * D3: Choropleth: https://observablehq.com/@d3/choropleth
 * World Map with Mouse Over: https://editor.p5js.org/Kumu-Paul/sketches/8awPJGZQ4
 * Stack Overflow - Formatting number with commas: https://stackoverflow.com/questions/2901102/how-to-format-a-number-with-commas-as-thousands-separators
 */ 
// some of the countries (i.e Taiwan) will have a population of 0 as their population was not included in the data
function WorldPop() {
  //name for visualisation
  this.name = 'World Population';
  //visualisation ID
  this.id = 'world-map'
  
  //scalar for size of map
  this.size = 0.5; 

  //declare array of objects
  let countryObj = {};

  //property of data's load status
  this.loaded = false;

  this.preload = function () {
    //preload data
    let self = this;
    
    //load data set
    this.data = loadTable(
      './data/world-population/population-data.csv', 'csv', 'header',

      //callback, sets this.loaded to true when data is finished loading  
      function () {
        self.loaded = true;
      });
  };

  this.setup = function () {

    //populate CountryObj array
    for (let i = 0; i < country.length; i++) {
      if (!countryObj[country[i].name]) countryObj[country[i].name] = [];
      countryObj[country[i].name] = (this.convertPathToPoly(country[i].vertexPoint));
    };

    // Create a select DOM element: referenced from P5 reference page (search string: createSelect)
    this.select = createSelect();

    // set the select position
    this.select.position(width/2, height/4.5);

    // Populate select options with country names
    for (let i = 1; i < this.data.getColumnCount(); i++) {
      this.select.option(this.data.columns[i]);
    }

    // Create color picker for graph fill: referenced from P5 reference page (search string: createColorPicker)
    //set default colour to 128, 255 ,219
    this.colorPicker = createColorPicker(color(128, 255,219));

    // Set the color picker position
    this.colorPicker.position(width/1.8, height/4.5);
  };

  this.destroy = function () {
    countryObj = {}; //reset the countryObj array object when graph is accessed more than once

    //remove DOM elements
    this.colorPicker.remove();
    this.select.remove()
  };

  this.draw = function () {
    //draw map
    //checks if data is loaded and if not alerts
    if (!this.loaded) {
      alert('Data not yet loaded');
      return;
    }
    //set variables
    let mouseOn = false;
    let c = this.colorPicker.color();

    //set strokes for the country polygons
    stroke(255);
    strokeWeight(0.75);

    //colours countries according to population
    //and checks if mouse is over a country and colours it red
    for (const country in countryObj) {
      let population = this.findData(country);
      fill(this.fillColor(population, c)); // colours country to population
      if (!mouseOn) { //checks if mouse is over a country
        mouseOn = countryObj[country].some(poly => this.mouseOver(poly, mouseX, mouseY));
        if (mouseOn) { 
          fill(255, 25, 10); //changes it to red
          this.drawInfo(country, population); //draws country info
        }
      }

      //draws the country polygons using vertex
      for (const poly of countryObj[country]) {
        beginShape();
        for (const vert of poly) {
          vertex(...vert);
        }
        endShape();
      }
    }
  }

  this.drawInfo = function(country, population){
    //draw population info of country mouse is over
    //reference: https://stackoverflow.com/questions/2901102/how-to-format-a-number-with-commas-as-thousands-separators
    //turns population into string then adds commas to separates by the thousands
    let comPop = population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    push();
      fill(0)
      textSize(24);
      textAlign(CENTER, CENTER);
      text(country + ' has a population of ' + comPop, width/2, height - 50);
    pop();
  }

  this.drawLegendBox = function(colour, x, p){
    //draw the legend box
    push();
      let y = 10;
      let w = 40;
      let h = 20;
      noStroke();
      fill(colour);
      rect(x, y, w, h);
      textAlign(CENTER, TOP);
      textSize(10);
      text(p, x + w/2, y + h);
    pop();
  }
 
  this.fillColor = function (pop, colour) {
    // use if-else to assign colour fill based on population
    //and completes the drawing of the legend
    let invColour = invertColor(colour); //invert the color from the color picker
    let x = width - 300;
    if (pop > 500000000) {
      this.drawLegendBox(invColour, x, '>500m');
      return invColour;
    } else if (pop > 100000000) {
      this.drawLegendBox(lerpColor(
        invColour, colour, 0.3), 
        x + 40, '100m');
      return lerpColor(invColour, colour, 0.3);
    } else if (pop > 30000000) {
      this.drawLegendBox(lerpColor(
        invColour, colour, 0.45), 
        x + 80, '30m');
      return lerpColor(invColour, colour, 0.45)
    } else if (pop > 10000000) {
      this.drawLegendBox(lerpColor(
        invColour, colour, 0.65), 
        x + 120, '10m');
      return lerpColor(invColour, colour, 0.65)
    } else if (pop > 1000000) {
      this.drawLegendBox(lerpColor(
        invColour, colour, 0.80), 
        x + 160, '1m');
      return lerpColor(invColour, colour, 0.80)
    } else {
      this.drawLegendBox(colour, 
        x + 200, '>0m');
      return colour;
    }
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
    //connects the path to create polygon
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

  this.mouseOver = function (polygon, x, y) {
    let o = false;
    // for every edge of the country's polygon
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      
      // Compute the slope of the edge
      let slope = (polygon[j][1] - polygon[i][1]) / (polygon[j][0] - polygon[i][0]);
      
      // if the mouse is pass vertical bounds of the polygon and if mouse is pass horizontal bounds then return true
      if (((polygon[i][1] > y) != (polygon[j][1] > y)) &&
        (x > (y - polygon[i][1]) / slope + polygon[i][0])) {

        // make o true
        o = !o;
      }
    }
    return o;
  }
}
