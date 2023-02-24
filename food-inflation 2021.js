/* reference: // mostly built upon the standard structure of template //
  * Coding Train: Clock with p5.js
  * DatVizProject: Radial Bar Chart
  * Pie Chart
  * Tech Diversity: Race
  * P5 reference page
  * Ucodia: Arc Animation (https://gist.github.com/Ucodia/65ada7ac716e5aa2146201ae379231a7)
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
    
    //size of the circle
    circSize: 500,
    
    //centre x-coordinate of arc
    arcX: function () {
      return convertAngleToCoord(this.circSize, HALF_PI).x;
    },
    //centre y-coordinate of arc
    arcY: function () {
      return convertAngleToCoord(this.circSize, PI).y;
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
    this.maxValue = max(this.data.getColumn('Value'));

    this.frameCount = 0;

    console.log(convertAngleToCoord(this.layout.circSize, TWO_PI))
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
      let diameter = this.layout.circSize - (i * 40); //diameter of arcs; 500 is base value; 40 is scalar
      let textYInc = this.layout.textY() + (i * 20.25); //y-coordinates for labels of arcs

      // let tickLabel = [(this.minValue + this.maxValue/2)/2, this.maxValue/2, this.minValue, this.maxValue];

      // this.drawTicks(tickLabel[i],v1, v2.rotate(i * 90));
      
      this.drawGrid(i);
      this.drawTitle();
      this.drawName(current.month, textYInc); // draw month labels
      this.drawValues(current.value, diameter, textYInc, this.colourArray[i]);//draw legend inflation values

      this.drawArcs(current.value, i, diameter)

      if(this.frameCount > 1){
        grow = this.mapToAngle(true,current.value)
      }
    };
    this.frameCount += 0.01;
  };
  
  this.drawArcs = function(value, i , dia){
    //draw animated arcs
    push();
    //declare variables
    let arcStart = PI + HALF_PI; // arc's starting point
    let grow = this.mapToAngle(false, value, this.frameCount); // growth of arc according to frameCount
    let maxArc = constrain(grow, -arcStart,this.mapToAngle(true, value)); //make sure arcs don't go pass percent value

    //draw arcs
    stroke(this.colourArray[i]);
    strokeWeight(10);
    noFill();
    arc(this.layout.arcX(), this.layout.arcY() + (i * 0.5), dia, dia, arcStart, maxArc); //reference: Coding Train
    pop()
  }

  this.drawGrid = function(i){
    //draw circle grid
    push();
    stroke(200);
    noFill();

    //declare diameter, convert vertex points for line
    let d = this.layout.circSize + marginSize;
    let c = convertAngleToCoord(d, PI + (i * QUARTER_PI));

    //draw grid
    ellipse(this.layout.arcX(), this.layout.arcY(), d, d);
    line(this.layout.arcX(), this.layout.arcY(), c.x, c.y);
    pop();
  }
  this.drawName = function (value, y) {
    //draws labels for each arc
    fill(0)
    noStroke();
    textAlign(RIGHT, CENTER);
    text(value + ' -', this.layout.arcX() - 10, y);
  };

  this.drawValues = function (value, dia, textY, colour) {
    //draw legend for inflation percent increase
    push();
    let textX = 100;
    
    let coord = convertAngleToCoord(dia, this.mapToAngle(true, value));

    let x = coord.x ;
    let y = coord.y ;

    stroke(colour)
    line(x, y, textX, textY)
    fill(0);
    noStroke();
    textAlign(RIGHT, CENTER);
    text(value, textX, textY);
    pop();
  };

  this.drawTitle = function () {
    //draws title
    push();
    textSize(20);
    text(this.name, width / 2.5, height / 12);
    pop();
  };

  this.mapToAngle = function (pick, value, frame) {
    //pick whether mapping value or frameCount
    //Boolean: true = value; false = frameCount
    //maps percent value & frameCount to rad
    return(pick ? map(value, // maps percent value to radians
      this.minValue, this.maxValue,
      0, //minimum value will be mapped to 0rad
      PI) //maximum value will be mapped to PI
      : 
      map(frame, 0, 1, 0, PI)); //maps frameCount to PI
  };
}