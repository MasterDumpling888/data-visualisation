
// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;

// preloads font
function preload (){
  font = loadFont('./assets/AvenirLTStd-Roman.otf');
};

function setup() {
  //set font for all graphs
  textFont('Andale Mono')

  // Create a canvas to fill the content div from index.html.
  let c = createCanvas(1024, 576);
  c.position(400, 125)
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
  gallery.addVisual(new WaffleChart())
  // gallery.addVisual(new Choropleth());
  // gallery.addVisual(new Map());
}

function draw() {
  background(255);
  if (gallery.selectedVisual != null) {
    gallery.selectedVisual.draw();
  }
}
