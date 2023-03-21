
// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;

function setup() {
  //set font for all graphs
  textFont('Andale Mono');

  // Create a canvas to fill the content div from index.html.
  let c = createCanvas(1024, 576);
  c.position(450, 120)
  c.parent('app');


  // Create a new gallery object.
  gallery = new Gallery();

  // Add the visualisation objects here.
  gallery.addVisual(new TechDiversityRace());
  gallery.addVisual(new TechDiversityGender());
  gallery.addVisual(new PayGapByJob2017());
  gallery.addVisual(new PayGapTimeSeries());
  gallery.addVisual(new ClimateChange());
  gallery.addVisual(new InternetUserCountryPop());
  gallery.addVisual(new FoodInflation2021());
  gallery.addVisual(new BarChart());
  gallery.addVisual(new WorldMap());
  gallery.addVisual(new WaffleChart());
  gallery.addVisual(new DynaBubbleChart());


}

function draw() {
  welcomeTxt();
  if (gallery.selectedVisual != null) {
    clear()
    background(255);
    gallery.selectedVisual.draw();
  }
}

function welcomeTxt(){
  background(255);
  push();
    textAlign(CENTER)
    textStyle(BOLD);
    textSize(48);
    text('welcome :)', width/2, height/2);
  pop();
}
