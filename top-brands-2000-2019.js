/* reference:
 * D3: Bar Chart Race https://observablehq.com/@d3/bar-chart-race-explained
 */
function BarChart() {
  //name for visualisation
  this.name = 'Top Brands 2000-2019';
  //visualisation ID
  this.id = 'top-brands';

  //set margin padding
  let marginSize = 35;

  //declare array objects
  let dataArray = {};
  let colorScale = {};

  this.layout = {
    marginSize: marginSize,

    //margins of graphs
    leftMargin: marginSize,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,

    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    },

    //on/off grid
    grid: true,

    //numbers of tick labels beside the base tick
    numXTickLabels: 10,

    //number of brands to display
    numBrands: 12
  };

  //property of data's load status
  this.loaded = false;

  this.preload = function () {
    //preload data
    var self = this;
    //load data set
    this.data = loadTable(
      './data/top-brands/top-brands2.csv', 'csv', 'header',
      
      //callback, sets this.loaded to true when data is finished loading
      function () {
        self.loaded = true;
      });
  };

  this.setup = function () {
    noStroke();
    //count the number of frames drawn since the visualisation started so that we can animate the chart
    //set controlled frame count
    this.frameCount = 0;
    //set frame rate
    this.frameRate = 15;

    //call parse data when graph is accessed by user
    this.parseData();

    //set min/max year
    this.minYear = 2000;
    this.maxYear = 2019;
    this.year = this.minYear; //set starting year to minYear

    //set maxVal
    this.maxVal = dataArray[this.maxYear][0].value;
    this.minVal = dataArray[this.minYear][this.layout.numBrands - 1].value
  };

  this.destroy = function () {
    dataArray = {}; //reset the dataArray object when graph is accessed more than once
    //so dataArray won't keep growing
    colorScale = {}; //reset colorScale array object when graph is access more than once
  };

  this.draw = function () {
    //draw graph
    //checks if data is loaded and if not alerts
    if (!this.loaded) {
      alert('Data not yet loaded');
      return;
    }

    let barHeight = this.layout.plotHeight() / this.layout.numBrands; //set the thickness of each bar

    // TODO: draw Legend
    // TODO: draw x-Axis ??
    let xTicks = [];
    for(let i = this.layout.numXTickLabels; i >= 1; i--){
      let xVal = ceil(this.maxVal/i);
      xTicks.push(xVal);
    }
    for(let i = 1; i <= this.layout.numXTickLabels; i++){
      drawXAxisTickLabel(xTicks[i], this.layout, this.mapValueToWidth.bind(this));
    }
    
    // xTicks.push(xVal);
    if (this.year <= this.maxYear) {
      let data1 = dataArray[this.year];
      let data2 = dataArray[this.year + 1];
      let rank1 = 0;
      let rank2 = 0;

      for (let i = 0; i < this.layout.numBrands; i++) {
        let valueNext = 0
        let found = false;
        if (this.year < this.maxYear) {
          for (let j = 0; j < this.layout.numBrands + 50; j++) {
            if (data1[i].name === data2[j].name) {
              rank2 = j;
              valueNext = data2[j].value;
              found = true;
              break;
            };
          };
        } else if (this.year = this.maxYear) {
          rank2 = rank1;
          valueNext = data1[i].value;
          found = true;
        };
        if (found) {
          let diff = rank2 - rank1;
          let valueNextWidth = this.mapValueToWidth(valueNext);
          let barWidth = this.mapValueToWidth(data1[i].value);
          let w = barWidth + (valueNextWidth - barWidth) / this.frameRate * this.frameCount;
          let yPos = (this.layout.topMargin + rank1 * barHeight) + (diff * barHeight) / this.frameRate * this.frameCount;
          let gap = 5;

          //draw bar
          noStroke();
          fill(colorScale[data1[i].category]);
          rect(this.layout.leftMargin, yPos, w, barHeight - gap);

          //draw name and value; moves with width of each bar
          let dispValue = ceil(data1[i].value + (valueNext - data1[i].value) / this.frameRate * this.frameCount);
          push();
            fill(255);
            stroke(0);
            textAlign(RIGHT, CENTER);
            textSize(12);
            textStyle(NORMAL);
            text(data1[i].name, this.layout.leftMargin + w - 10, yPos + 10);
            text(dispValue, this.layout.leftMargin + w - 10, yPos + 30);
          pop();

          rank1++;
        }
      }
      if (this.frameCount >= this.frameRate - 0.1) {
        this.year++;
        this.frameCount = 0;
      } else this.frameCount += 0.1;

      this.drawTicker(this.year);
    } else {
      this.year = this.minYear;
    };
  };

  this.drawTicker = function (ticker) {
    // draw title with integrated ticker for year 
    push();    
      textSize(40);
      textStyle(BOLD);
      textAlign(RIGHT, CENTER);
      fill(0);
      text('Value of Top Brands in ' + ticker, this.layout.rightMargin, this.layout.plotHeight());
    pop();
  };

  this.parseData = function () {  
    //place all data in dataArray object
    for (let i = 0; i < this.data.getRowCount(); i++) {
      let year = this.data.getNum(i, 'year');
      let name = this.data.getString(i, 'name');
      let category = this.data.getString(i, 'category');
      let value = this.data.getNum(i, 'value');

      if (!dataArray[year]) {
        dataArray[year] = []; //create array
      };
      dataArray[year].push({ name, category, value });

      //assign unique colors to each category
      if (category !== NaN) {
        if (colorScale[category]) {
          let r = random(100, 220);
          let g = random(95, 200);
          let b = random(90, 255);
          let c = color(r, g, b)
          colorScale[category] = c;
        } else colorScale[category] = color(255, 0, 0);
      };
    };

    //sort dataArray based on values (ascending)
    for (let i = this.minYear; i <= this.maxYear; i++) {
      let arr = dataArray[i];
      arr.sort((a, b) => b.value - a.value);
      dataArray[i] = arr;
    };
  };

  this.mapValueToWidth = function (value) {
    //map value to width of graph
    return map(value, 0, this.maxVal, 0, this.layout.plotWidth());
  };
}