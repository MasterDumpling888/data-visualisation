/* reference: // mostly built upon the standard structure of template //
  * PayGap 1997-2017(from template)
  * P5 reference page
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
    topMargin: marginSize + 75,
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

  //preload data
  this.preload = function () {
    let self = this;
    //load data set
    this.data = loadTable('./data/internet-users/internet_1990_2020.csv', 'csv', 'header',

      //callback, sets this.loaded to true
      function () {
        self.loaded = true;
      });
  };

  this.setup = function () {
    //font settings
    
    textSize(16);
    textAlign(CENTER);

    // Set min and max years: assumes data is sorted by year
    this.startYear = this.data.getNum(0, 'year');
    this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'year');

    // Create a select DOM element: referenced from P5 reference page (search string: createSelect)
    this.select = createSelect();

    // set the select position
    this.select.position(width/2, height/4);

    // Populate select options with country names
    for (let i = 1; i < this.data.getColumnCount(); i++) {
      this.select.option(this.data.columns[i]);
    }

    // Create color picker for graph fill: referenced from P5 reference page (search string: createColorPicker)
    //set default colour to #a8dadc
    this.colorPicker = createColorPicker('#6179ee');

    // Set the color picker position
    this.colorPicker.position(width/2.3, height/4)
    // Find min and max percentage
    this.minPercent = 0;
    this.maxPercent = 100;
  };

  this.destroy = function () {
    this.select.remove();
    this.colorPicker.remove();
  };

  this.draw = function () {
    //checks if data is loaded and if not alerts
    if (!this.loaded) {
      alert("Data hasn't loaded!");
      return;
    }

    //draw y axis  labels
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

    //Converts strings in selected data's column to numbers
    let value = stringsToNumbers(this.data.getColumn(this.select.value()));
    
    let year_arr = [];
    let val_arr = [];
    for (let i = 0; i < this.data.getRowCount(); i++) {
      //object that stores data of current year
      let current = {
        //convert strings of data to numbers
        'year': this.data.getNum(i, 'year'),
        'value': value[i]
      };

      year_arr.push(current.year);
      val_arr.push(current.value);
      
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
        stroke(c)//put stroke to remove line gaps between vertex points
        fill(c); // fills vertex with colour from colorPicker

        // Draws shape from previous year to current year then connects to bottom margin to close shape
        
        beginShape();
        vertex(this.mapYearToWidth(previous.year),
          this.mapValueToHeight(previous.value));
        vertex(this.mapYearToWidth(current.year),
          this.mapValueToHeight(current.value));
        endShape();
        
        this.drawPoints(previous);

        
       
        //Draw point for final year
        if (current.year == this.endYear) {
          this.drawPoints(current);
        };
      };

      // Assign current year to previous year so that it is available
      // during the next iteration of this loop to give us the start
      // position of the next line segment.
      previous = current;
    };
    
  };

  this.drawPoints = function(yr){
    //Draws accessible points
    //Point settings
    noStroke();
    fill('#1D2447');
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
    return map(value,
      this.startYear,
      this.endYear,
      this.layout.leftMargin,   // Draw left-to-right from margin.
      this.layout.rightMargin);
  };

  this.mapValueToHeight = function (value) {
    return map(value,
      this.minPercent,
      this.maxPercent,
      this.layout.bottomMargin,   // Draw top-to-bottom from margin.
      this.layout.topMargin);
  };
}
