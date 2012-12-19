"use strict";

bo.renderCloud = function(ctx, img, x, y) {
  var cloudImg = img || bo.generateCloudImage();
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.drawImage(cloudImg, x, y);
  ctx.restore();
  return cloudImg;
};

bo.generateCloudImage = function(l, r, nbCircles) {
  // Those vars are constants :)
  //var nbCircles = 6;
  var offsetY = 200;
  //var r = 400;
  //var l = 200;
  var yVar = 0.2;
  var lRange = 0.8;
  var xRange = 0.2;
  var rRange = 0.2;
  
  var tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = 2 * l;
  tmpCanvas.height = offsetY;
  var ctx = tmpCanvas.getContext("2d");

  var R = Math.sqrt(r * r + l * l);
  var xs = [];
  var ys = [];
  var radii = [];
  var i;
  var y;
  var ok;
  var dist;
  for (i = 0; i < nbCircles; ++i) {
    var round = 0;
    do {
      var x = Math.max(-l, Math.min(l, (2 * l * lRange * (i + 2 * xRange * Math.random() - xRange) /
                                        (nbCircles - 1)) - l * lRange));
      xs[i] = x;
      var yref = Math.sqrt(R * R - x * x) - r;
    
      if ((i === 0) || (i === nbCircles - 1)) {
        y = yref * (1 + yVar * Math.random());
      } else {
        y = yref * (1 - yVar + 2 * yVar * Math.random());
      }
      ys[i] = y;
      var radius = y * 1.2;
      
      radii[i] = radius * (1 + 2 * rRange * Math.random() - rRange);
      round += 1;
      ok = ((i === 0) ||
            (round > 10) ||
            ((xs[i] > xs[i - 1]) &&
             (radii[i] + radii[i - 1] >= bo.distance(xs[i] - xs[i - 1], ys[i] - ys[i - 1]))));
      
    } while (!ok);
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 2 * l, offsetY);
  ctx.closePath();
  ctx.clip();

  var grad = ctx.createLinearGradient(l - 10, 0, l , offsetY);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.7, "#ffffff");
  grad.addColorStop(0.85, "#dddde5");
  grad.addColorStop(1, "#888898");
  ctx.fillStyle = grad;

  // Bottom
  ctx.beginPath();
  ctx.moveTo(l + xs[0], offsetY);
  for (i = 0; i < nbCircles; ++i) {
    ctx.lineTo(l + xs[i], offsetY - ys[i]);
  }
  ctx.lineTo(l + xs[nbCircles - 1], offsetY);
  ctx.closePath();
  ctx.fill();

  // Circles
  for (i = 0; i < nbCircles; ++i) {
    ctx.beginPath();
    ctx.arc(l + xs[i], offsetY - ys[i], radii[i], Math.PI / 2, -3 * Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();
  }
  
  ctx.restore();
  return tmpCanvas;
};

