// Example adapted from Mike Bostock: https://bl.ocks.org/mbostock/3885304
// Modified to work with d3.v5

// some margins for our graph (so it fits our SVG viewport nicely)
var margin = {
    top: 20,
    right: 80,
    bottom: 20,
    left: 80
};

var windowWidth = (window.innerHeight>1440) ? window.innerHeight: 1440;
var windowHeight = (window.innerHeight>790) ? window.innerHeight: 790;
var ImgSize = 50;
var newImgSize = 96;
var rowNum = 10;
var colNum = 75;
var fullArray = {};

console.log(window.innerHeight)
// create our SVG canvas and give it the height and width we want
var svg = d3.select('body').append('svg')
    .attr('width', windowWidth-2* margin.right)
    .attr('height', windowHeight)
    .attr("transform", "translate(80,0)");
// console.log( compendium.analyse('Hello world :)') );

// height and width of our chart
// var width = windowWidth - margin.left - margin.right;
// var height = windowHeight - margin.top - margin.bottom;

// x and y scales, the input domain is our data and the output range
// is a position value within the visualization's viewport
// var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
// var y = d3.scaleLinear().rangeRound([height, 0]);
var tooltip = d3.select("body").append("div").attr("class", "toolTip");

// define a group for our visualization
// this is good practice (to keep things clustered into their relevant groups),
// and lets you manipulate the entire group
// var g = svg.append('g')
//     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

function gridData(numberArray, ImgSize, colNum, rowNum) {
    var data = [];
    var click = 0;
    var id = 1;
    var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
    var ypos = 1;
    // iterate for rows
    for (var row = 0; row < rowNum; row++) {
        //create a 2d array
        data[row] = [];
        // iterate for cells/columns inside rows
        for (var column = 0; column < colNum; column++) {
            data[row].push({
                x: xpos,
                y: ypos,
                width: ImgSize,
                height: ImgSize,
                id: numberArray[id-1],
                click: click
            })
            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += ImgSize;
            id ++;
        }
        // reset the x position after a row is complete
        xpos = 1;
        ypos += ImgSize;
    }
    return data;
}

//display scroll bar
function scrollBar(cols){
    var shift;
    var svg = d3.select("svg");
    if(svg.select("#sBar").empty()) {
        var sBar = svg.append("g")
                .attr("id", "sBar");
        sBar
            .append("rect")
            .attr("fill", "transparent")
            .transition()
            .duration(1000)
            .attr("fill", "rgba(0, 0, 0, 0.5)")
            .attr("x", 400)
            .attr("y", 570)
            .attr("height", 10)
            .attr("width", 400)


        sBar
            .append("image")
            .attr("x", 408)
            .attr("y", 560)
            .attr("width", 30)
            .attr("height", 30)
            .attr("id", "pokeball")
            .attr("xlink:href", "./pokeBall.png")
            .attr("pointer-events", "all")
            .attr("cursor", "pointer")
            .call(d3.drag().on("drag", drag));

        //scroll bar callback function
        function drag () {
            var x = parseInt(d3.select(this).attr("x")),
                nx = x + d3.event.dx;

            if ( nx < 408 || nx > 760) return;
            d3.select(this).attr("x", nx);
            if(cols == colNum)
                shift = d3.scaleLinear()
                    .domain([408,760])
                    .range([0,-2700]);
            else
                shift = d3.scaleLinear()
                    .domain([408,760])
                    .range([0, - cols*newImgSize + 800]);

            d3.select("#iconG")
                .transition()
                .attr("transform", "translate("+shift(nx)+",0)");
        }
    }
}

// Principle Component Analysis on Pokemons
function rightArrow(categories){

    //remove old arrows if any exists.
    d3.select("#arrows").remove();

    //create new ones.
    var arrows = d3.select("svg")
            .append("g")
            .attr("id", "arrows");

    arrows
        .append("image")
        .attr("x", 1180)
        .attr("y", 560)
        .attr("width", 100)
        .attr("height", 100)
        .attr("id", "rightArrow")
        .attr("xlink:href", "./rArrow.gif")
        .attr("cursor", "pointer")
        .on("mouseover", function(){
            tooltip
                .style("left", 1270+ "px")
                .style("top", 650 + "px")
                .style("display", "inline-block")
                .style("background", "transparent")
                .html("MORE INFO");
        })
        .on("mouseout", function(){
            tooltip
                .style("display", "none");
        })
        .on("click", function(){
            return clicked(1)
    });

    arrows
        .append("image")
        .attr("display", "none")
        .attr("x", 80)
        .attr("y", 560)
        .attr("width", 100)
        .attr("height", 100)
        .attr("id", "leftArrow")
        .attr("xlink:href", "./lArrow.gif")
        .attr("cursor", "pointer")
        .on("click", function(){
            return clicked(0)
        });


    function clicked(direction){


        d3.select("#rightArrow")
            .attr("display", "none");
        d3.select("#leftArrow")
            .attr("display", "block");

        //hide categoryies
        d3.select("#cateG")
            .attr("display", "none");

        //hide the scroll bar
        d3.select("#sBar")
            .attr("display", "none");
        //click right arrow will shift current icons to right and create a new g for plots.
        if(direction == 1) {

            if(d3.select("#pcag").empty()){
                boxPlot(categories, 0);
                d3.select("#pcag")
                    .attr("transform", "translate(6000,0)");
            }

            d3.select("form")
                .style("display","block");

            var index=0;
            d3.select("form")
                .on("change",function(d){
                    var buttons = document.getElementById("dimensions");
                    var form_val;
                    for(i =0; i<6; i++){
                        if(buttons[i].checked){
                            console.log(buttons[i].id)
                            index = buttons[i].id
                        }
                    }
                    d3.select("#pcag").remove();
                    if(d3.select("#pcag").empty()){
                        boxPlot(categories, index);
                        d3.select("#pcag")
                            .attr("transform", "translate(100,100)");
                    }
                });
            // if(d3.select("#pcag").empty()){
            //     boxPlot(categories);
            //     d3.select("#pcag")
            //         .attr("transform", "translate(6000,0)");
            // }

            d3.select("#iconG")
                .transition()
                .duration(1500)
                .attr("transform", "translate(-5000,0)");

            d3.select("#pcag")
                .transition()
                .duration(1500)
                .attr("transform", "translate(100, 100)");


        }

        //click left arrow will go back to icons
        else if(direction == 0) {
            d3.select("#pcag")
                .transition()
                .duration(1500)
                .attr("transform", "translate(2000,0)");

            d3.select("#iconG")
                .transition()
                .duration(1500)
                .attr("transform", "translate(0, 0)");

           d3.select("#rightArrow")
                .attr("display", "block");

            d3.select("#leftArrow")
                .attr("display", "none");


            //reset the scroll bar
            d3.select("#pokeball")
                .attr("x", 408);

            d3.select("#sBar")
                .transition()
                .delay(1500)
                .attr("display", "block");

            d3.select("#cateG")
                .transition()
                .delay(1500)
                .attr("display", "block");

            d3.select("form")
                .style("display","none");



        }
    }

}

function boxPlot(categories, index){

    var pcag_width =900;
    var height = 400;
    var barWidth = 30;
    var yDomain = 160;

    var pcag = d3.select("svg")
        .append("g")
        .attr("id", "pcag")
        .attr("width", pcag_width)
        .attr("height", height);

    console.log(categories);



    var groupCounts = {};

    for(i=0; i<18; i++) {
        var key = i.toString();
        groupCounts[key] = [];
        for(let j=0; j<categories[i].values.length; j++) {
            if(index == 0)
                groupCounts[key].push(categories[i].values[j].HP);
            if(index == 1)
                groupCounts[key].push(categories[i].values[j].Attack);
            if(index == 2){
                yDomain = 250;
                groupCounts[key].push(categories[i].values[j].Defense);
            }
            if(index == 3)
                groupCounts[key].push(categories[i].values[j].Sp_Atk);
            if(index == 4){
                yDomain = 250;
                groupCounts[key].push(categories[i].values[j].Sp_Def);
            }
            if(index == 5)
                groupCounts[key].push(categories[i].values[j].Speed);
        }
    }
    // Sort group counts so quantile methods work
    for(var key in groupCounts) {
        var groupCount = groupCounts[key];
        groupCounts[key] = groupCount.sort(sortNumber);
    }

    // Setup a color scale for filling each box
    var colorScale = d3.scaleOrdinal(d3.schemeCategory20)
        .domain(Object.keys(groupCounts));

    // Prepare the data for the box plots
    var boxPlotData = [];
    for (var [key, groupCount] of Object.entries(groupCounts)) {

        var record = {};
        var outliers = [];
        var quartiles = boxQuartiles(groupCount);
        //find outliers
        var max = quartiles[2] + 1.5*(quartiles[2]-quartiles[0]);
        var min =quartiles[0] - 1.5*(quartiles[2]-quartiles[0]);
        for(var itr in groupCount){
            if(groupCount[itr] < min  || groupCount[itr] > max){
                outliers.push(groupCount[itr]);
                // groupCount.splice(itr, 1);
                // itr--;
            }
        }
        groupCount = groupCount.filter(function(value){

            return value > min && value < max;

        });

        var localMin = d3.min(groupCount);
        var localMax = d3.max(groupCount);

        record["key"] = key;
        record["type"] = categories[key].key;
        record["values"] = groupCount;
        record["quartile"] = quartiles;
        record["whiskers"] = [localMin, localMax];
        record["outliers"] = outliers;
        record["color"] = colorScale(key);
        boxPlotData.push(record);
    }

    xLabel = [];
    for( i in categories){
        xLabel.push(categories[i].key)
    }
    // Compute an ordinal xScale for the keys in boxPlotData
    var labelX = d3.scalePoint()
        .domain(xLabel)
        .rangeRound([0, pcag_width])
        .padding([0.5]);

    var xScale = d3.scalePoint()
        .domain(Object.keys(groupCounts))
        .rangeRound([0, pcag_width])
        .padding([0.5]);

    // Compute a global y scale based on the global counts
    // var min = 0;
    // var max = 160;
    var yScale = d3.scaleLinear()
        .domain([-10, yDomain])
        .range([height, 0]);

    // Setup the svg and group we will draw the box plot in
    // var svg = d3.select("body").append("svg")
    //     .attr("width", totalWidth)
    //     .attr("height", totalheight)
    //     .append("g")
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    pcag.append("rect")
        .attr("id", "background")
        .attr("fill", "url(#llg)")
        .attr("opacity", 0.5)
        .attr("x", -80)
        .attr("y", -150)
        .attr("height", 600)
        .attr("width", 1100);



    // Move the left axis over 25 pixels, and the top axis over 35 pixels
    var axisG = pcag.append("g")
        .attr("transform", "translate(0,-50)");

    var axisBotG = pcag.append("g")
        .attr("transform", "translate(10,350)");

    // Setup the group the box plot elements will render in
    var g = pcag.append("g").attr("transform", "translate(0,-50)");




    // Draw the box plot vertical lines
    g.selectAll(".verticalLines")
        .data(boxPlotData)
        .enter()
        .append("line")
        .attr("x1", function(datum) {
                return xScale(datum.key) + barWidth/2;
            }
        )
        .attr("y1", function(datum) {
                var whisker = datum.whiskers[0];
                return yScale(whisker);
            }
        )
        .attr("x2", function(datum) {
                return xScale(datum.key) + barWidth/2;
            }
        )
        .attr("y2", function(datum) {
                var whisker = datum.whiskers[1];
                return yScale(whisker);
            }
        )
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("fill", "none");

    g.selectAll("rect")
        .data(boxPlotData)
        .enter()
        .append("rect")
        .attr("width", barWidth)
        .attr("height", function(datum) {
                var quartiles = datum.quartile;
                var height = yScale(quartiles[0]) -yScale(quartiles[2]) ;
                return height;
            }
        )
        .attr("x", function(datum) {
                return xScale(datum.key);
            }
        )
        .attr("y", function(datum) {
                return yScale(datum.quartile[2]);
            }
        )
        .attr("fill", "rgba(255,152,50,0.6)")
        .attr("stroke", "#000")
        .attr("stroke-width", 1);

    g.selectAll(".outliers")
        .data(boxPlotData)
        .enter()
        .each(function(d, i) {
            if(d.outliers.length > 0){
                for(var i in d.outliers){
                    d3.select(this)
                        .append("circle")
                        .attr("cx", function(d) {
                            return xScale(d.key)+ barWidth/2;
                        })
                        .attr("cy", function(d) {
                            return yScale(d.outliers[i]);
                        })
                        .attr("r", 4)
                        .attr("fill", "#f45006")
                }
            }
        })


    // Now render all the horizontal lines at once - the whiskers and the median
    var horizontalLineConfigs = [
        // Top whisker
        {
            x1: function(datum) { return xScale(datum.key) },
            y1: function(datum) { return yScale(datum.whiskers[0]) },
            x2: function(datum) { return xScale(datum.key) + barWidth },
            y2: function(datum) { return yScale(datum.whiskers[0]) }
        },
        // Median line
        {
            x1: function(datum) { return xScale(datum.key) },
            y1: function(datum) { return yScale(datum.quartile[1]) },
            x2: function(datum) { return xScale(datum.key) + barWidth },
            y2: function(datum) { return yScale(datum.quartile[1]) }
        },
        // Bottom whisker
        {
            x1: function(datum) { return xScale(datum.key) },
            y1: function(datum) { return yScale(datum.whiskers[1]) },
            x2: function(datum) { return xScale(datum.key) + barWidth },
            y2: function(datum) { return yScale(datum.whiskers[1]) }
        }
    ];

    for(var i=0; i < horizontalLineConfigs.length; i++) {
        var lineConfig = horizontalLineConfigs[i];

        // Draw the whiskers at the min for this series
        g.selectAll(".whiskers")
            .data(boxPlotData)
            .enter()
            .append("line")
            .attr("x1", lineConfig.x1)
            .attr("y1", lineConfig.y1)
            .attr("x2", lineConfig.x2)
            .attr("y2", lineConfig.y2)
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("fill", "none");
    }

    var axisLeft = d3.axisLeft(yScale);
    axisG.append("g")
        .call(axisLeft);

    var axisBot = d3.axisBottom(labelX);
    axisBotG.append("g")
        .call(axisBot);

    function boxQuartiles(d) {
        return [
            d3.quantile(d, .25),
            d3.quantile(d, .5),
            d3.quantile(d, .75)
        ];
    }

    function sortNumber(a,b) {
        return a - b;
    }
}

// render primary view
function renderAll(fullNumBerarray, data){
    svg.selectAll("#iconG")
        .remove();

    //show all rows in svg
    var iconG = svg.append("g")
        .attr("id", "iconG");

    var grid = iconG
        .selectAll(".row")
        .data(gridData(fullNumBerarray, ImgSize, colNum, rowNum))
        .enter().append("g")
        .attr("class", "row")
        .attr('transform', 'translate(0,' + margin.top + ')');

    //show all imgs in rows
    grid.selectAll(".square")
        .data(function(d) { return d; })
        .enter()
        .each(function(d, i) {
            if(d.id){
                d3.select(this)

                    .append("image")
                    .attr("x", function(d) { return d.x; })
                    .attr("y", function(d) { return d.y; })
                    .attr("width", function(d) { return d.width; })
                    .attr("height", function(d) { return d.height; })
                    .attr("id", function(d){return d.id})
                    .attr("xlink:href", function(d) {
                        return "./pokemon-icons/"+ d.id + ".png";
                    })
            }
        });

    //show Img border for each Img
    grid.selectAll(".square")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("cursor", "pointer")
        .each(function(d, i) {
            if(d.id <= count){
                d3.select(this)
                    .attr("class", 'image_border')
                    .attr("x", function(d) { return d.x; })
                    .attr("y", function(d) { return d.y; })
                    .attr("width", ImgSize)
                    .attr("height", ImgSize)
                    .attr("id", function(d){return d.id})
                    .attr("fill", "#79CAF9")
                    .transition()
                    .duration(100*i)
                    .attr("fill","transparent")
                    // .attr("opacity", "0.6")
                    .attr("stroke", "#222222")
            }
        })
        .on("mousemove", function(d) {
            // d3.select(this)
            //     .attr("transform", function(d) { return "translate("+500+","+500+")"; });
            tooltip
                .style("left", d3.event.pageX - 20 + "px")
                .style("top", d3.event.pageY + 30 + "px")
                .style("display", "inline-block")
                .style("background", "rgba(255,255,255,0.5)")
                .html(data[d.id -1].Name);
            // d3.select("#" + d.)
        })
        .on("mouseout", function(d) {
            tooltip.style("display", "none");
        })
        .on("click", function(d,i){
            hexagonStats(i, data[d.id -1])
        });

    scrollBar(colNum);
}

function scrollToElement(element) {
    var offsetTop = window.pageYOffset || document.documentElement.scrollTop
    d3.transition()
        .duration(1000)
        .ease(d3.easeCubic)
        .tween("scroll", (offset => () => {
            var i = d3.interpolateNumber(offsetTop, offset);
            return t => scrollTo(0, i(t))
        })(offsetTop + element.node().getBoundingClientRect().top));
}

function setGradient(svg){
    //background rect color
    var linearGradient = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", "llg");

    linearGradient.append("stop")
        .attr("offset", "30%")
        .attr("stop-color", "rgba(138, 219 ,255, 1)");

    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(255, 255 ,255, 0)");

    //outer hexagon color
    var radialGradient = svg.select("defs")
        .append("radialGradient")
        .attr("id", "radial-gradient");

    radialGradient.append("stop")
        .attr("offset", "20%")
        .attr("stop-color", "#3873ff");

    radialGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#d6d6d6");

    //inner hexagon color
    var sRadialGradient = svg.select("defs")
        .append("radialGradient")
        .attr("id", "innerSrg1");

    sRadialGradient.append("stop")
        .attr("offset", "30%")
        .attr("stop-color", "#f46005");

    sRadialGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#fffafa");

    //status rows color(light blue and dark blue)
    var linearGradient2 = svg
        .select("defs")
        .append("linearGradient")
        .attr("id", "llg2");

    linearGradient2.append("stop")
        .attr("offset", "20%")
        .attr("stop-color", "rgba(10, 158 ,255, 1)");

    linearGradient2.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(255, 255 ,255, 0)");

    var linearGradient3 = svg
        .select("defs")
        .append("linearGradient")
        .attr("id", "llg3");

    linearGradient3.append("stop")
        .attr("offset", "20%")
        .attr("stop-color", "rgba(6, 125 ,205, 1)");

    linearGradient3.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(255, 255 ,255, 0)");



}

//----draw pentagon stats.
function hexagonStats(imageNum, entry){
    var w = 400;
    var h = 400;
    var padding = 60;
    var basepts = [];
    basepts.push([0, 120]);
    basepts.push([-104, 60]);
    basepts.push([-104, -60]);
    basepts.push([0, -120]);
    basepts.push([104,-60]);
    basepts.push([104, 60]);
//scale function
    var xScale = d3.scaleLinear()
        .domain([-120,120])
        .range([padding, w-padding * 2]);

    var yScale = d3.scaleLinear()
        .domain([-120,120])
        .range([padding, w-padding * 2]);
    var timeOut = 0;

    if(d3.select("#stats").empty())
    {
        //create svg element
        var svg = d3.select("body")
            .append("svg")
            .attr("id", "stats")
            .attr("width", w * 3)
            .attr("height", h);



        //draw background rectangle with gradient color
        svg.append("rect")
            .attr("width", 1000)
            .attr("height", h)
            .attr("transform", "translate(150,50)")
            .attr("fill", "url(#llg)")
            .attr("opacity", "0.5");

        var g = svg
            .append("g")
            .attr("width", w * 2)
            .attr("height", h)
            .attr("transform", "translate(250,50)")
            .attr("id", "outerG");


        //draw 6 base dimensions
        g.selectAll("line")
            .data(basepts)
            .enter()
            .append("line")
            .attr("x1", xScale(0))
            .attr("y1", yScale(0))
            .attr("x2", function (d) {
                return xScale(d[0]);
            })
            .attr("y2", function (d) {
                return yScale(d[1]);
            })
            .attr("stroke-width", 1)
            .attr("stroke", "black");

        var dim = ["HP", "Attack", "Defense", "Sp_Atk", "Sp_Def", "Speed"];

        // label hexagon and each dimension
        g.selectAll("text")
            .data(basepts)
            .enter()
            .append("text")
            .attr("x", function (d, i) {
                if ((i != 1) && (i != 2))
                    return xScale(d[0]);
                else
                    return xScale(d[0]) - 65;
            })
            .attr("y", function (d, i) {
                if (i > 0)
                    return yScale(d[1]);
                else
                    return yScale(d[1]) + 20;
            })
            .attr("font-family", "Comic Sans MS")
            .attr("font-size", "20px")
            .attr("fill", "black")
            .html(function (d, i) {
                return dim[i]
            });


        var poly = [{"x": 0, "y": 120},
            {"x": -104, "y": 60},
            {"x": -104, "y": -60},
            {"x": 0, "y": -120},
            {"x": 104, "y": -60},
            {"x": 104, "y": 60}];


        //draw outer hexagon
        g.selectAll("polygon")
            .data([poly])
            .enter().append("polygon")
            .attr("points", function (d) {
                return d.map(function (d) {
                    return [xScale(d.x), yScale(d.y)].join(",");
                }).join(" ");
            })
            .attr("id", "outerHex")
            .style("fill", "url(#radial-gradient)")
            .attr("opacity", "0.3");

    }
    else{

        d3.select("#innerGOld")
            .remove();

        //shift svg element
        d3.select("#portraitNew")
            .transition()
            .duration(1000)
            .attr("transform", "translate(250,0)");
        d3.select("#prtText")
            .transition()
            .duration(1000)
            .attr("fill", "#c544ff");

        d3.select("#innerHex")
            .attr("stroke", "#c544ff");

        d3.selectAll("circle")
            .attr("fill", "#c544ff");


        //rename inner elements for removing later.
        d3.select("#innerGNew")
            .attr("id", "innerGOld");

        d3.select("#portraitNew")
            .attr("id", "portraitOld");

        timeOut = 600;

    }


    var stats = [entry.HP, entry.Attack, entry.Defense, entry.Sp_Atk, entry.Sp_Def, entry.Speed];
    //-------------draw inner hexagon
    var sPoly = [{"x":0, "y":entry.HP},
        {"x":-0.87*entry.Attack, "y": 0.5*entry.Attack},
        {"x":-0.87*entry.Defense, "y": -0.5*entry.Defense},
        {"x":0, "y": -entry.Sp_Atk},
        {"x":0.87*entry.Sp_Def, "y" : -0.5*entry.Sp_Def},
        {"x":0.87*entry.Speed, "y" : 0.5*entry.Speed}];

    var innerG = d3.select("#outerG")
        .append("g")
        .attr("id", "innerGNew");

    innerG.append("polygon")
        .data([sPoly])
        .attr("id", "innerHex")
        .transition()
        .duration(1000)
        .attr("points",function(d) {
            return d.map(function(d) {
                return [xScale(d.x),yScale(d.y)].join(",");
            }).join(" ");
        })
        .style("fill", "none")
        .attr("stroke", "#f45006")
        .attr("stroke-width", 2)
        .attr("opacity", "0.6");

    // draw inner hexagon points.
    innerG.selectAll("circle")
        .data(sPoly)
        .enter()
        .append("circle")
        .attr("id", function(d, i){
            return "point" + i;
        })
        .attr("cx", function(d) {
            return xScale(d.x);
        })
        .attr("cy", function(d) {
            return yScale(d.y);
        })
        .attr("r", 5)
        .attr("fill", "#f45006")
        //lalala
        .on("mouseover", function(d,i) {
            d3.select(this)
                .attr("r", 10);
            tooltip
                .style("left", d3.event.pageX - 20 + "px")
                .style("top", d3.event.pageY -30 + "px")
                .style("display", "inline-block")
                .style("background", "rgba(255,255,255,0.5)")
                .html(stats[i]);
        })
        .on("mouseout", function(d,i) {
            d3.select(this)
                .attr("r", 5);
            tooltip
                .style("display", "none");

        });

    scrollToElement(d3.select("#outerG"));


    //x axis
    // svg.append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(0,150)")
    //     .call(xAxis);
    //
    // //y axis
    // svg.append("g")
    //     .attr("class", "y axis")
    //     .attr("transform", "translate(150,0)")
    //     .call(yAxis);

    var otherStats = [];
    otherStats.push(["Legendary", entry.isLegendary]);
    otherStats.push(["Egg Group 1", entry.Egg_Group_1]);
    otherStats.push(["Height(m)", entry.Height_m]);
    otherStats.push(["Weight(kg)",  entry.Weight_kg]);
    otherStats.push(["Catch Rate", entry.Catch_Rate]);

    setTimeout(function(){
        var portrait = innerG.append('g')
            .attr("id", "portraitNew");

        portrait.selectAll("rect")
            .data(otherStats)
            .enter()
            .append("rect")
            .attr("x", 450)
            .attr("y", function (d, i) {
                return 190+ i*25;
            })
            .attr("width", 200)
            .attr("height", 25)
            .attr("fill", function (d, i) {
                if( i%2 == 0)
                    return "url(#llg2)";

                else
                    return "url(#llg3)";
            });

        portrait.selectAll("text")
            .data(otherStats)
            .enter()
            .append("text")
            .attr("x", 460)
            .attr("y", function(d, i) {
                return 210+ i*25;
            })
            .attr("font-family", "Comic Sans MS")
            .attr("font-size", "15px")
            .attr("fill", "white")
            .text(function(d) {
                return d[0] + ": " + d[1]});

        //the image in stats view and its title
        portrait.append("image")
            .attr("x", 480)
            .attr("y", 0)
            .attr("width", 150)
            .attr("height", 150)
            .attr("xlink:href", "./pokemon-icons/"+ entry.Number + ".png");

        portrait.append("text")
            .attr("id", "prtText")
            .attr("x", 520)
            .attr("y", 150)
            .attr("font-family", "Comic Sans MS")
            .attr("font-size", "20px")
            .attr("fill", "#f45006")
            .text(entry.Name);
    },timeOut);






}

// select which file you want to load in our CSV file
d3.csv('pokemon_alopez247.csv').then(function(data) {
    // we have our data in here now
    count = 0;
    //For each data entry
    //This is where you will modify the data before storing it
    data.forEach(function(datum) {
        datum.Number =+ datum.Number;
        datum.HP =+ datum.HP;
        datum.Total =+ datum.Total;
        datum.Attack =+ datum.Attack;
        datum.Defense =+ datum.Defense;
        datum.Sp_Atk =+ datum.Sp_Atk;
        datum.Sp_Def =+ datum.Sp_Def;
        datum.Speed =+ datum.Speed;
        fullArray[count] = datum.Number;
        count += 1;

    });

    var categories = d3.nest()
        .key(function(d) {return d.Type_1;})
        .sortKeys(d3.ascending)
        // .rollup(function(v) {return v.length;})
        .entries(data);

    renderAll(fullArray, data);
    setGradient(svg);
    rightArrow(categories);


    //----------------create category filters(based on its type)

    // console.log("categories-------------------------------\n");
    // console.log(JSON.stringify(categories[0].key));
    // console.log("-------------------------------\n\n");

    var y = d3.scaleLinear()
        .domain([0,7])
        .range([0,500]);
    var x = d3.scaleLinear()
        .domain([0,10])
        .range([200,1000]);

    var buttons = d3.range(categories.length + 1).map(function(d,i) {
        // console.log("i is "+i);
        if (i < 9)
            return { id: i, x: x(i+1) , y: 620 };
        else
            return { id: i, x: x(i-8) , y: 680 };


    });
    // console.log("buttons-------------------------------\n");
    // console.log(buttons);
    // console.log("-------------------------------\n\n");


    // var buttonGroup = svg.selectAll("cate")
    //     .data(buttons)
    //     .enter().append("g")
    //     .attr("class", "cate")
    //     .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; });


    // ---------------------animations when click each category button
    var cateG = svg.append("g")
            .attr("id", "cateG")
    cateG.selectAll("category")
        .data(buttons)
        .enter()
        .append("g")
        .attr("class", "category")
        .attr("transform", function(d) { return "translate("+d.x+","+d.y+")"; })
        .each(function(d,i) {
                if(i != 18)
                d3.select(this)
                    .attr("cursor", "pointer")
                    .append("image")
                    .attr("width", 60)
                    .attr("height", 60)
                    .attr("id", function(d){return "cate"+d.id})
                    .attr("xlink:href", function(d) {
                        return "./pokemon-types/"+categories[i].key.toLowerCase()+".png";
                    });
                else
                    d3.select(this)
                        .attr("cursor", "pointer")
                        .append("image")
                        .attr("width", 60)
                        .attr("height", 60)
                        .attr("id", function(d){return "cate18"})
                        .attr("xlink:href", function(d) {
                            return "./home.png";
                        })
        })
        .on("mouseover", function(d,i) {
            d3.selectAll("image[id^='cate']")
                .attr("width", 60)
                .attr("height", 60);
            d3.select("#cate" + i).transition()
                .ease(d3.easeElastic)
                .duration("500")
                .attr("width", 80)
                .attr("height", 80)


            // buttonGroup.select("#text"+ i)
            //     .style("fill", "#222");
        })
        .on("mousemove", function(d,i) {
            if(i != 18)
            tooltip
                .style("left", d3.event.pageX - 20 + "px")
                .style("top", d3.event.pageY +30 + "px")
                .style("display", "inline-block")
                .style("background", "transparent")
                .html(categories[i].key);

        })
        .on("mouseout", function(d,i) {
            d3.select("#cate" + i).transition()
                .ease(d3.easeQuad)
                .delay("100")
                .duration("200")
                .attr("width", 60)
                .attr("height", 60);
            tooltip.style("display", "none");
        })
        .on("click", function(d,i){
            // buttonGroup.select("#text"+i)
            //     .style("fill", "#40e2ff");
            d3.select("#cate" + i).transition()
                .ease(d3.easeElastic)
                .duration("500")
                .attr("width", 80)
                .attr("height", 80);
            if(i != 18){
                scrollToElement(svg);
                pokemonInCategoryTransition(i);
                // rightArrow(categories);
                // d3.select("#rightArrow")
                //     .attr("display", "none");
            }
            else{
                scrollToElement(svg);
                renderAll(fullArray,data);
                rightArrow(categories);
                // d3.select("#rightArrow")
                //     .attr("display", "block");
            }


        });



    //return a grid containing all pokemons in category @categoryName.
    function pokemonInCategoryTransition(cateIndex){

        // svg.selectAll("#sBar").remove();
        renderAll(fullArray, data);

        svg.selectAll("#sBar").remove();

        var newColNum, newRowNum;
        totalInCate = categories[cateIndex].values.length;
        newNumberArray = [];
        for(i=0; i< categories[cateIndex].values.length;  i++){
            newNumberArray[i] = categories[cateIndex].values[i].Number;
        }
        if(totalInCate < 65) {
            newColNum = 13;
            newRowNum = Math.ceil(totalInCate / newColNum);
        }
        else{
            newRowNum = 5;
            newColNum = Math.ceil(totalInCate / newRowNum);
        }
        //first step: highlight in-category ones.
        svg.selectAll(".image_border")
            // .transition()
            // .delay(1000)
            // .style("fill", "#161515")
            .each(function(d) {
                if(newNumberArray.includes(parseInt(d3.select(this).attr("id")))){
                d3.select(this)
                    .attr("fill", "transparent");
                }
            });



        //second step: clear all irrelevant imgs and borders.
        svg.selectAll("image")
                // .transition()
                // .delay(1500)
            .each(function(d) {
                if( !newNumberArray.includes(parseInt(d3.select(this).attr("id")))
                    && !d3.select(this).attr("id").includes("cate")){
                        d3.select(this)
                            // .transition()
                            // .delay(200)
                            .remove();

                    }
                });

        svg.selectAll(".image_border")
            // .transition()
            // .delay(1500)
            .each(function(d) {
                if(!newNumberArray.includes(parseInt(d3.select(this).attr("id")))){
                    d3.select(this)
                    // .transition()
                    // .delay(200)
                        .remove();

                }
            });
        // },3000);
        console.log("total num in cate is "+ newNumberArray.length);
        newdata =gridData(newNumberArray, newImgSize, newColNum, newRowNum);


        //convert @newdata into a long 1d array.
        var longNewdata = [];
        for(x = 0; x<newdata.length; x++){
            for(y=0; y<newdata[0].length; y++)
            longNewdata.push(newdata[x][y]);
        }

        //-------move selected imgs to relative position
        svg.selectAll("image")
            .each(function(d,i) {
                // the first 19 <image> are the category images. they should not move.
                if( i < newNumberArray.length+19 && i > 18 ){
                d3.select(this)
                    .transition()
                    // .delay(1000)
                    .duration(2000)
                    .attr("x", longNewdata[i-19].x)
                    .attr("y", longNewdata[i-19].y)
                    .attr("width", newImgSize)
                    .attr("height", newImgSize);
                }
            })
        svg.selectAll(".image_border")
            .each(function(d,i) {
                if( i < newNumberArray.length){
                    d3.select(this)
                        .transition()
                        // .delay(1000)
                        .duration(2000)
                        .attr("x", longNewdata[i].x)
                        .attr("y", longNewdata[i].y)
                        .attr("width", newImgSize)
                        .attr("height", newImgSize);
                }
        })
            if(newColNum > 13){
                    scrollBar(newColNum);
            }


    }

});
