PIXI.WebGLGraphics.buildPolygonLine = PIXI.WebGLGraphics.buildLine;

PIXI.WebGLGraphics.buildLine = function(graphicsData, webGLData) {
	if (graphicsData.lineWidth === 1) {
		webGLData.drawNativeLine = true;
		PIXI.WebGLGraphics.buildNativeLine(graphicsData, webGLData);
	} else {
		webGLData.drawNativeLine = false;
		PIXI.WebGLGraphics.buildPolygonLine(graphicsData, webGLData);
	}
};

PIXI.WebGLGraphics.buildNativeLine = function(graphicsData, webGLData) {

	var i = 0;
	var points = graphicsData.points;

	if (points.length === 0) return;

	var verts = webGLData.points;
	//var indices = webGLData.indices;
	var length = points.length / 2;
	var indexCount = points.length;
	var indexStart = verts.length / 6;

	// sort color
	var color = PIXI.hex2rgb(graphicsData.lineColor);
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

PIXI.WebGLGraphics.renderGraphics = function(graphics, renderSession) //projection, offset)
{
	var gl = renderSession.gl;
	var projection = renderSession.projection,
		offset = renderSession.offset,
		shader = renderSession.shaderManager.primitiveShader,
		webGLData;
	if (graphics.dirty) {
		PIXI.WebGLGraphics.updateGraphics(graphics, gl);
	}
	var webGL = graphics._webGL[gl.id];
	for (var i = 0; i < webGL.data.length; i++) {
		webGLData = webGL.data[i];

		if (webGL.data[i].mode === 1) {
			renderSession.stencilManager.pushStencil(graphics, webGLData, renderSession);

			gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, (webGLData.indices.length - 4) * 2);
			renderSession.stencilManager.popStencil(graphics, webGLData, renderSession);
		} else {
			renderSession.shaderManager.setShader(shader);
			shader = renderSession.shaderManager.primitiveShader;
			gl.uniformMatrix3fv(shader.translationMatrix, false, graphics.worldTransform.toArray(true));
			gl.uniform1f(shader.flipY, 1);
			gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
			gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);
			gl.uniform3fv(shader.tintColor, PIXI.hex2rgb(graphics.tint));
			gl.uniform1f(shader.alpha, graphics.worldAlpha);
			gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);
			gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
			gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, false, 4 * 6, 2 * 4);

			if (webGLData.drawNativeLine)
				gl.drawArrays(gl.LINES, 0, webGLData.points.length / 6);
			else {
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
				gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0);
			}
		}
	}
};
