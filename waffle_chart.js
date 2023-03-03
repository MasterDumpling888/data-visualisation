/**reference: //based on topic 6: 6.206 Extending the data visualiser: building the waffle charts 
 * MDN Web Docs reference https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
 */
//parent constructor that is accessed by gallery
class WaffleChart {
  constructor(){
    this.name = 'Waffle Chart';
    this.id = 'waffle-chart';

    this.waff;
    this.waffles = [];
    this.loaded = false;
    this.frameCount;
    this.frameRate;

    this.marginSize = 35;
  };

  // layout = {
  //   marginSize: this.marginSize,
  //   leftMargin
  // }
  
  preload = function(){
    let self = this;
    this.data = loadTable('./data/finalData.csv', 'csv', 'header',
      
    function(){
      self.loaded = true;
    });
  };
  
  setup = function() {
    let days = ['Monday', 'Tuesday','Wednesday', 'Thursday','Friday','Saturday','Sunday'];
    
    let values = ['Take-away','Cooked from fresh','Ready meal', 'Ate out','Skipped meal', 'Left overs'];
    
    //set frameCount and frameRate
    this.frameCount = 0;
    this.frameRate = 0.3;

    for(let i = 0; i < days.length; i++){
      if(i < 4){
        this.waffles.push(new Waffle(20 + (i * 200), 20, 100,100,10,10,this.data, days[i], values, this.frameCount, this.frameRate));
        this.waffles[i].addCat();
        this.waffles[i].addBox();
        
      } else {
        this.waffles.push(new Waffle(20 + (i - 4) * 200, 200, 100,100,10,10,this.data, days[i], values, this.frameCount, this.frameRate));
        this.waffles[i].addCat();
        this.waffles[i].addBox();
      };
    };
  };

  destroy = function(){
    //reset waffles when user exits from graph
    this.waffles.length = 0;
  }

  draw = function(){
    for(let i = 0; i< this.waffles.length;i++){
      this.waffles[i].draw();
    }
    for(let i = 0; i < this.waffles.length;i++){
      this.waffles[i].checkMouse();
    };
  };
};

//subclass constructor for waffle
class Waffle extends WaffleChart {
  constructor(x, y, w, h, boxAcross, boxDown, data, colHead, possibleVal, frameCount, frameRate){
    super(x, y, w, h, boxAcross, boxDown, data, colHead, possibleVal, frameCount, frameRate);

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.boxAcross = boxAcross;
    this.boxDown = boxDown;
    this.colHead = colHead;
    this.possibleVal = possibleVal;
    this.frameCount = frameCount;
    this.frameRate = frameRate;


    // this.frame;
    this.cat = [];
    this.boxes = [];
    this.colours = [
      'Crimson', // = Take-away
      'Orange', // = Cooked from fresh
      'Yellow', // = Ready meal
      'Chartreuse', // = Ate out
      'DodgerBlue', // = Skipped meal
      'DarkViolet']; // = Leftovers
    this.column = data.getColumn(colHead);
  }
  

  catLoc = function(catName){
    for(let i = 0; i < this.cat.length; i++){
      if(catName == this.cat[i].name){
        return i;
      }
    }
    return -1;
  };

  addCat = function(){
    if(this.cat <= 7){
      for(let i = 0; i < this.possibleVal.length; i++){
        this.cat.push({
          'name': this.possibleVal[i],
          'count': 0,
          'colour': this.colours[i % this.colours.length]
        });
      };

      for(let i = 0; i < this.column.length; i++){
        let cLoc = this.catLoc(this.column[i]);
        if(cLoc != -1){
          this.cat[cLoc].count++;
        };
      };
      for(let i = 0; i < this.cat.length; i++){
        this.cat[i].boxes = round((this.cat[i].count/this.column.length) * (this.boxAcross * this.boxDown));
      };
    };
  };

  addBox = function(){
    let currentCat = 0;
    let currentCatBox = 0;

    let boxWidth = this.w / this.boxAcross;
    let boxHeight = this.h / this.boxDown;

    for(let i = 0; i < this.boxDown;i++){
      this.boxes.push([])
      for(let j = 0; j < this.boxAcross; j++){
        if(currentCatBox == this.cat[currentCat].boxes){
          currentCatBox = 0;
          currentCat++;
        };
        
        this.boxes[i].push(new Box(this.x + (j * boxWidth), this.y + (i * boxHeight), boxWidth, boxHeight, this.cat[currentCat]));
        currentCatBox++;
      };
    };
  };
  
  
  //if mouse is hovering over box than print val of box 
  checkMouse = function(mouseX, mouseY){
    for( let i = 0; i < this.boxes.length; i++){
      for(let j = 0; j < this.boxes[i].length; j++){
        if(this.boxes[i][j].cat != undefined){
          let mouseOn = this.boxes[i][j].mouseOver(mouseX, mouseY);
          if(mouseOn != false){
            push();
              fill(0);
              textSize(20);
              let textW = textWidth(mouseOn);
              textAlign(LEFT, TOP);
              rect(mouseX, mouseY, textW + 20, 40);
              fill(255);
              text(mouseOn, mouseX + 10, mouseY + 10);
            pop();
            break;
          };
        };
      };
    };
  };

  //draw day of the week over each waffle
  drawDay = function(){
    push();
    noStroke();
    fill(0);
    textSize(20);
    textAlign(LEFT, BOTTOM);
    text(this.colHead, this.x, this.y);
    pop();
  }
    
  draw = function(){
    let boxCount = 0;
 
    for(let i = 0; i < this.boxes.length; i++){
      for(let j = 0; j < this.boxes[i].length; j++){
        if(this.boxes[i][j].cat != undefined){
          this.boxes[i][j].draw();
          boxCount++;
        }
        if(boxCount >= this.frameCount){
          break;
        }
      }
      
    }
    this.drawDay();
    this.checkMouse(mouseX, mouseY);
    this.frameCount += this.frameRate; 
  };
  
};
//subclass constructor for each box in the waffle
class Box extends WaffleChart {
  constructor(x, y, w, h, cat){
    super(x, y, w, h, cat);

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.cat = cat;
    
  }
  mouseOver = function(mouseX, mouseY){
    if(mouseX > this.x && mouseX < this.x + this.w&& mouseY > this.y && mouseY < this.y + this.h){
      return this.cat.name;
    };
    return false
  };
  draw = function(){
    stroke(0)
    fill(this.cat.colour);
    rect(this.x, this.y, this.w, this.h);
    
  };
};