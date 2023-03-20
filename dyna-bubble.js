class DynaBubbleChart {

  constructor(){
    this.name = 'Dynamic Bubble Chart';
    this.id = 'dyna-bubble';

    this.marginSize = 35;
    
    this.leftMargin = this.marginSize * 2;
    this.topMargin = this.marginSize;
    this.rightMargin = width - this.marginSize;
    this.bottomMargin = height - this.marginSize * 2;

    this.bubbles = [];
    this.years = [];
    this.yearButtons = [];
    this.maxAmt;
  };

  preload = function(){
    let self = this;
    this.data = loadTable('./data/foodData.csv','csv', 'header',
    
    function(){
      self.loaded = true;
    });
  };

  setup = function(){
    let rows = this.data.getRows();
    let numColumns = this.data.getColumnCount();
    this.select = createSelect();
    this.select.position(width/2 - 40,height/4);

    for(let i = 5; i < numColumns; i++){
      let y = this.data.columns[i];
      this.select.option(y);
      this.years.push(y);
    }
  
    this.maxAmt = 0;

    for(let i = 0; i < rows.length; i++){
      if(rows[i].get(0) != ''){
        let bub = new Bubble(rows[i].get(0), this.maxAmt);

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
    let yr = this.years.indexOf(year);

    for(let i = 1; i < this.bubbles.length; i++){
      this.bubbles[i].setData(yr);
    }
  }
  
  destroy = function(){
    this.select.remove();
    this.bubbles = [];
  }

  draw = function(){

    //updates the graph according to year selected
    this.changeYear(this.select.value());
    
    for(let i = 0; i < this.bubbles.length; i++){
      this.bubbles[i].update(this.bubbles, mouseX, mouseY);
      this.bubbles[i].draw(i);
      this.bubbles[i].mousePlay(mouseX, mouseY);
    }   
    this.drawInstruc();
  }

  drawInstruc = function(){
    //draw instructions
    push();
    fill(0);
    textAlign(LEFT, CENTER);
    textSize(12)
    text('Hover over the bubbles to make them grow!\nClick them to make them pop!' , this.leftMargin, this.topMargin + 50);
    pop()
  }
}

class Bubble extends DynaBubbleChart {
  constructor(name, maxAmt){
    super(name, maxAmt);
  
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
    push();
    noStroke();
    fill(this.colour);
    ellipse(this.pos.x, this.pos.y, this.size);
    pop();
  }

  update = function (bub){
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
    
    this.pos.add(this.direction);
    let conSize =  constrain(this.size, min(this.targetSize), max(this.targetSize));
    if(this.size < this.targetSize){
      this.size++;
    } 
  }
  
  setData = function(i){
    this.targetSize = map(this.dat[i], 0, this.maxAmt, 20, 150);
  }
  
  mousePlay = function(mouseX, mouseY){
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