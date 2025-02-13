/*
* reference: // mostly built upon the standard structure of template //
  * PayGap 1997-2017(from template)
  * P5 reference page
  * Coding Train: Checkbox Ideas: https://gist.github.com/shiffman/7549e5225c042ee25a80
 */
function InternetUserCountryPop() {
  //name for visualisation
  this.name = 'Internet Users: 1990-2020';
  //visualisation ID
  this.id = 'internet-users-1990-2020';

  //name for axes
  this.xAxis = 'Year';
  this.yAxis = '% of population with internet access';

  //set margin padding
  let marginSize = 35;

  this.layout = {
    marginSize: marginSize,

    //margins of graphs
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,

    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    },

    //on/off grid
    grid: false,


    //number of tick labels above/beside the base tick
    numXTickLabels: 10,
    numYTickLabels: 8,
  };


  //property for data's load status
  this.loaded = false;

  this.preload = function () {
    //preload data
    let self = this;
    //load data set
    this.data = loadTable('./data/internet-users/internet_1990_2020.csv', 'csv', 'header',

      //callback, sets this.loaded to true when data is finished loading
      function () {
        self.loaded = true;
      });
  };

  this.setup = function () {
    //font settings
    textSize(16);
    textAlign(CENTER);
    //set rect mode
    rectMode(CORNER)

    // Set min and max years: assumes data is sorted by year
    this.startYear = this.data.getNum(0, 'year');
    this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'year');

    // Create a select DOM element: referenced from P5 reference page (search string: createSelect)
    this.select = createSelect();

    // set the select position
    this.select.position(width/1.6, height/4.5);

    // populate select options with countries
    for (let i = 1; i < this.data.getColumnCount(); i++) {
      this.select.option(this.data.columns[i]);
    }

    // Create color picker for graph fill: referenced from P5 reference page (search string: createColorPicker)
    //set default colour to 60, 236, 177
    this.colorPicker = createColorPicker(color(60, 236, 177));

    // Set the color picker position
    this.colorPicker.position(width/1.2, height/4.5);

    // Create checkbox for the grid of graph
    this.gridButton = createCheckbox('Grid',this.layout.grid);
    
    //Set position of checkbox
    this.gridButton.position(width, height/4.5);
   
    // Find min and max percentage
    this.minPercent = 0;
    this.maxPercent = 100;

    //count the number of frames drawn since the visualisation started so that we can animate the chart
    //set controlled frame count
    this.frameCount = 0;
    //set frame rate
    this.frameRate = 0.3;
  };

  this.destroy = function () {
    //remove DOM elements
    this.select.remove();
    this.colorPicker.remove();
    this.gridButton.remove();
  };

  this.draw = function () {
    //draw graph
    //checks if data is loaded and if not alerts
    if (!this.loaded) {
      alert('Data not yet loaded!');
      return;
    }
    
    //checks grid //Coding Train
    if(this.gridButton.checked()){
      this.layout.grid = true;
    } else {
      this.layout.grid = false;
    }

    //draw y axis labels
    drawYAxisTickLabels(this.minPercent,
      this.maxPercent,
      this.layout,
      this.mapValueToHeight.bind(this),
      0);

    //draw axes
    drawAxis(this.layout);

    //draw axes labels
    drawAxisLabels(this.xAxis,
      this.yAxis,
      this.layout);

    //declare variables for plotting line between start and end year
    let previous;
    let numYears = this.endYear - this.startYear;

    //will count iterations of for-loop
    let yearCount = 0;

    //Converts strings in selected data's column to numbers
    let value = stringsToNumbers(this.data.getColumn(this.select.value()));
  
    for (let i = 0; i < this.data.getRowCount(); i++) {
      //object that stores data of current year
      let current = {
        //convert strings of data to numbers
        'year': this.data.getNum(i, 'year'),
        'value': value[i]
      };

      if (previous != null) {
        // The number of x-axis labels to skip so that only
        // numXTickLabels are drawn.
        let xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

        // Draw the tick label marking the start of the previous year.
        if (i % xLabelSkip == 0) {
          drawXAxisTickLabel(previous.year, this.layout,
            this.mapYearToWidth.bind(this));
        }

        // Declare variable for colour from color picker
        let c = this.colorPicker.color()
        let inv_c = invertColor(c)//inverted colour of colour from color picker
        
        //draw bars and points
        this.drawBars(previous, numYears, c, inv_c);
        this.drawPoints(previous);

        // Draws shape from previous year to current year then connects to bottom margin to close shape
        stroke(50)
        beginShape();
        vertex(this.mapYearToWidth(previous.year),
          this.mapValueToHeight(previous.value));
        vertex(this.mapYearToWidth(current.year),
          this.mapValueToHeight(current.value));
        endShape();
        
        //Draw point for final year
        if (current.year == this.endYear) {
          this.drawBars(current, numYears, c, inv_c);
          this.drawPoints(current);
        };
        yearCount++;
      };

      // Stop drawing this frame when the number of years drawn is
      // equal to the frame count. This creates the animated effect
      // over successive frames.
      if(yearCount >= this.frameCount){
        break;
      }
      // Assign current year to previous year so that it is available
      // during the next iteration of this loop to give us the start
      // position of the next line segment.
      previous = current;
    };

    //increase frameCount by frameRate after every draw-loop
    this.frameCount += this.frameRate;

  };

  this.drawBars = function(yr, numYr, colour, invColour){
    //draws bars for bar chart
    noStroke();

    //initialise y-coordinate of bars
    const y = this.layout.bottomMargin;

    //growth of bars animation
    const growthRate = 5; // to make the growth quicker
    let grow = this.frameCount * growthRate;

    //animate height of bars
    let currentY = y - grow;
    let consY = constrain(currentY, this.mapValueToHeight(yr.value), y);//constrain bars' height to value-to-height

    //initialise size of bars
    const gap = 10; // space between bars
    const w = (this.layout.plotWidth() / numYr) - gap; // adjust width of each bar according to width of graph
    let h = this.layout.bottomMargin - consY; // height of bars
    
    //create gradient between color from picker & inverse colour; maps percent of population to colour
    let grad = lerpColor(invColour, colour, yr.value * 0.01 );
    
    //rounding of bars' edge
    const edgeRound = 15;

    //draw bars
    fill(grad);
    rect(this.mapYearToWidth(yr.year) - (w/2), consY, w, h, edgeRound, edgeRound, 0, 0);
  };

  this.drawPoints = function(yr){
    //Draws accessible points
    //Point settings
    noStroke();
    fill(50);
    let pSize = 10;//Default diameter of points

    //Checks is mouse is on previous point then inflates point & create text
    if (dist(this.mapYearToWidth(yr.year), this.mapValueToHeight(yr.value), mouseX, mouseY) < 10) {
      pSize += 10;
      text('Population with Internet access: ' + yr.value + '%' + '\n Year: ' + yr.year, width/2, height/10);
    };

    //Draw points
    ellipse(this.mapYearToWidth(yr.year), this.mapValueToHeight(yr.value), pSize);
  };

  this.mapYearToWidth = function (value) {
    //map year to width of graph
    return map(value,
      this.startYear,
      this.endYear,
      this.layout.leftMargin,   // Draw left-to-right from margin.
      this.layout.rightMargin);
  };

  this.mapValueToHeight = function (value) {
    //map value to height of graph
    return map(value,
      this.minPercent,
      this.maxPercent,
      this.layout.bottomMargin,   // Draw top-to-bottom from margin.
      this.layout.topMargin);
  };
}
