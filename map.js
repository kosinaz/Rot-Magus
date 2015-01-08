/*global RM, ROT*/
/**
 * A class to store multi-dimensional data.
 * @constructor
 */
RM.Map = function () {
  'use strict';
  this.points = {};
  this.shadowcasting =
    new ROT.FOV.PreciseShadowcasting(this.isTransparent.bind(this));
};

/**
 * Stores a custom data in an arbitrarily defined point of the map.
 * @param   {Object} data The object to store.
 * @param   {String} p    The coordinates of the point separated with commas,
 *                        or the first coordinate of the point, followed by the
 *                        others as additional arguments.
 */
RM.Map.prototype.setPoint = function (data, p) {
  'use strict';
  var i;
  for (i = 2; i < arguments.length; i += 1) {
    p += ',' + arguments[i];
  }
  this.points[p] = data;
};

/**
 * Gets the data stored in an arbitrarily defined point of the map.
 * @param   {String} p The coordinates of the point separated with commas,
 *                   or the first coordinate of the point, followed by the
 *                   others as additional arguments.
 * @returns {Object} The object stored in the specified point of the map.
 */
RM.Map.prototype.getPoint = function (p) {
  'use strict';
  var i;
  for (i = 1; i < arguments.length; i += 1) {
    p += ',' + arguments[i];
  }
  return this.points[p];
};

RM.Map.prototype.getTerrain = function (x, y) {
  'use strict';
  return this.getPoint(x, y, 0);
};

RM.Map.prototype.setTerrain = function (x, y, terrain) {
  'use strict';
  this.setPoint(terrain, x, y, 0);
};

RM.Map.prototype.getItemMap = function (x, y) {
  'use strict';
  return this.getPoint(x, y, 1);
};

RM.Map.prototype.setItemMap = function (x, y, itemMap) {
  'use strict';
  this.setPoint(itemMap, x, y, 1);
};

RM.Map.prototype.getActor = function (x, y) {
  'use strict';
  return this.getPoint(x, y, 2);
};

RM.Map.prototype.setActor = function (x, y, actor) {
  'use strict';
  this.setPoint(actor, x, y, 2);
};

RM.Map.prototype.getItem = function (x, y) {
  'use strict';
  return this.getPoint(x, y, 3);
};

RM.Map.prototype.setItem = function (x, y, item) {
  'use strict';
  this.setPoint(item, x, y, 3);
};

RM.Map.prototype.getTile = function (x, y) {
  'use strict';
  var actor, itemMap, i, ix, iy, item, terrain, tile;
  tile = null;
  actor = this.getActor(x, y);
  if (actor) {
    tile = actor.type;
  } else {
    itemMap = this.getItemMap(x, y);
    if (itemMap) {
      for (i in itemMap.points) {
        if (itemMap.points.hasOwnProperty(i)) {
          ix = i.split(',')[0];
          iy = i.split(',')[1];
          item = itemMap.getItem(ix, iy);
          if (item) {
            tile = item.type;
            break;
          }
        }
      }
    }
    if (tile === null) {
      terrain = this.getTerrain(x, y);
      if (terrain) {
        tile = terrain;
      } else {
        item = this.getItem(x, y);
        if (item) {
          tile = item.type;
        }
      }
    }
  }
  return tile;
};

RM.Map.prototype.isPlayer = function (x, y) {
  'use strict';
  var actor = this.getActor(x, y);
  return actor ? !actor.ai : false;
};

RM.Map.prototype.isTransparent = function (x, y) {
  'use strict';
  var point = this.getPoint(x, y, 0);
  return point ? point.transparent : false;
};

RM.Map.prototype.isPassable = function (x, y) {
  'use strict';
  var point = this.getPoint(x, y, 0);
  return point ? point.passable : false;
};
