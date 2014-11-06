
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

	for (i = 1; i < length; i ++) {
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

PIXI.WebGLGraphics.buildPolygonLine = function(graphicsData, webGLData) {
	// TODO OPTIMISE!
	var i = 0;
	var points = graphicsData.points;
	if (points.length === 0) return;

	// if the line width is an odd number add 0.5 to align to a whole pixel
	if (graphicsData.lineWidth % 2) {
		for (i = 0; i < points.length; i++) {
			points[i] += 0.5;
		}
	}

	// get first and last point.. figure out the middle!
	var firstPoint = new PIXI.Point(points[0], points[1]);
	var lastPoint = new PIXI.Point(points[points.length - 2], points[points.length - 1]);

	// if the first point is the last point - gonna have issues :)
	if (firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y) {
		// need to clone as we are going to slightly modify the shape..
		points = points.slice();

		points.pop();
		points.pop();

		lastPoint = new PIXI.Point(points[points.length - 2], points[points.length - 1]);

		var midPointX = lastPoint.x + (firstPoint.x - lastPoint.x) * 0.5;
		var midPointY = lastPoint.y + (firstPoint.y - lastPoint.y) * 0.5;

		points.unshift(midPointX, midPointY);
		points.push(midPointX, midPointY);
	}

	var verts = webGLData.points;
	var indices = webGLData.indices;
	var length = points.length / 2;
	var indexCount = points.length;
	var indexStart = verts.length / 6;

	// DRAW the Line
	var width = graphicsData.lineWidth / 2;

	// sort color
	var color = PIXI.hex2rgb(graphicsData.lineColor);
	var alpha = graphicsData.lineAlpha;
	var r = color[0] * alpha;
	var g = color[1] * alpha;
	var b = color[2] * alpha;

	var px, py, p1x, p1y, p2x, p2y, p3x, p3y;
	var perpx, perpy, perp2x, perp2y, perp3x, perp3y;
	var a1, b1, c1, a2, b2, c2;
	var denom, pdist, dist;

	p1x = points[0];
	p1y = points[1];

	p2x = points[2];
	p2y = points[3];

	perpx = -(p1y - p2y);
	perpy = p1x - p2x;

	dist = Math.sqrt(perpx * perpx + perpy * perpy);

	perpx /= dist;
	perpy /= dist;
	perpx *= width;
	perpy *= width;

	// start
	verts.push(p1x - perpx, p1y - perpy,
		r, g, b, alpha);

	verts.push(p1x + perpx, p1y + perpy,
		r, g, b, alpha);

	for (i = 1; i < length - 1; i++) {
		p1x = points[(i - 1) * 2];
		p1y = points[(i - 1) * 2 + 1];

		p2x = points[(i) * 2];
		p2y = points[(i) * 2 + 1];

		p3x = points[(i + 1) * 2];
		p3y = points[(i + 1) * 2 + 1];

		perpx = -(p1y - p2y);
		perpy = p1x - p2x;

		dist = Math.sqrt(perpx * perpx + perpy * perpy);
		perpx /= dist;
		perpy /= dist;
		perpx *= width;
		perpy *= width;

		perp2x = -(p2y - p3y);
		perp2y = p2x - p3x;

		dist = Math.sqrt(perp2x * perp2x + perp2y * perp2y);
		perp2x /= dist;
		perp2y /= dist;
		perp2x *= width;
		perp2y *= width;

		a1 = (-perpy + p1y) - (-perpy + p2y);
		b1 = (-perpx + p2x) - (-perpx + p1x);
		c1 = (-perpx + p1x) * (-perpy + p2y) - (-perpx + p2x) * (-perpy + p1y);
		a2 = (-perp2y + p3y) - (-perp2y + p2y);
		b2 = (-perp2x + p2x) - (-perp2x + p3x);
		c2 = (-perp2x + p3x) * (-perp2y + p2y) - (-perp2x + p2x) * (-perp2y + p3y);

		denom = a1 * b2 - a2 * b1;

		if (Math.abs(denom) < 0.1) {

			denom += 10.1;
			verts.push(p2x - perpx, p2y - perpy,
				r, g, b, alpha);

			verts.push(p2x + perpx, p2y + perpy,
				r, g, b, alpha);

			continue;
		}

		px = (b1 * c2 - b2 * c1) / denom;
		py = (a2 * c1 - a1 * c2) / denom;


		pdist = (px - p2x) * (px - p2x) + (py - p2y) + (py - p2y);


		if (pdist > 140 * 140) {
			perp3x = perpx - perp2x;
			perp3y = perpy - perp2y;

			dist = Math.sqrt(perp3x * perp3x + perp3y * perp3y);
			perp3x /= dist;
			perp3y /= dist;
			perp3x *= width;
			perp3y *= width;

			verts.push(p2x - perp3x, p2y - perp3y);
			verts.push(r, g, b, alpha);

			verts.push(p2x + perp3x, p2y + perp3y);
			verts.push(r, g, b, alpha);

			verts.push(p2x - perp3x, p2y - perp3y);
			verts.push(r, g, b, alpha);

			indexCount++;
		} else {

			verts.push(px, py);
			verts.push(r, g, b, alpha);

			verts.push(p2x - (px - p2x), p2y - (py - p2y));
			verts.push(r, g, b, alpha);
		}
	}

	p1x = points[(length - 2) * 2];
	p1y = points[(length - 2) * 2 + 1];

	p2x = points[(length - 1) * 2];
	p2y = points[(length - 1) * 2 + 1];

	perpx = -(p1y - p2y);
	perpy = p1x - p2x;

	dist = Math.sqrt(perpx * perpx + perpy * perpy);
	perpx /= dist;
	perpy /= dist;
	perpx *= width;
	perpy *= width;

	verts.push(p2x - perpx, p2y - perpy);
	verts.push(r, g, b, alpha);

	verts.push(p2x + perpx, p2y + perpy);
	verts.push(r, g, b, alpha);

	indices.push(indexStart);

	for (i = 0; i < indexCount; i++) {
		indices.push(indexStart++);
	}

	indices.push(indexStart-1);
};

PIXI.WebGLGraphics.renderGraphics = function(graphics, renderSession) {
	var gl = renderSession.gl;
	var projection = renderSession.projection,
		offset = renderSession.offset,
		shader = renderSession.shaderManager.primitiveShader,
		webGLData;
	if (graphics.dirty) {
		PIXI.WebGLGraphics.updateGraphics(graphics, gl);
	}
	var webGL = graphics._webGL[gl.id];
	// This could be speeded up for sure!
	for (var i = 0; i < webGL.data.length; i++) {
		webGLData = webGL.data[i];
		if (webGLData.drawNativeLine) {
			renderSession.shaderManager.setShader(shader); //activatePrimitiveShader();
			shader = renderSession.shaderManager.primitiveShader;
			gl.uniformMatrix3fv(shader.translationMatrix, false, graphics.worldTransform.toArray(true));
			gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
			gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);
			gl.uniform3fv(shader.tintColor, PIXI.hex2rgb(graphics.tint));
			gl.uniform1f(shader.alpha, graphics.worldAlpha);
			gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);
			gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
			gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, false, 4 * 6, 2 * 4);
			// set the index buffer!
			//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
			//gl.drawElements(gl.LINES, webGLData.indices.length, gl.UNSIGNED_SHORT, 0 );
			gl.drawArrays(gl.LINES, 0, webGLData.points.length / 6);
		} else {
			renderSession.shaderManager.setShader(shader); //activatePrimitiveShader();
			shader = renderSession.shaderManager.primitiveShader;
			gl.uniformMatrix3fv(shader.translationMatrix, false, graphics.worldTransform.toArray(true));

			gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
			gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);

			gl.uniform3fv(shader.tintColor, PIXI.hex2rgb(graphics.tint));

			gl.uniform1f(shader.alpha, graphics.worldAlpha);

			gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);

			gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
			gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, false, 4 * 6, 2 * 4);

			// set the index buffer!
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
			gl.drawElements(gl.TRIANGLE_STRIP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0);
		}
	}
};
