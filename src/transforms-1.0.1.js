/**
 * @description Various transformations for drawings
 * @author George Liu
 * @version 1.0.1
 */
(function () {


  /**
   * Iterates through each point in a drawing
   * @param {Array} drawing - array of strokes that contains an array of points
   * @param {function} callback - evaluated for each point in drawing
   */
  let _forEachPointIn = function (drawing, callback) {
    var point;

    for (var i = 0; i < drawing.length; i++) {
      for (var j = 0; j < drawing[i].length; j++) {
        point = drawing[i][j];
        callback(point);
      }
    }
  }

  /**
   * Converts angle measures from degrees to radians
   * @param {Number} degrees - angle measure in degrees
   * @returns {Number} angle measure in radians
   */
  let _toRadians = function (degrees) {
    return degrees / 180 * Math.PI;
  }

  /**
   * Gets the bounding box of an image
   * @param {Array} drawing - array of strokes that contains an array of points
   * @returns {Object} boundingBox with properties xMin, xMax, yMin, yMax
   */

  let _getBoundingBox = function (drawing) {
    let x, y;
    var xMin = Infinity,
        xMax = -Infinity,
        yMin = Infinity,
        yMax = -Infinity;

    _forEachPointIn(drawing, function (point) {
      x = point[0];
      y = point[1];

      xMin = Math.min(x,xMin);
      xMax = Math.max(x,xMax);
      yMin = Math.min(y,yMin);
      yMax = Math.max(y,yMax);
    })

    return {
      "xMin":xMin,
      "xMax":xMax,
      "yMin":yMin,
      "yMax":yMax
    };
  }

  let transforms = {
    /**
     * Shifts drawing to the right by `shiftX` and down by `shiftY`.
     * @param {Array} drawing - array of strokes that contains an array of points
     * @param {Object} options
     * @param {Number} options.shiftX - shift right by `options.shiftX` units
     * @param {Number} options.shiftY - shift down by `options.shiftY` units
     */
    shift: function (drawing, options) {
      _forEachPointIn(drawing, function (point) {
        point[0] += options["shiftX"];
        point[1] += options["shiftY"];
      });
    },

    /**
     * Scales drawing.
     * @param {Array} drawing - array of strokes that contains an array of points
     * @param {Object} options
     * @param {Number} options.scaleX - stretch horizantally by `options.scaleX` units
     * @param {Number} options.scaleY - stretch verticallly by `options.scaleY` units
     * @param {Number} [options.originX=0] - stretch from `options.originX`
     * @param {Number} [options.originY=0] - stretch from `options.originY`
     */
    scale: function (drawing, options) {
      _forEachPointIn(drawing, function (point) {

        point[0] -= options["originX"] || 0;
        point[1] -= options["originY"] || 0;

        point[0] *= options["scaleX"];
        point[1] *= options["scaleY"];

        point[0] += options["originX"] || 0;
        point[1] += options["originY"] || 0;
      });
    },

    /**
     * Rotates drawing. Positive = clockwise rotation.
     * @param {Array} drawing - array of strokes that contains an array of points
     * @param {Object} options
     * @param {Number} [options.radians] - clockwise rotation by `options.radians`
     * @param {Number} [options.degrees] - clockwise rotation by `options.degrees`
     * @param {Number} [options.originX=0] - center of rotation
     * @param {Number} [options.originY=0] - center of rotation
     */
    rotate: function (drawing, options) {
      _forEachPointIn(drawing, function (point) {

        let pointX = point[0];
        let pointY = point[1];

        let theta = options["radians"] || _toRadians(options["degrees"]);

        //reverse rotation so positive = clockwise
        theta = 0 - theta;

        point[0] -= options["originX"] || 0;
        point[1] -= options["originY"] || 0;

        /* 
         * FORMULA:
         * x' = x cos 0 - y sin 0
         * y' = y cos 0 + x sin 0
         * 
         * REFERENCES:
         * https://math.stackexchange.com/questions/156833/how-to-find-a-point-after-rotation
         * https://stackoverflow.com/questions/20104611/find-new-coordinates-of-a-point-after-rotation
         *
         */

        point[0] = pointX * Math.cos(theta) - pointY * Math.sin(theta);
        point[1] = pointY * Math.cos(theta) + pointX * Math.sin(theta);

        point[0] += options["originX"] || 0;
        point[1] += options["originY"] || 0;
      });
    },

    ///**
    // * Slants drawing.
    // * @param {Array} drawing - array of strokes that contains an array of points
    // * @param {Object} options
    // * @param {Number} [options.radians] - amount of shear in radians
    // * @param {Number} [options.degrees] - amount of shear in degrees
    // */
    //shear: function (drawing, options) {
    //  _forEachPointIn(drawing, function (point) {
    //
    //    point[0] -= options["originX"] || 0;
    //    point[1] -= options["originY"] || 0;
    //
    //    point[0] *= options["scaleX"];
    //    point[1] *= options["scaleY"];
    //
    //    point[0] += options["originX"] || 0;
    //    point[1] += options["originY"] || 0;
    //  });
    //},

    /**
     * Centers drawing by center of mass.
     * @param {Array} drawing - array of strokes that contains an array of points
     * @param {Object} options
     * @param {Number} [options.imageS] - sidelengths of image (if square)
     * @param {Number} [options.imageW] - width of image
     * @param {Number} [options.imageH] - height of image
     */
    center: function (drawing, options) {
      let numOfPoints = 0;
      let centerMassX = 0;
      let centerMassY = 0;

      let actualCenterX = options["imageW"] || options["imageS"];
      let actualCenterY = options["imageH"] || options["imageS"];

      _forEachPointIn(drawing, function (point) {
        centerMassX += point[0];
        centerMassY += point[1];

        numOfPoints++;
      });

      //center of mass is calculated by the average of all points
      centerMassX = centerMassX / numOfPoints;
      centerMassY = centerMassY / numOfPoints;

      //target center - actual center = shift factor
      centerMassX -= actualCenterX;
      centerMassY -= actualCenterY;

      transforms.shift(drawing,{
        "shiftX":centerMassX,
        "shiftY":centerMassY
      });
    }
  };

  window["transforms"] = transforms;
})();
