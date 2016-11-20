#pixi-nativeGLline

## This library is not working right now. The new ES6 way of PixiV4 makes harder to make an external patch. If someone what to help in that point to reapply the patch, a pull request or hint is welcome! 

# If you want this feature in offical PIXI library, support this pull request! https://github.com/pixijs/pixi.js/pull/3328

A library that uses native GL_LINES for drawing 1px graphics lines in pixi.js.

##Usage
require this library and draw lines of 1px of width.

Requires Pixi.js 4;

It uses the node style for requiring internally PIXI, then better use with browserify or similar. Anyway, you can allways put in the middle of the babel compilation step.

`npm install DavidBM/pixi-nativeGLline.git --save`

Fur using the patch, just require / import the file after importing pixi.js.

You can see a working example executing this two commands:

`npm install`
and
`npm run compile`

And now open in the browser the file `example/example.html`

Ex:

``` javascript

require('pixi.js-native-gl_line');

var renderer = PIXI.autoDetectRenderer(
	window.innerWidth,
	window.innerHeight,
	{antialias: true, transparent: false});

document.body.appendChild(renderer.view);

var stage = new PIXI.Container();

this.graphics = new PIXI.Graphics();
this.graphics.lineStyle(1, 0xFFFFFF );

this.graphics.moveTo(0,0);

this.graphics.lineTo(1000, 1000);

stage.addChild(this.graphics);

renderer.render(stage);

```


##Benchmark
250k lines at 60FPS in a Intel 4600. With 0.1ms (0.0001s) of coputing time in CPU.

##Drawbacks
A 1px width lines, always are of 1px width. Independent of scale.

##Why only 1px?

Because browsers only implement 1px line width with GL_LINES. More information in: [Google groups discussion](https://code.google.com/p/angleproject/issues/detail?id=119)


Thank [M3nace](http://www.html5gamedevs.com/user/11398-m3nace/) and [Eugenius](http://www.html5gamedevs.com/user/7936-eugenius/) for the help.
