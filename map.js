/*global RM, ROT*/
RM.Map = function () {
  'use strict';
  this.points = [];
  this.shadowcasting =
    new ROT.FOV.PreciseShadowcasting(this.isTransparent.bind(this));
};

RM.Map.prototype.getPoint = function (x, y) {
  'use strict';
  return this.points[x] ? this.points[x][y] : null;
};

RM.Map.prototype.getTerrain = function (x, y) {
  'use strict';
  var point = this.getPoint(x, y);
  return point ? point.terrain : null;
};

RM.Map.prototype.setTerrain = function (x, y, terrain) {
  'use strict';
  if (!this.points[x]) {
    this.points[x] = [];
  }
  if (!this.points[x][y]) {
    this.points[x][y] = {};
  }
  this.points[x][y].terrain = terrain;
};

RM.Map.prototype.getItem = function (x, y) {
  'use strict';
  var point = this.getPoint(x, y);
  return point ? point.item : null;
};

RM.Map.prototype.setItem = function (x, y, item) {
  'use strict';
  if (!this.points[x]) {
    this.points[x] = [];
  }
  if (!this.points[x][y]) {
    this.points[x][y] = {};
  }
  this.points[x][y].item = item;
};

RM.Map.prototype.getItemMap = function (x, y) {
  'use strict';
  var point = this.getPoint(x, y);
  return point ? point.itemMap : null;
};

RM.Map.prototype.setItemMap = function (x, y, itemMap) {
  'use strict';
  if (!this.points[x]) {
    this.points[x] = [];
  }
  if (!this.points[x][y]) {
    this.points[x][y] = {};
  }
  this.points[x][y].itemMap = itemMap;
};

RM.Map.prototype.getActor = function (x, y) {
  'use strict';
  var point = this.getPoint(x, y);
  return point ? point.actor : null;
};

RM.Map.prototype.setActor = function (x, y, actor) {
  'use strict';
  if (!this.points[x]) {
    this.points[x] = [];
  }
  if (!this.points[x][y]) {
    this.points[x][y] = {};
  }
  this.points[x][y].actor = actor;
};

RM.Map.prototype.getTile = function (x, y) {
  'use strict';
  var actor, itemMap, i, j, item, terrain, tile;
  tile = null;
  actor = this.getActor(x, y);
  if (actor) {
    tile = actor.type;
  } else {
    itemMap = this.getItemMap(x, y);
    if (itemMap) {
      for (i = 0; i < itemMap.points.length; i += 1) {
        for (j = 0; j < itemMap.points[i].length; j += 1) {
          item = itemMap.getItem(i, j);
          if (item) {
            tile = item.type;
            break;
          }
        }
      }
    } else {
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
  var point = this.getPoint(x, y);
  return point ? point.terrain.transparent : false;
};

RM.Map.prototype.isPassable = function (x, y) {
  'use strict';
  var point = this.getPoint(x, y);
  return point ? point.terrain.passable : false;
};
