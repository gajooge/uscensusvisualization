PopmapallVis = function(_parentElement, _data,_us,_eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
	this.us = _us;
	//this.year = _year;
	this.eventHandler = _eventHandler;

    this.initVis();
}

PopmapallVis.prototype.initVis = function() {


// template http://bl.ocks.org/mbostock/4060606

//function initVis (data,us,year) {

//_data = data;
//_us = us,
//_year = year;


var width = 860;
var height = 420;


//Define default colorbrewer scheme
var colorSchemeSelect = "Oranges";
var colorScheme = colorbrewer[colorSchemeSelect]; 

//define default number of quantiles
var quantiles = 5;

this.quantize = d3.scale.quantize()
    //.domain([3, 55])
	// template	http://eyeseast.github.io/visible-data/2013/08/27/responsive-legends-with-d3/
	// can set to Oranges, Greens Blues or any other color, and category to 3-8, details seen lib/colorbrewer.js
	.range(colorScheme[quantiles]);


projection = d3.geo.albersUsa()
    .scale(900)
    .translate([width / 2, height / 2]);
	//.legend(true);

this.path = d3.geo.path()
    .projection(projection);

this.svg = d3.select("#popmapallVis").append("svg")
    .attr("width", width)
    .attr("height", height);
	
this.width = width;
this.height = height;
	
this.wrangleData(null);

this.updateVis();

}

PopmapallVis.prototype.change = function(_year) {


this.year = _year;
this.wrangleData(null);
this.updateVis();


}


PopmapallVis.prototype.wrangleData = function() {


_data = this.data;
_year = this.year;
console.log(_year);

// reserverd for filter data	
var seldata = [];


// rateById has the id, rate data from csv file
rateById = d3.map();



// Filter data according to user selection, need to have 4 dropdown menus for
// age group, year group, race group, gender group
// select age 0, year 1, whitetotal all state data--all age group data
// select age 1, year 1 all state data-- certain age group data
// select age 0, year 1, hispanic male -- certain race group data
// age group and year group is for filter
// each id, one record
// race or gender is select



// filter by year and age group first to get one record per county
function flt(value) {
  if(_year != null) {
  //return value.YEAR == Number(_year) && value.AGEGRP == 0;
  return value.YEAR == Number(_year) && value.AGEGRP == 0;
  }
  else
  {
  
   return value.YEAR == 5 && value.AGEGRP == 0;
   }

}

var flter = _data.filter(flt);


// now select only columns id and total population and push them into seldata

flter.forEach(function (d) {
					 
                               seldata.push ({
                                    id: d.id ,
									//parse in the poverty rate as number
                                    rate: Number(d.WA_FEMALE) 
                                });
     
                          })
						  
// Set the quantize domain range by getting min and max value of seldata
 this.quantize.domain([
         d3.min(seldata, function (d) {
           return Number(d.rate)
         }),
         d3.max(seldata, function (d) {
           return Number(d.rate)
         })
   ]);	
   
   
   
   debugger;
   

//d3.map(_data,function(d) { rateById.set(d.id, +d.rate); });
d3.map(seldata,function(d) { rateById.set(d.id, +d.rate); });


this.rateById = rateById;


}

PopmapallVis.prototype.updateVis = function(){

  _us = this.us;
  var quantize = this.quantize;
  var rateById = this.rateById;
  var width = this.width;
  var height = this.heigth;
  var path = this.path;
  
  // remove old graph
  this.svg.selectAll("g").transition().duration(25).remove();

  
  this.svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(topojson.feature(_us, _us.objects.counties).features)
    .enter().append("path")
	.transition()
      .attr("fill", function(d) { return quantize(rateById.get(d.id)); })
      .attr("d", path);
	  //.attr("data-legend",function(d) { return quantize(rateById.get(d.id));});


  // need to fix the path error	  
  //svg.append("path")
      //.datum(topojson.mesh(_us, _us.objects.states, function(a, b) { return a !== b; }))
      //.attr("class", "states")
      //.attr("d", path);
	  
	  
  var legend = this.svg.selectAll('g.legendEntry')
    .data(quantize.range())
    .enter()
    .append('g').attr('class', 'legendEntry');

legend
    .append('rect')
    .attr("x", width - 160)
    .attr("y", function(d, i) {
       return i * 20 + 301.5;
    })
   .attr("width", 10)
   .attr("height", 10)
   .style("stroke", "black")
   .style("stroke-width", 1)
   .style("fill", function(d){return d;}); 
       //the data objects are the fill colors

legend
    .append('text')
    .attr("x", width - 145) //leave 5 pixel space after the <rect>
    .attr("y", function(d, i) {
       return i * 20 + 300;
    })
    .attr("dy", "0.8em") //place text one line *below* the x,y point
    .text(function(d,i) {
        var extent = quantize.invertExtent(d);
        //extent will be a two-element array, format it however you want:
        var format = d3.format("0.2f");
        return format(+(extent[0]*100)) + " - " + format(+(extent[1]*100)) + " % ";
    });
    



d3.select(self.frameElement).style("height", height + "px");
}