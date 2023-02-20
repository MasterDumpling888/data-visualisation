/*This is an experiment on the using the Graphica p5 library 
THIS IS NOT INCLUDED AS AN EXTENSION*/
function Grafica(p) {
  this.name = 'Grafica';
  this.id = 'grafica';

  let points = [];
  let plot = new GPlot(p);

  this.layout = {
    leftMargin: 130,
    rightMargin: width,
    topMargin: 30,
    bottomMargin: height,
    pad: 5
  }

  this.setup = function () {
    // Create a new plot and set its position on the screen

    let seed = 100 * random();

    for (i = 0; i < 100; i++) {
      points[i] = new GPoint(i, 10 * noise(0.1 * i + seed));
    }

    plot.setPos(100, 50);
    // Add the points
  };

  this.draw = function () {
    plot.setPoints(points);

    // Set the plot title and the axis labels
    plot.setTitleText("A very simple example");
    plot.getXAxis().setAxisLabelText("x axis");
    plot.getYAxis().setAxisLabelText("y axis");

    // Draw it!
    plot.defaultDraw();
    console.log(plot);
    noLoop();
  }
}