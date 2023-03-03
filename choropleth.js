/**reference: // not yet finished // 
 * P5 reference page
 * Sepand Ansari: d3.js and p5.js topojson and projections
*/

function Choropleth() {
  //name for visualisation
  this.name = 'World Population: 2000-2050';
  //visualisation ID
  this.id = 'choropleth';

  let marginSize = 35;

  this.layout = {
    marginSize: marginSize,
    //margins of graphs
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize + 75,
    bottomMargin: height - marginSize * 2,

    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    }
  };

  let projection, canvas, context, path, subset, colorScale;
  let data = {};

  this.loaded = false;

  this.preload = function () {
    let self = this;
    //load data set
    this.popData = loadTable('./data/choropleth/worldPopulation.csv', 'csv', 'header');
    this.mapData = loadJSON('./data/choropleth/countries-50m.json', 'json',
      function () {
        self.loaded = true;
      });

  }
 
  this.setup = function () {
    canvas = document.getElementById('defaultCanvas0');
    context = canvas.getContext('2d');

    // map popData to data {'id': {name: name, pop: population}}
    for (let i = 0; i < this.popData.getRowCount(); i++) {
      let d = {}
      d.name = this.popData.getString(i, 'country');
      d.pop = this.popData.getNum(i, 'pop2022');
      let temp = this.popData.getString(i, 'id');
      data[temp] = d;
    }

    // subset filters countries (by id) that has population data (var data)
    subset = topojson.feature(this.mapData, this.mapData.objects.countries)
      .features
      .filter(function (d) {
        return d.id in data;
      });

    projection = d3.geoNaturalEarth1()
      .scale(160)
      .translate([this.layout.plotWidth() / 2, this.layout.plotHeight() - 75]);

    this.colors = d3.schemeYlOrBr[7];

    colorScale = d3.scaleThreshold()
      .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
      .range(this.colors);

    path = d3.geoPath()
      .projection(projection)
      .context(context);
  }

  this.destroy = function () {

  }

  this.draw = function () {
    // draw the title
    this.drawTitle();

    //draw the map
    context.strokeStyle = "#fff";
    context.lineWidth = 0.3;
    subset.forEach(function (d) {
      context.fillStyle = colorScale(data[d.id]["pop"]);
      context.beginPath();
      path(d);
      context.fill();
      context.stroke();
    });

    context.lineWidth = 1;
    path(topojson.mesh(this.mapData, this.mapData.objects.countries, function (a, b) { return a.id !== b.id; }));
    context.stroke();
    context.closePath();

    noLoop();
  }

  this.drawTitle = function () {
    //draw title for graph
    textSize(24);
    textAlign(LEFT, CENTER);
    fill(0);
    noStroke();
    text(this.name, this.layout.leftMargin, this.layout.topMargin - 50);
  }

  this.drawLegend = function () {
    for (let i = 0; i < 8; i++) {

    }
  }
}