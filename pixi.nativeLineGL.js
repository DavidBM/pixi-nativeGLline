var PIXI = require('pixi.js');

PIXI.GraphicsRenderer.prototype.buildPolygonLine = PIXI.GraphicsRenderer.prototype.buildLine;

PIXI.GraphicsRenderer.prototype.buildLine = function(graphicsData, webGLData) {
	if (graphicsData.lineWidth === 1) {
		webGLData.drawNativeLine = true;
		this.buildNativeLine(graphicsData, webGLData);
	} else {
		webGLData.drawNativeLine = false;
		this.buildPolygonLine(graphicsData, webGLData);
	}
};

PIXI.GraphicsRenderer.prototype.buildNativeLine = function(graphicsData, webGLData) {

	var i = 0;
	var points = graphicsData.points;

	if (points.length === 0) return;

	var verts = webGLData.points;
	//var indices = webGLData.indices;
	var length = points.length / 2;
	var indexCount = points.length;
	var indexStart = verts.length / 6;

	// sort color
	var color = PIXI.utils.hex2rgb(graphicsData.lineColor);
	var alpha = graphicsData.lineAlpha;
	var r = color[0] * alpha;
	var g = color[1] * alpha;
	var b = color[2] * alpha;

	var p1x, p1y, p2x, p2y;

	for (i = 1; i < length; i++) {
		p1x = points[(i - 1) * 2];
		p1y = points[(i - 1) * 2 + 1];

		p2x = points[i * 2];
		p2y = points[i * 2 + 1];

		verts.push(p1x, p1y);
		verts.push(r, g, b, alpha);

		verts.push(p2x, p2y);
		verts.push(r, g, b, alpha);
	}
};

PIXI.GraphicsRenderer._oldRender = PIXI.GraphicsRenderer.prototype.render;

PIXI.GraphicsRenderer.prototype.render = function render(graphics) {
	const renderer = this.renderer;
	const gl = renderer.gl;

	let webGLData;
	let webGL = graphics._webGL[this.CONTEXT_UID];

	if (!webGL || graphics.dirty !== webGL.dirty)
	{
		this.updateGraphics(graphics);

		webGL = graphics._webGL[this.CONTEXT_UID];
	}

	// This  could be speeded up for sure!
	const shader = this.primitiveShader;

	renderer.bindShader(shader);
	renderer.state.setBlendMode(graphics.blendMode);

	for (let i = 0, n = webGL.data.length; i < n; i++)
	{
		webGLData = webGL.data[i];
		const shaderTemp = webGLData.shader;

		renderer.bindShader(shaderTemp);
		shaderTemp.uniforms.translationMatrix = graphics.transform.worldTransform.toArray(true);
		shaderTemp.uniforms.tint = PIXI.utils.hex2rgb(graphics.tint);
		shaderTemp.uniforms.alpha = graphics.worldAlpha;

		if (webGLData.drawNativeLine)
			gl.drawArrays(gl.LINES, 0, webGLData.points.length / 6);
		else{
			webGLData.vao.bind()
			.draw(gl.TRIANGLE_STRIP, webGLData.indices.length)
			.unbind();
		}
	}
};
