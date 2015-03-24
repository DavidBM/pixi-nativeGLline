var PIXI = require('pixi.js');

var utils = PIXI.utils;

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
	var color = utils.hex2rgb(graphicsData.lineColor);
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


	/*for (i = 0; i < indexCount; i++) {
		indices.push(indexStart++);
	}*/

};

PIXI.GraphicsRenderer._oldRender = PIXI.GraphicsRenderer.prototype.render;

PIXI.GraphicsRenderer.prototype.render = function(graphics) {
	var renderer = this.renderer;
	var gl = renderer.gl;
	var shader = renderer.shaderManager.plugins.primitiveShader,
		webGLData;
	if (graphics.dirty) {
		this.updateGraphics(graphics, gl);
	}
	var webGL = graphics._webGL[gl.id];
	// This could be speeded up for sure!
	renderer.blendModeManager.setBlendMode(graphics.blendMode);
	// var matrix = graphics.worldTransform.clone();
	// var matrix = renderer.currentRenderTarget.projectionMatrix.clone();
	// matrix.append(graphics.worldTransform);
	for (var i = 0; i < webGL.data.length; i++) {
		if (webGL.data[i].mode === 1) {
			webGLData = webGL.data[i];
			renderer.stencilManager.pushStencil(graphics, webGLData, renderer);
			// render quad..
			gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, (webGLData.indices.length - 4) * 2);
			renderer.stencilManager.popStencil(graphics, webGLData, renderer);
		} else {
			webGLData = webGL.data[i];
			shader = renderer.shaderManager.primitiveShader;
			renderer.shaderManager.setShader(shader); //activatePrimitiveShader();
			gl.uniformMatrix3fv(shader.uniforms.translationMatrix._location, false, graphics.worldTransform.toArray(true));
			gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, renderer.currentRenderTarget.projectionMatrix.toArray(true));
			gl.uniform3fv(shader.uniforms.tint._location, utils.hex2rgb(graphics.tint));
			gl.uniform1f(shader.uniforms.alpha._location, graphics.worldAlpha);
			gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);
			gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
			gl.vertexAttribPointer(shader.attributes.aColor, 4, gl.FLOAT, false, 4 * 6, 2 * 4);

			if (webGLData.drawNativeLine)
				gl.drawArrays(gl.LINES, 0, webGLData.points.length / 6);
			else {
				// set the index buffer!
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
				gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0);
			}
		}
	}
};
