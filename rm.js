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
    width: 21,
    height: 21,
    layout: 'tile',
    tileWidth: 24,
    tileHeight: 21,
    tileSet: tileSet,
    tileMap: RM.getTileMap()
  });
  document.body.appendChild(RM.display.getContainer());
  window.addEventListener('click', RM.start);
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
  tileMap = [];
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
  for (x = -10; x < 11; x += 1) {
    RM.map[x] = [];
    for (y = -10; y < 11; y += 1) {
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

RM.getPoint = function (x, y) {
  'use strict';
  return RM.map[x] ? RM.map[x][y] : null;
};

RM.getActor = function (x, y) {
  'use strict';
  var point = RM.getPoint(x, y);
  return point ? point.actor : null;
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
  var i, dx, dy, actor, terrain;
  x = 10 - x;
  y = 10 - y;
  RM.clear();
  for (i = 0; i < points.length; i += 1) {
    dx = points[i][0];
    dy = points[i][1];
    if (RM.getPoint(dx, dy)) {
      actor = RM.getActor(dx, dy);
      if (actor) {
        RM.display.draw(x + dx, y + dy, actor.tile);
      } else {
        RM.display.draw(x + dx, y + dy, RM.map[dx][dy].terrain.tile);
      }
    }
  }

};

RM.clear = function () {
  'use strict';
  var x, y;
  for (x = 0; x < 21; x += 1) {
    for (y = 0; y < 21; y += 1) {
      RM.display.draw(x, y, '');
    }
  }
};
