function BarChart() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'Top Brands 2000 to 2019';

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = 'top-brands';

  // Names for each axis.
  let marginSize = 35;
  let years;
  let dataArray = {};
  let colorScale = {};

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    marginSize: marginSize,

    // Margin positions around the plot. Left and bottom have double
    // margin size to make space for axis and tick labels on the canvas.
    leftMargin: marginSize,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize / 2,
    pad: 5,

    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    },

    // Boolean to enable/disable background grid.
    grid: true,

    // Number of axis tick labels to draw so that they are not drawn on top of one another.
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the gallery when a visualisation is added.
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/top-brands/top-brands2.csv', 'csv', 'header',
      // Callback function to set the value this.loaded to true.
      function (table) {
        self.loaded = true;
      });
  };

  this.setup = function () {
    noStroke();
    // Count the number of frames drawn since the visualisation started so that we can animate the chart.
    this.frameCount = 0;
    this.frameRate = 10;

    this.minYear = 2000;
    this.maxYear = 2019;
    this.year = this.minYear;

    this.parseData();
    console.log(dataArray);

    this.maxVal = dataArray[this.maxYear][0].value;
    console.log(this.maxVal);
  };

  this.destroy = function () {
    textFont('Andale Mono');
    textStyle(NORMAL);
  };

  // !Draw function
  this.draw = function () {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }
    const n = 12; // number of brands to display
    let barHeight = this.layout.plotHeight() / n;

    if (this.year <= this.maxYear) {
      if (this.frameCount < this.frameRate) {
        let data1 = dataArray[this.year];
        let data2 = dataArray[this.year + 1];
        let rank1 = 0;
        let rank2 = 0;

        let xMax = map(this.maxVal, 0, this.maxVal, 0, this.layout.plotWidth()); // so maxVal always spans the entire plotWidth

        // TODO: change x-axis ticks and values based on maxVal

        for (let i = 0; i < n; i++) {
          let valueNext = 0
          let found = false;
          // console.log(found);
          if (this.year < this.maxYear) {
            for (let j = 0; j < n + 50; j++) {
              if (data1[i].name === data2[j].name) {
                rank2 = j;
                valueNext = data2[j].value;
                found = true;
                break
              }
            }
          } else {
            rank2 = rank1;
            valueNext = data1[i].value;
          }
          if (found) {
            let diff = rank2 - rank1;
            fill(colorScale[data1[i].category]);
            valueNext = map(valueNext, 0, this.maxVal, 0, this.layout.plotWidth());
            let barWidth = map(data1[i].value, 0, this.maxVal, 0, this.layout.plotWidth());
            let w = barWidth + (valueNext - barWidth) / this.frameRate * this.frameCount;
            let yPos = (this.layout.topMargin + rank1 * barHeight) + (diff * barHeight) / this.frameRate * this.frameCount;
            rect(this.layout.leftMargin, yPos, w, barHeight - 5);
            rank1++;
          }
        }
        this.frameCount += 0.1;

        // * ticker showing year
        textSize(40);
        textFont('Helvetica');
        textAlign('center', 'center');
        textStyle(BOLD);
        fill(0);
        text(this.year, width - 120, height - marginSize * 2);
      } else {
        this.year++;
        this.frameCount = 0;
      }
    } else noLoop();
  } // end of draw()

  this.parseData = function () {

    years = this.data.getColumn('year')
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a - b)
      .filter(item => item !== '0');

    for (let i = 0; i < this.data.getRowCount(); i++) {
      let year = this.data.getNum(i, 'year');
      let name = this.data.getString(i, 'name');
      let category = this.data.getString(i, 'category');
      let value = this.data.getNum(i, 'value');

      if (year !== NaN) {
        if (dataArray[year]) {
          dataArray[year].push({ name, category, value })
        } else dataArray[year] = [];
      }

      // *assign unique colors to each category
      if (category !== NaN) {
        if (colorScale[category]) {
          let r = random(100, 220);
          let g = random(90, 180);
          let b = random(90, 180);
          let c = color(r, g, b)
          colorScale[category] = c;
        } else colorScale[category] = color(255, 0, 0);
      }
    }

    // *sort dataArray based on values (ascending)
    years.forEach(year => {
      let arr = dataArray[year];
      arr.sort((a, b) => b.value - a.value)
      dataArray[year] = arr;
    });
  }

  this.mapValueToWidth = function (value) {
    return map(value, 0, 100, 0, this.layout.plotWidth());
  }
}