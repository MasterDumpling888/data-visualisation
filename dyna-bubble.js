class DynaBubbleChart {

  constructor(){
    this.name = 'Dynamic Bubble Chart';
    this.id = 'dyna-bubble';

    this.bubbles = [];
    this.years = [];
    this.yearButtons = [];
    this.maxAmt = 0;
  };
  preload = function(){
    let self = this;
    this.data = loadTable('./data/foodData.csv','csv', ' header',
    
    function(){
      self.loaded = true;
    });
  };

  setup = function(){
    let rows = this.data.getRows();
    let numColumns = this.data.getColumnCount();
    this.button = createSelect();
    this.button.position(width/2,height/4);

    for(let i = 5; i < numColumns; i++){
      this.button.option(this.data.columns[i]);
      // let y = this.data.columns[i];
      // this.years.push(y);
      // this.button.parent('years');
      // this.button.mousePressed(function(){
      //   this.changeYear(this.elt.value)
      // })
      // this.yearButtons.push(this.button);
    }

    this.maxAmt = 0;

    for(let i = 0; i < rows.length; i++){
      if(rows[i].get(0) != ''){
        let bub = new Bubble(rows[i].get(0), this.maxAmt);

        for(let j = 5; j < numColumns; j++){
          if(rows[i].get(j) != ''){
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
    for(let i = 0; i < this.bubbles.length; i++){
      this.bubbles[i].setData(0);
    }
  }

  changeYear = function (year){
    let yr = this.years.indexOf(year);

    for(let i = 0; i < this.bubbles.length; i++){
      this.bubbles[i].setData(yr);
    }
  }

  draw = function(){
    push();
    translate(width/2,height/2);
    for(let i = 0; i < this.bubbles.length; i++){
      this.bubbles[i].update(this.bubbles);
      this.bubbles[i].draw();
    }
    pop();
  }
}
class Bubble extends DynaBubbleChart {
  constructor(name, maxAmt){
    super(name, maxAmt);
  
    this.name = name;
    this.maxAmt = maxAmt;

    this.size = 20;
    this.targetSize = 20;
    this.pos = createVector(0,0);
    this.direction = createVector(0,0);
    this.colour = randomColor(0,255,0,255,0,255);
    this.dat = [];
  };

  draw = function (){
    push();
    textAlign(CENTER);
    noStroke();
    fill(this.colour);
    ellipse(this.pos.x, this.pos.y, this.size);
    fill(0);
    text(this.name, this.pos.x, this.pos.y);
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

    if(this.size < this.targetSize){
      this.size++;
    } else if(this.size > this.targetSize){
      this.size--;
    }
  }

  setData = function(i){
    this.targetSize = map(this.dat[i], 0, this.maxAmt, 20, 250);
  }
}