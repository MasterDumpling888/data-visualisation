function BarChart() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'Top Brands 2000-2019';

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = 'top-brands';

  // Names for each axis.
  let marginSize = 35;

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

    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    },
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
    this.frameRate = 15;

    this.parseData();

    this.minYear = 2000;
    this.maxYear = 2019;
    this.year = this.minYear;

    this.maxVal = dataArray[this.maxYear][0].value;
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

    // TODO: draw Title
    // TODO: draw Legend
    // TODO: draw x-Axis ??

    if (this.year <= this.maxYear) {
      let data1 = dataArray[this.year];
      let data2 = dataArray[this.year + 1];
      let rank1 = 0;
      let rank2 = 0;

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
        } else if (this.year = this.maxYear) {
          rank2 = rank1;
          valueNext = data1[i].value;
          found = true;
        }
        if (found) {
          let diff = rank2 - rank1;
          let valueNextWidth = this.mapValueToWidth(valueNext);
          let barWidth = this.mapValueToWidth(data1[i].value);
          let w = barWidth + (valueNextWidth - barWidth) / this.frameRate * this.frameCount;
          let yPos = (this.layout.topMargin + rank1 * barHeight) + (diff * barHeight) / this.frameRate * this.frameCount;

          //draw bar
          noStroke();
          fill(colorScale[data1[i].category]);
          rect(this.layout.leftMargin, yPos, w, barHeight - 5);

          //draw name and value
          let dispValue = ceil(data1[i].value + (valueNext - data1[i].value) / this.frameRate * this.frameCount);
          fill('#FFFFFF');
          stroke('#000000');
          textAlign(RIGHT);
          textSize(12);
          textStyle(NORMAL);
          text(data1[i].name, this.layout.leftMargin + w - 20, yPos + 10);
          text(dispValue, this.layout.leftMargin + w - 20, yPos + 30)

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
  } // end of draw()

  this.drawTicker = function (ticker) {    // * ticker showing year
    textSize(40);
    textFont('Helvetica');
    textAlign('center', 'center');
    textStyle(BOLD);
    fill(0);
    text(ticker, width - 120, height - marginSize * 2);
  }

  this.parseData = function () {  // * place all data in dataArray object
    for (let i = 0; i < this.data.getRowCount(); i++) {
      let year = this.data.getNum(i, 'year');
      let name = this.data.getString(i, 'name');
      let category = this.data.getString(i, 'category');
      let value = this.data.getNum(i, 'value');

      if (!dataArray[year]) {
        dataArray[year] = []; // create array
      }
      dataArray[year].push({ name, category, value });

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
    for (let i = this.minYear; i <= this.maxYear; i++) {
      let arr = dataArray[i];
      arr.sort((a, b) => b.value - a.value);
      dataArray[i] = arr;
    }
  }

  this.mapValueToWidth = function (value) {
    return map(value, 0, this.maxVal, 0, this.layout.plotWidth());
  }
}