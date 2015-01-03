/*global RM, ROT*/
RM.Map = function () {
  'use strict';
  this.points = [];
  this.shadowcasting = new ROT.FOV.PreciseShadowcasting(this.isTransparent);
};

RM.Map.prototype.getPoint = function (x, y) {
  'use strict';
  return this.points[x] ? this.points[x][y] : null;
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
  this.points[x][y].terrain = RM.terrains.grass;
  this.points[x][y].actor = actor;
};

RM.Map.prototype.isPlayer = function (x, y) {
  'use strict';
  var actor = this.getActor(x, y);
  return actor ? actor.ai : false;
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
