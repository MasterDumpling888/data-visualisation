function Map(){
  
  this.name = 'map';
  this.id = 'map'

  this.size = 0.5
  let countryPolygons = [];

  this.convertPathToPoly = function(path){
    let pointCoord = [0,0];
    let poly = [];
    let currentPoly = [];

    for(const node of path){
      if(node[0] == 'm'){
        pointCoord[0] += node[1] * this.size;
        pointCoord[1] += node[2] * this.size;
        currentPoly = [];
      } else if (node[0] == 'M'){
        pointCoord[0] = node[1] * this.size;
        pointCoord[1] = node[2] * this.size;
        currentPoly = [];
      } else if (node == 'z'){
        currentPoly.push([...pointCoord]);
        poly.push(currentPoly);
      } else {
        currentPoly.push([...pointCoord]);
        pointCoord[0] += node[0] * this.size;
        pointCoord[1] += node[1] * this.size;
      }
    }

    return poly;
  };

  this.preload = function(){
    let self = this;
    this.data = loadTable(
      './data/population expansion 1960-2018/population_csv.csv', 'csv','header',
      function(){
        self.loaded = true
      });
  };

  this.setup = function(){
    for (let i = 0; i < country.length; i++){
      countryPolygons.push(this.convertPathToPoly(country[i].vertexPoint))
    };
    
  };

  this.draw = function (){
    push();
    translate(0,0)
    stroke(255);
    strokeWeight(1);
    for(let i = 0; i < countryPolygons.length; i++){
      fill(100);
      for(const poly of countryPolygons[i]){
        beginShape();
        for(const vert of poly){
          vertex(...vert);
        }
        endShape()
      }
    }
    
    pop();
  }
}
