let canvas = document.getElementById("draw");
let context = canvas.getContext("2d");

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

function sumPoints(s, a){
	return [s[0]+a[0],s[1]+a[1], s[2]+a[2]];
}

function divide(b){
	return function(a){
		return a/b;
	};
}

function average(points){
	return points.reduce(sumPoints).map(divide(points.length));
}

class Axes{
	constructor(x, y, z){
		this.mat = [x,y,z];
	}

	apply(point){
		var newpoint = [0, 0];
		for(var i=0; i<3; i++){
			for(var j=0; j<2; j++){
				newpoint[j] += point[i]*this.mat[i][j];
			}
		}
		return newpoint;
	}
}

class mat4{
	constructor(arr){
	  if(arr === undefined){
	    arr = [	[1,0,0,0],
					    [0,1,0,0],
					    [0,0,1,0],
					    [0,0,0,1] ];
	  }
		this.mat = arr;
	}

	multiply(mat){
		var newmat = new mat4();
		for(var i=0; i<4;i++){
			for(var j=0; j<4; j++){
			  newmat.mat[i][j] = 0;
			  for(var k=0; k<4; k++){
    		  newmat.mat[i][j] += this.mat[i][k]*mat.mat[k][j];
			  }
			}
		}
		return newmat;
	}

	apply(point){
		var newpoint = [0,0,0];
		for(var i=0; i<3; i++){
			for(var j=0; j<3; j++){
				newpoint[j] += point[i]*this.mat[i][j];
			}
		}
		return newpoint;
	}
}

class Line{
	constructor(point1, point2, color){
	  if(color === undefined){
	    color = "#000";
	  }
	  this.color = color;
		this.points = [point1, point2];
		this.center = average(this.points);

		this.dist = 0;//distance from camera, stored in this object
	}

	draw(matrix, axes, center, context){
		var newpoints = [];
		for(var i=0; i<this.points.length; i++){
			newpoints[i] = axes.apply(matrix.apply(this.points[i]));
		}
		
		context.beginPath();
		context.moveTo(newpoints[0][0]+center[0], newpoints[0][1]+center[1]);
		context.lineTo(newpoints[1][0]+center[0], newpoints[1][1]+center[1]);
    context.strokeStyle = this.color;
		context.stroke();
	}
}

//Shape
class Shape{
	constructor(points, fill){
		if(fill === undefined){
			fill = "rgba(0,0,0,0)";
		}
		this.points = points;
		this.fill = fill;
		this.center = average(this.points);
	}

	draw(matrix, axes, center, context){
		var curPoint = axes.apply(matrix.apply(this.points[0]));
		context.beginPath();
		context.moveTo(curPoint[0]+center[0], curPoint[1]+center[1]);
		for(var i=1; i<this.points.length; i++){
			curPoint = axes.apply(matrix.apply(this.points[i]))
			context.lineTo(curPoint[0]+center[0], curPoint[1]+center[1]);
		}
		context.fillStyle = this.fill;
		context.strokeStyle = "#000";
		context.closePath();
		context.fill();
		context.stroke();
	}
}


class World{
	constructor(axes){//three points which represent the axes
		this.axes = axes;
		this.objects = [];
	}
	
	addObject(o){
		this.objects.push(o);
	}
}

function objectDistComparison(a,b){
  return a.dist > b.dist;
}


var rotationMatrix = new mat4();

var ascensionMatrix = new mat4();


function drawWorld(world, rotation, ascension, distance, strokeWidth){
	var rCos = Math.cos(rotation);
	var rSin = Math.sin(rotation);

	rotationMatrix.mat[0][0] =  rCos;
	rotationMatrix.mat[0][2] =  rSin;
	rotationMatrix.mat[2][0] = -rSin;
	rotationMatrix.mat[2][2] =  rCos;

	var aCos = Math.cos(ascension);
	var aSin = Math.sin(ascension);

	ascensionMatrix.mat[1][1] =  aCos;
	ascensionMatrix.mat[1][2] =  aSin;
	ascensionMatrix.mat[2][1] = -aSin;
	ascensionMatrix.mat[2][2] =  aCos;

  var combinedMatrix = rotationMatrix.multiply(ascensionMatrix);

  for(var i=0; i<w.objects.length; i++){
    w.objects[i].dist = combinedMatrix.apply(w.objects[i].center)[2];
  }

  w.objects = w.objects.sort(objectDistComparison);

	var center = [canvas.width/2, canvas.height/2];

	context.strokeWidth = strokeWidth;
	context.strokeStyle = "black";

	for(var i=0; i<world.objects.length; i++){
		world.objects[i].draw(combinedMatrix, world.axes, center, context);
	}
}

var w = new World(new Axes([1,0], [0,-1], [0,0]));
var rot = 0;
var asc = 0;
var ROTSPEED = Math.PI/128;

var dist = 0;
var keyReg = new KeyRegister();

function loop(){
  context.clearRect(0,0,canvas.width,canvas.height);
	drawWorld(w, rot, asc, dist, 3);

	keyReg.keyTick();

	alert("Tick");
	
	requestAnimationFrame(loop);
}

function main(){
	w.addObject(new Shape([[-100,-100,-100], [-100,-100,100], [-100,100,100], [-100,100,-100]]));
	w.addObject(new Shape([[-100,-100,-100], [100,-100,-100], [100,100,-100], [-100,100,-100]],"#fff"));
	w.addObject(new Shape([[-100,-100,-100], [100,-100,-100], [100,-100,100], [-100,-100,100]],"#fff"));

	w.addObject(new Shape([[100,-100,-100], [100,-100,100], [100,100,100], [100,100,-100]]));
	w.addObject(new Shape([[-100,-100,100], [100,-100,100], [100,100,100], [-100,100,100]],"#fff"));
	w.addObject(new Shape([[-100,100,-100], [100,100,-100], [100,100,100], [-100,100,100]],"#fff"));

	w.addObject(new Shape([[-100,-300,-100], [-100,-300,100], [-100,-100,100], [-100,-100,-100]],"#fff"));
	w.addObject(new Shape([[100,-300,-100], [100,-300,100], [100,-100,100], [100,-100,-100]],"#fff"));
	
	keyReg.registerKeyPress(buttonMove.hold, 65, function(){rot+=ROTSPEED;});
	keyReg.registerKeyPress(buttonMove.hold, 68, function(){rot-=ROTSPEED;});

	keyReg.registerKeyPress(buttonMove.hold, 87, function(){asc-=ROTSPEED;});
	keyReg.registerKeyPress(buttonMove.hold, 83, function(){asc+=ROTSPEED;});
	
	keyReg.engage();

	loop();
}

main();
