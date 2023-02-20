/** reference:
 * Weidi Zhang: 3D Data visualization Part 1 & 2
*/
function LineGraph3D(){
  this.name = '3D Line Graph';
  this.id = '3d-line-graph';

  let marginSize = 35;

  this.layout = {
    marginSize: marginSize,

    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,

    plotWidth: function(){
      return this.rightMargin - this.leftMargin;
    },
    plotHeight: function(){
      return this.bottomMargin - this.topMargin;
    },

    grid: false
  };

  this.loaded = false;

  this.preload = function(){
    let self = this;

    this.data = loadTable('./data/surface-temperature/surface-temperature.csv', ' csv','header',
      
      function(){
        self.loaded = true;
      });
  };

  // this.canvas = createCanvas(this.layout.plotWidth(), this.layout.plotHeight(), WEBGL); 
  // this.canvas = function(){

  //   // makeCanvas(false, P2D);
  // }
  
  this.setup = function (){
    // this.canvas.position(this.layout.leftMargin, this.layout.topMargin);
    
    createEasyCam();
    document.oncontextmenu = () => false;
  };

  this.destroy = function (){
    // context.reset();

    // this.canvas = createCanvas(this.layout.plotWidth(), this.layout.plotHeight(), P2D);
    // translate(-width/2, -height/2); 
  };

  this.draw = function(){
    
  };
}