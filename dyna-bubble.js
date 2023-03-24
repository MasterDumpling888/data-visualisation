/*
* reference: // based on topic 7: 7.205 Extending the data visualiser: dynamic presentation of data, part 2 
 * MDN Web Docs reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
 */
class DynaBubbleChart {
  //parent constructor that is accessed by gallery
  constructor(){
    //declare properties
    this.name = 'Dynamic Bubble Chart';
    this.id = 'dyna-bubble';

    //declare arrays
    this.bubbles = [];
    this.years = [];
    this.yearButtons = [];

    //set standard layout of data visualisation
    this.marginSize = 35;
    
    this.leftMargin = this.marginSize * 2;
    this.topMargin = this.marginSize;
    this.bottomMargin = height - this.marginSize * 2;

    //declare maxAmt variable
    this.maxAmt;
  };

  preload = function(){
    //preload data
    let self = this;
    //load data set
    this.data = loadTable('./data/foodData.csv','csv', 'header',
    
    //callback, sets this.loaded to true when data is finished loading
    function(){
      self.loaded = true;
    });
  };

  setup = function(){
    //create variables for rows and number of columns
    let rows = this.data.getRows();
    let numColumns = this.data.getColumnCount();

    //Create a select DOM element: referenced from P5 reference page (search string: createSelect)
    this.select = createSelect();
    
    // set the select position
    this.select.position(width/2, height/4.5);

    //populate select options with years
    for(let i = 5; i < numColumns; i++){
      let y = this.data.columns[i];
      this.select.option(y);
      this.years.push(y);
    }
  
    //initialise maxAmt to 0
    this.maxAmt = 0;

    //parse constructor bubbles
    for(let i = 0; i < rows.length; i++){
      if(rows[i].get(0) != ''){
        let bub = new Bubble(rows[i].get(0), this.maxAmt);

        //change maxAmt
        for(let j = 5; j < numColumns; j++){
          if(rows[i].get(j) != ""){
            let n = rows[i].getNum(j);
            if(n > this.maxAmt){
              this.maxAmt = n;
            }
            bub.dat.push(n);
          } else {
            bub.dat.push(0);
          } 
        }
        this.bubbles.push(bub);
      }
    }
    for(let i = 1; i < this.bubbles.length; i++){
      this.bubbles[i].setData(0);
    }
  }

  changeYear = function (year){
    //change year of bubbles' data
    let yr = this.years.indexOf(year);

    for(let i = 1; i < this.bubbles.length; i++){
      this.bubbles[i].setData(yr);
    }
  }
  
  destroy = function(){
    this.bubbles = []; //reset the bubbles array when graph is accessed more than once

    //remove DOM element
    this.select.remove();
  }

  draw = function(){
    //draw graph
    //checks if data is loaded and if not alerts
    if (!this.loaded) {
      alert('Data not yet loaded');
      return;
    }

    //updates the graph according to year selected
    this.changeYear(this.select.value());

    //draw title and instructions
    this.drawTexts();
    
    //draw bubbles
    for(let i = 0; i < this.bubbles.length; i++){
      this.bubbles[i].update(this.bubbles, mouseX, mouseY);
      this.bubbles[i].draw(i);
      this.bubbles[i].mousePlay(mouseX, mouseY);
    }   
  }

  drawTexts = function(){
    //draw title/instructions
    push();
      fill(0);
      textAlign(CENTER, CENTER);
      textSize(24);
      text('Most Household Foods bought', width/2, this.topMargin)
      textAlign(LEFT, CENTER);
      textSize(12)
      text('Hover over the bubbles to make them grow!\nClick them to make them pop!' , this.leftMargin, this.topMargin + 50);
    pop()
  }
}

class Bubble extends DynaBubbleChart {
  //child of DynaBubbleChart; subclass constructor for creating bubble
  constructor(name, maxAmt){
    //declare/initialise properties
    //calls on parent for passed properties
    super(name, maxAmt);
  
    //initialise called properties
    this.name = name;
    this.maxAmt = maxAmt;

    this.size = 20;
    this.targetSize = 20;
    this.pos = createVector(width/2, height/2); //position of bubbles (hardcoded so no complications with mousePlay)
    this.direction = createVector(0,0);
    this.colour = randomColor(100, 255, 100, 255, 100, 255);
    this.dat = [];
  };

  draw = function (){
    //draw bubble
    push();
      noStroke();
      fill(this.colour);
      ellipse(this.pos.x, this.pos.y, this.size);
    pop();
  }

  update = function (bub){
    //update the size of bubble
    this.direction.set(0,0);
    for(let i = 0; i < bub.length; i++){
      if(bub[i].name != this.name){
        let vector = p5.Vector.sub(this.pos, bub[i].pos);
        let d = vector.mag();
        
        if(d < this.size/2 + bub[i].size/2){
          if(d > 0){
            this.direction.add(vector);
          } else {
            this.direction.add(p5.Vector.random2D());
          }
        }
      }
    }

    this.direction.normalize();
    this.direction.mult(2);
    
    //update size and position
    this.pos.add(this.direction);
    if(this.size < this.targetSize){
      this.size++;
    } 
  }
  
  setData = function(i){
    //set the size of bubble
    this.targetSize = map(this.dat[i], 0, this.maxAmt, 20, 150);
  }
  
  mousePlay = function(mouseX, mouseY){
    //mouse interactions with bubble
    let d = dist(this.pos.x, this.pos.y, mouseX, mouseY);
    let rad = this.size/2;

    //checks if mouse is over the bubble
    if(d < rad){
      // makes text to show which bubble mouse is over
      push();
        textSize(12);
        let txtW = textWidth(this.name);
        noStroke();
        fill(this.colour);
        rectMode(CENTER)
        rect(width/2, this.bottomMargin + 30, txtW + 20, 20, 10);
        fill(0);
        textAlign(CENTER, CENTER);
        text(this.name, width/2, this.bottomMargin + 30);
      pop();

      //increase size of bubble that mouse is over
      if(this.size < this.targetSize + 10){
        this.size ++;
      } 
      
      //pops the bubble if mouse over it is pressed
      if (mouseIsPressed){
        this.size = 0;
      }
    }
  }
}