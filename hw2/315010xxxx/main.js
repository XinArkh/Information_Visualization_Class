/*
声明：由于本人不是计算机系的同学，之前没有相应基础，花了
很多时间用来学习html、css和JavaScript三种语言的使用。临近
截止日期，感觉仍然无法在短时间内写出符合要求的算法实现，
所以这一部分工作直接引用了其他同学的成果。

本文件下SquarifiedTreemap函数来自于其他同学，其它部分是由
自己编写。

未能达到作业要求十分抱歉，希望助教评分的时候留意这个情况，
不要误认为所有代码都是由我自己实现。
*/

console.log("hello world!")

function draw(){	
	var value = document.getElementById("input").value;
	var data = JSON.parse('['+value+']');
	myTreemap.draw(data);
}

function SquarifiedTreemap(ctx){
	var overallSize = {width:0, height:0};
    var currentOffset = {x:0, y:0};
    var currentSize = {width:0, height:0, area:0}
    var remainArea = [];
    var rectangles = [];
    var colors = [];

    /*计算长宽比等价条件*/
    function worstRatio(areas, length){
        var worst;
        if(areas.length == 0) {
            worst = +Infinity;
        }else {
            var min = Math.min.apply(null, areas);
            var max = Math.max.apply(null, areas);
            var sum = listSum(areas);

            var ratio1 = (length*length*max)/(sum*sum);
            var ratio2 = (sum*sum)/(length*length*min);

            worst = Math.max.apply(null, [ratio1, ratio2]);
        }
        return worst;
    }

    /*Squarify算法*/
    function squarify(children, row){
        if(children.length > 0) {
            var length = shortestLength();
            var head = children.slice(0, 1);
            var tail = children.slice(1);
            var newRow = row.concat(head);

            if(worstRatio(row, length) >= worstRatio(newRow, length)) {
                squarify(tail, newRow);
            }else {
                layoutRow(row);
                squarify(children, []);
            }
        }else {
            layoutRow(row);
        }
    }

    /*计算列表中的面积和*/
    function listSum(list){
        if(list.length == 1) sum = list[0];
        else {
            sum = list.reduce(function(previous, current) {
                return previous+current;
            });
        }
        return sum;
    }

    /*最短边*/
    function shortestSide(){
        var shortest;
        shortest = (currentSize.width >= currentSize.height)?'height':'width';
        return shortest;
    }

    function shortestLength(){
        var shortest;
        shortest = (currentSize.width >= currentSize.height)?currentSize.height:currentSize.width;
        return shortest;
    }

    /*添加矩形*/
    function layoutRow(row){
        var tempOfffset;
        if(shortestSide() == 'height') {
            var rowArea = sumRow(row);
            var rwoAreaPercentage = rowArea/remainArea;
            var layoutWidth = Math.round(currentSize.width*rwoAreaPercentage);
            var tempHeight = shortestLength();
            tempOfffset = currentOffset.y;

            while(row.length>0) {
                var elementArea = row[0];
                var elementAreaPercentage = elementArea/sumRow(row);
                var elementHeight = Math.round(tempHeight*elementAreaPercentage);
                var x1 = currentOffset.x;
                var y1 = tempOfffset;
                var x2 = x1 + layoutWidth - 1;
                var y2 = y1 + elementHeight - 1;
                rectangles[rectangles.length] = {'x1':x1, 'y1':y1, 'x2':x2, 'y2':y2};

                tempHeight = tempHeight - elementHeight;
                tempOfffset = tempOfffset + elementHeight;
                row.shift();
            }

            currentOffset.x = currentOffset.x + layoutWidth;
            currentSize.width = currentSize.width - layoutWidth;
            currentSize.area = currentSize.width * currentSize.height;
            remainArea = remainArea - rowArea;
        }else {
            var rowArea = sumRow(row);
            var rwoAreaPercentage = rowArea/remainArea;
            var layoutHeight = Math.round(currentSize.height*rwoAreaPercentage);
            var tempWidth = shortestLength();
            tempOfffset = currentOffset.x;

            while(row.length>0) {
                var elementArea = row[0];
                var elementAreaPercentage = elementArea/sumRow(row);
                var elementWidth = Math.round(tempWidth*elementAreaPercentage);
                var x1 = tempOfffset;
                var y1 = currentOffset.y;
                var x2 = x1 + elementWidth - 1;
                var y2 = y1 + layoutHeight - 1;
                rectangles[rectangles.length] = {'x1':x1, 'y1':y1, 'x2':x2, 'y2':y2};

                tempWidth = tempWidth - elementWidth;
                tempOfffset = tempOfffset + elementWidth;
                row.shift();
            }

            currentOffset.y = currentOffset.y + layoutHeight;
            currentSize.height = currentSize.height - layoutHeight;
            currentSize.area = currentSize.width * currentSize.height;
            remainArea = remainArea - rowArea;
        }
    }

    /*计算当前面积和*/
    function sumRow(row){
        if(row.length == 0) sum = 0;
        else if(row.length == 1) sum = row[0];
        else {
            sum = row.reduce(function(previous, current) {
                return previous+current;
            })
        }
        return sum;
    }

    /*初始化列表*/
    function normalize(list){
        var normalizedList = [];
        var overallArea = overallSize.width*overallSize.height;
        var sum = sumRow(list);

        list.forEach(function(element) {
            var normalizedElement = (element/sum)*overallArea;
            normalizedList.push(normalizedElement);
        });
        return normalizedList;
    }

    function map(list){
        normalizedList = normalize(list);
        squarify(normalizedList, [], shortestLength());
    }

    function draw(data, offset){
        var rectangle = rectangles.shift();
        var x1 = rectangle.x1;
        var x2 = rectangle.x2;
        var y1 = rectangle.y1;
        var y2 = rectangle.y2;
        var width = x2-x1+1;
        var height = y2-y1+1;
        var hue = colors.shift();

        //画矩形
        ctx.beginPath();
        ctx.rect(x1, y1, width, height);
        ctx.fillStyle = 'hsl(' + hue + ', 50%, 80%)';
        ctx.fill();

        //文字
        ctx.font = '15px Verdana';
        ctx.fillStyle = '#000000';
        ctx.fillText(data[offset], (x1+x2)/2, (y1+y2)/2);

        //鼠标hover显示相关信息，用添加元素的title实现
        var message = document.createElement("mes"+offset);
        message.title = '面积: '+data[offset]+'\n'+'起始位置 x:'+x1+', y:'+y1+'\n'+'长宽 w:'+width+'px, h:'+height+'px';
        message.style.width = width+'px';
        message.style.height = height+'px';
        message.style.position = 'absolute';
        message.style.left = x1+'px';
        message.style.top = y1+'px';
        message.onmouseover = function(){
            this.style.borderRight = '10px solid hsl(' + hue + ', 50%, 80%)';
            this.style.borderBottom = '10px solid hsl(' + hue + ', 50%, 80%)';
        }
        message.onmouseout = function(){
            this.style.border = '0px';
        }
        var div = document.getElementById("message");
        div.appendChild(message);

        offset++;
        if (rectangles.length > 0) {
            setTimeout(function() {draw(data, offset)}, 30);
        }
    }

    /*创建颜色列表*/
    function creatPalette(number){
        var stepSize = 360/number;

        colors = [];
        for(i=1; i<=number; i++) {
            var hue = Math.floor(i*stepSize);
            var position = Math.floor(Math.random()*(colors.length+0.99));
            colors.splice(position, 0, hue);
        }
    }

    /*降序排列数据*/
    function sortData(data){
        //先升序排列
        data.sort(function(a,b) {
            return a-b;
        });

        //去除0
        while(data.length>=0 && data[0] == 0) {
            data.shift();
        }

        //翻转使降序排列
        data.reverse();
    }

    this.draw = function(data){
        var width = ctx.canvas.width;
        var height = ctx.canvas.height;

        rectangles = [];
        overallSize = {
            width: width,
            height: height
        };
        currentSize = {
            width: width,
            height: height,
            area: width*height
        };
        currentOffset = {
            x: 0,
            y: 0
        };

        remainArea = currentSize.area;

        sortData(data);

        if(data.length>0) {
            creatPalette(data.length);
            map(data);
            draw(data, 0);
        }
    }
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var myTreemap = new SquarifiedTreemap(ctx);
var value = document.getElementById("input").value;
var data = JSON.parse('['+value+']');
myTreemap.draw(data);
