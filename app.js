// an example of using d3.queue to get data from multiple csv files

// create the svg and axis labels
var width = 300;
var height = 250;
var padding = 50;
var baseurl = "http://localhost:8080/"
var svg = d3.select("svg")
      .attr("width", width)
      .attr("height", height)
var xLabel = svg.append("text")
      .attr("x", width/2)
      .attr("y", height -10)
      .style("text-anchor", "middle")
      .text("Seed Size");
var yLabel = svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height/2)
      .attr("y", 15)
      .style("text-anchor", "middle")
      .text("Time to Germination");

// functions for combining arrays and objects
var mergeTwoObjs = function(obj1, obj2) {
            var newObj = Object.assign({}, obj1, obj2);
            return newObj;
}

var mergeTwoArraysByKey = function(array1, array2, key) {
      var newArray = [];
      array1.forEach( function(d1, i, array) {
            var matchingObj = array2.filter(d2 => d2[key] === d1[key]);
            if(matchingObj.length === 1) {
                  var newObj = mergeTwoObjs(d1,matchingObj[0]);
                  newArray.push(newObj);    
            } else {
                  throw new Error("key value not unique");
            }
      });
      return newArray;
}

var getData = function(data1, data2, data3, key) {
      var array = [data1, data2, data3];
      var newArray = array.reduce(function(accumulator, currentValue) {
            return mergeTwoArraysByKey(accumulator, currentValue, key)
      })
      return newArray;
}

// draw the plot
var updatePlot = function(data) {
      // define domain of the x and y data and range of the pixel scale
      var xScale = d3.scaleLinear()
            .domain([0,1 + +d3.max(data, d => d.size)]) // d3.extent returns the min and max values of attribute 
            .range([padding,width-padding]) //pixel space

      var yScale = d3.scaleLinear()
            .domain([0, 10])
            .range([height-padding, padding])

      // define the axis using x and y scales
      var yAxisScale = d3.axisLeft(yScale)
             .tickSizeInner(3)
             .tickPadding(10)

      var xAxisScale = d3.axisBottom(xScale)
            .tickSize(3)
            .tickPadding(5)

      // append g elements and draw axis
      var xAxis = svg.append("g").attr("transform", "translate(0, " + (height - padding) + ")")
            .call(xAxisScale)
      var yAxis = svg.append("g").attr("transform", "translate(" + (padding) + ", 0)")
            .call(yAxisScale)

      // bind data 
      var plot = svg.append("g")
            .selectAll('circle')
            .data(data)
            .enter()
            .append("circle")
                  .attr("r", 10)
                  .attr("cx", d => xScale(d.size))
                  .attr("cy", d => yScale(d['time-to-germination']))
                  .attr('class', 'circle')
                  .style('fill', d => d.color)
}

// get data from multiple csv files and call the update function.

d3.queue()
      .defer(d3.csv, baseurl + "data1.csv")
      .defer(d3.csv, baseurl + "data2.csv")
      .defer(d3.csv, baseurl + "data3.csv")
      .await(function(error, data1, data2, data3) {
      if (error) {
            throw error;
      }
      else {
            data = getData(data1, data2, data3, "seed");
            console.log(data);
            updatePlot(data)
      }
      });


