/*
* reference: // based on topic 6: 6.206 Extending the data visualiser: building the waffle charts 
 * MDN Web Docs reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
 */
class WaffleChart {
  //parent constructor that is accessed by gallery
  constructor(){
    //declare properties
    this.name = 'Waffle Chart';
    this.id = 'waffle-chart';

    //declare  waffles array
    this.waffles = [];

    //property of data's load status
    this.loaded = false;

    //set standard layout of data visualisation
    this.marginSize = 35;

    this.leftMargin = this.marginSize * 2;
    this.topMargin = this.marginSize;
    
    //set layout of waffle chart 
    this.waffX = this.leftMargin + 50;
    this.waffY = this.topMargin + 100;
    this.waffWidth = 120;
    this.waffHeight = 120;
    this.gap = 110; //gap in between waffles
    this.spacingX = this.waffWidth + this.gap;
    this.spacingY = this.waffHeight + this.waffY + this.gap;

    //number of boxes in each waffle
    this.numBoxAcross = 7;
    this.numBoxDown = 7;
  };

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

    //pushes Waffle object into this.waffles array
    for(let i = 0; i < days.length; i++){
      if(i < 4) {
        this.waffles.push(
          new Waffle(
            this.waffX + (i * this.spacingX), 
            this.waffY, 
            this.waffWidth, 
            this.waffHeight, 
            this.numBoxAcross,
            this.numBoxDown, 
            this.data, days[i], values, 
            this.frameCount, this.frameRate
            )
          );
        //calls addCat & addBox
        this.waffles[i].addCat();
        this.waffles[i].addBox();
      } else {
        this.waffles.push(
          new Waffle(
            this.waffX + (i - 4) * this.spacingX, 
            this.spacingY, 
            this.waffWidth, 
            this.waffHeight,
            this.numBoxAcross,
            this.numBoxDown,this.data, days[i], values, 
            this.frameCount, this.frameRate
            )
          );
        //calls addCat & addBox
        this.waffles[i].addCat();
        this.waffles[i].addBox();
      };
    };
  };

  destroy = function(){
    //reset waffles when user exits from graph
    this.waffles.length = 0;
  };
  
  drawTitle = function(){
    //draw title of chart
    push();
    noStroke();
    fill(0);
    textSize(36)
    textAlign(LEFT, TOP);
    text('Preferred Meals on Days of the Week', this.waffX, this.topMargin);
    pop();
  };

  draw = function(){
    //draw chart
    this.drawTitle(); //draw title
    for(let i = 0; i < this.waffles.length;i++){
      //draw waffles for every day of the week
      this.waffles[i].draw();
    }
    for(let i = 0; i < this.waffles.length;i++){
      //check is mouse hovering over boxes of waffles
      this.waffles[i].checkMouse();
    };
  };
};

class Waffle extends WaffleChart {
  //child of WaffleChart; subclass constructor for waffle
  constructor(
    x, y, w, h, 
    boxAcross, boxDown, 
    data, colHead, possibleVal, 
    frameCount, frameRate){
    //declare/initialise properties
    //calls on parent for passed properties
    super(
      x, y, w, h, 
      boxAcross, boxDown, 
      data, colHead, possibleVal, 
      frameCount, frameRate);

    //initialise called properties
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

    // initialise own properties
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
  
  
  checkMouse = function(mouseX, mouseY){
    //if mouse is hovering over box than print val of box 
    for( let i = 0; i < this.boxes.length; i++){
      for(let j = 0; j < this.boxes[i].length; j++){
        if(this.boxes[i][j].cat != undefined){
          let mouseOn = this.boxes[i][j].mouseOver(mouseX, mouseY);
          if(mouseOn != false){
            push();
              fill(100);
              textSize(10);
              let textW = textWidth(mouseOn);
              textAlign(LEFT, CENTER);
              rect(mouseX, mouseY, textW + 20, 20, 5);
              fill(255);  
              noStroke();
              textStyle(BOLD);
              text(mouseOn, mouseX + 10, mouseY + 10); 
            pop();
            return mouseOn;
          };
        };
      };
    };
  };

  drawDay = function(){
    //draw day of the week for each waffle
    push();
    noStroke();
    fill(0);
    textSize(20);
    textAlign(CENTER, TOP);
    text(this.colHead, this.x + (this.w/2), this.y + this.h + 5);
    pop();
  }
    
  draw = function(){
    //draw boxes in each waffle
    let boxCount = 0; //count boxes
 
    for(let i = 0; i < this.boxes.length; i++){
      for(let j = 0; j < this.boxes[i].length; j++){
        if(this.boxes[i][j].cat != undefined){
          this.boxes[i][j].draw();
          boxCount++;
        };
        //will create the animation effect
        if(boxCount >= this.frameCount){
          break;
        };
      };
    };
    this.drawDay();//draw day of the week for each waffle
    this.checkMouse(mouseX, mouseY); //check mouse hover on every box
    this.frameCount += this.frameRate; //increase the frameCount by frameRate after every draw loop
  };
};
class Box extends WaffleChart {
  //child of WaffleChart; subclass constructor for each box in the waffle
  constructor(x, y, w, h, cat){
    //declare/initialise properties
    //calls on parent for passed properties
    super(x, y, w, h, cat);

    //initialise called properties
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.cat = cat;
  }
  
  mouseOver = function(mouseX, mouseY){
    //checks if mouse is hovering over box then returns value if true
    if(mouseX > this.x && mouseX < this.x + this.w&& mouseY > this.y && mouseY < this.y + this.h){
      return this.cat.name;
    };
    return false
  };
  
  draw = function(){
    //draws box
    push();
    stroke(0)
    fill(this.cat.colour);
    rect(this.x, this.y, this.w, this.h);
    pop();
  };
};