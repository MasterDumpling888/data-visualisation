/* reference: // mostly built upon the standard structure of template //
  * Coding Train: Clock with p5.js
  * DatVizProject: Radial Bar Chart
  * Pie Chart
  * Tech Diversity: Race
  * P5 reference page
*/
function FoodInflation2021() {
  this.name = 'PH Food Inflation: 2021';
  this.id = 'food-inflation-2021-ph';

  //colours for the months; taken from https://www.wikiwand.com/en/Web_colors
  this.colourArray = ['MediumVioletRed', 'Crimson', 'DarkOrange',
    'Gold', 'Yellow', 'GreenYellow', 'MediumSpringGreen', 'MediumAquamarine', 'Teal', 'DeepSkyBlue', 'SlateBlue', 'Orchid'];

  let marginSize = 35;

  this.layout = {
    marginSize: marginSize,

    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize + 76,
    bottomMargin: height - marginSize * 2,
    pad: 5,

    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },
    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    },

    //centre x-coordinate of arc
    arcX: function () {
      return width / 2;
    },
    //centre y-coordinate of arc
    arcY: function () {
      return height / 2;
    },

    textY: function () {
      return this.arcY() - 250
    }
  };

  this.loaded = false;

  this.preload = function () {
    let self = this;

    //load table
    this.data = loadTable('./data/food price inflation in ph/food price inflation in ph 2021.csv', 'csv', 'header',

      function () {
        self.loaded = true;
      });
  };

  this.setup = function () {
    //setup default text attributes
    textSize(10);
    textAlign(CENTER);

    //set min/max values
    this.minValue = 0;
    this.maxValue = 10;
  };

  this.draw = function () {
    if (!this.loaded) {
      alert("Data hasn't loaded!");
      return;
    }

    // let v1 = createVector(this.layout.arcX(),this.layout.arcY())
    // let v2 = createVector(250,0);

    for (let i = 0; i < this.data.getRowCount(); i++) {
      let current = {
        'month': this.data.getString(i, 'Months'),
        'value': this.data.getNum(i, 'Value')
      };

      //declare variables affected by i
      let diameter = 500 - (i * 40); //diameter of arcs; 500 is base value; 40 is scalar
      let textYInc = this.layout.textY() + (i * 20.25); //y-coordinates for labels of arcs

      // let tickLabel = [(this.minValue + this.maxValue/2)/2, this.maxValue/2, this.minValue, this.maxValue];

      // this.drawTicks(tickLabel[i],v1, v2.rotate(i * 90));

      this.drawTitle()
      this.drawName(current.month, textYInc); // draw month labels
      this.drawLegend(current.value, this.colourArray[i], textYInc);//draw legend inflation values

      //draw arcs
      push();
      stroke(this.colourArray[i]);
      strokeWeight(10);
      noFill();
      arc(this.layout.arcX(), this.layout.arcY() + (i * 0.5), diameter, diameter, PI + HALF_PI, this.mapPercentToAngle(current.value)); //reference: Coding Train
      pop();
    };
  };

  this.drawName = function (value, y) {
    //draws labels for each arc
    fill(0)
    noStroke();
    textAlign(RIGHT, CENTER);
    text(value + ' -', this.layout.arcX() - 10, y);
  };

  this.drawLegend = function (label, colour, y) {
    //draw legend for inflation percent increase
    push();
    let x = width - 100;
    let d = 10;

    fill(colour);
    ellipse(x, y, d); // draw circle with colour

    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(13);
    text(label, x + d, y);
    pop();
  };

  this.drawTitle = function () {
    //draws title
    push();
    textSize(20);
    text(this.name, width / 2.5, height / 12);
    pop();
  };

  this.mapPercentToAngle = function (value) {
    //maps percent values into angles
    return map(value,
      this.minValue,
      this.maxValue,
      0, //minimum value will be mapped to 0rad or 0 degrees
      PI); // maximum value will be mapped to PI or 180 degrees
  };
}