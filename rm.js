/*global ROT*/
var RM = {};

RM.init = function () {
  'use strict';
  var tileSet = document.createElement('img');
  tileSet.src = 'tileset.png';
  RM.terrainSet = RM.getTerrainSet();
  RM.actorSet = RM.getActorSet();
  RM.scheduler = new ROT.Scheduler.Action();
  RM.engine = new ROT.Engine(RM.scheduler);
  RM.display = new ROT.Display({
    width: 23,
    height: 23,
    layout: 'tile',
    tileWidth: 24,
    tileHeight: 21,
    tileSet: tileSet,
    tileMap: RM.getTileMap()
  });
  RM.cursor = [0, 0];
  document.body.appendChild(RM.display.getContainer());
  window.addEventListener('click', RM.start);
  window.addEventListener('keypress', this);
};

RM.getTerrainSet = function () {
  'use strict';
  var t, i, set;
  set = [];
  for (t in RM.terrains) {
    if (RM.terrains.hasOwnProperty(t)) {
      for (i = 0; i < RM.terrains[t].chance; i += 1) {
        set.push(RM.terrains[t]);
      }
    }
  }
  return set;
};

RM.getActorSet = function () {
  'use strict';
  var a, i, set;
  set = [];
  for (a in RM.actors) {
    if (RM.actors.hasOwnProperty(a)) {
      for (i = 0; i < RM.actors[a].chance; i += 1) {
        set.push(RM.actors[a]);
      }
    }
  }
  return set;
};

RM.getTileMap = function () {
  'use strict';
  var i, tileMap;
  tileMap = {
    '': [0, 0],
    '*': [24, 0]
  };
  for (i in RM.terrains) {
    if (RM.terrains.hasOwnProperty(i)) {
      tileMap[RM.terrains[i].tile] = [
        RM.terrains[i].tileX,
        RM.terrains[i].tileY
      ];
    }
  }
  for (i in RM.actors) {
    if (RM.actors.hasOwnProperty(i)) {
      tileMap[RM.actors[i].tile] = [
        RM.actors[i].tileX,
        RM.actors[i].tileY
      ];
    }
  }
  return tileMap;
};

RM.start = function () {
  'use strict';
  var x, y, actor, i;
  window.removeEventListener('click', RM.start);
  RM.map = [];
  for (x = -50; x < 51; x += 1) {
    RM.map[x] = [];
    for (y = -50; y < 51; y += 1) {
      RM.map[x][y] = {};
      RM.map[x][y].terrain = RM.terrainSet.random();
      if (ROT.RNG.getPercentage() === 1) {
        RM.map[x][y].actor = new RM.Actor(RM.actorSet.random(), x, y, true);
      }
    }
  }
  for (i = 0; i < 1; i += 1) {
    RM.map[i][0] = {
      terrain: RM.terrains.grass,
      actor: new RM.Actor(RM.actors.elf, i, 0)
    };
  }
  RM.engine = new ROT.Engine(RM.scheduler);
  RM.engine.start();
};

RM.handleEvent = function (e) {
  'use strict';
  if (e.charCode === 99) {
    if (RM.charView) {
      RM.display.setOptions({
        layout: 'tile'
      });
      RM.charView = false;
    } else {
      RM.display.setOptions({
        layout: 'rect'
      });
      RM.charView = true;
    }
  }
};

RM.getPoint = function (x, y) {
  'use strict';
  return RM.map[x] ? RM.map[x][y] : null;
};

RM.getActor = function (x, y) {
  'use strict';
  var point = RM.getPoint(x, y);
  return point ? point.actor : null;
};

RM.getTile = function (x, y) {
  'use strict';
  var actor;
  if (RM.getPoint(x, y)) {
    actor = RM.getActor(x, y);
    if (actor) {
      return actor.tile;
    } else {
      return RM.map[x][y].terrain.tile;
    }
  }
  return '';
};

RM.isTransparent = function (x, y) {
  'use strict';
  var point = RM.getPoint(x, y);
  return point ? point.terrain.transparent : false;
};

RM.isPassable = function (x, y) {
  'use strict';
  var point = RM.getPoint(x, y);
  return point ? point.terrain.passable : false;
};

RM.draw = function (x, y, points) {
  'use strict';
  var p, dx, dy, actor, terrain;
  x = 11 - x;
  y = 11 - y;
  RM.clear();
  for (p in points) {
    if (points.hasOwnProperty(p)) {
      dx = points[p][0];
      dy = points[p][1];
      RM.display.draw(x + dx, y + dy, RM.getTile(dx, dy));
    }
  }
};

RM.clear = function () {
  'use strict';
  var x, y;
  for (x = 0; x < 23; x += 1) {
    for (y = 0; y < 23; y += 1) {
      RM.display.draw(x, y, '');
    }
  }
};
