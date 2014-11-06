#pixi-nativeGLline

A library that uses native GL_LINES for drawing 1px graphics lines in pixi.js.

##Usage
Load this libary after pixi.js and draw lines of 1px of width.

Ex:
```
var renderer = PIXI.autoDetectRenderer(
	window.innerWidth, 
	window.innerHeight, 
	{antialias: true, transparent: true});

document.body.appendChild(renderer.view);

var stage = new PIXI.Stage;

this.graphics = new PIXI.Graphics();
this.graphics.lineStyle(1, 0xFFFFFF );

this.graphics.moveTo(0,0);

this.graphics.lineTo(1000, 1000);

stage.addChild(this.graphics);
```


##Benchmark
250k lines at 60FPS in a Intel 4600. With 0.1ms (0.0001s) of coputing time in CPU.

##Drawbacks
A 1px width lines, always are of 1px width. Independent of scale.

##Why only 1px?

Because browsers only implement 1px line width with GL_LINES. More information in: [Google groups discussion](https://code.google.com/p/angleproject/issues/detail?id=119)


Thank [M3nace](http://www.html5gamedevs.com/user/11398-m3nace/) and [Eugenius](http://www.html5gamedevs.com/user/7936-eugenius/) for the help.
