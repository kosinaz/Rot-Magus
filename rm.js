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
    width: 26,
    height: 22,
    layout: 'tile',
    tileWidth: 24,
    tileHeight: 21,
    tileSet: tileSet,
    tileMap: RM.tiles
  });
  RM.cursor = [16, 11];
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

RM.drawMap = function (x, y, points) {
  'use strict';
  var p, dx, dy, actor, terrain;
  x = 15 - x;
  y = 10 - y;
  RM.clearMap();
  for (p in points) {
    if (points.hasOwnProperty(p)) {
      dx = points[p][0];
      dy = points[p][1];
      RM.display.draw(x + dx, y + dy, RM.getTile(dx, dy));
    }
  }
};

RM.drawHUD = function (player) {
  'use strict';
  var x, y;
  for (x = 0; x < 5; x += 1) {
    for (y = 0; y < 15; y += 1) {
      RM.display.draw(x, y, ' ');
    }
    for (y = 15; y < 20; y += 1) {
      RM.display.draw(x, y, '_');
    }
    RM.display.draw(x, 20, ' ');
  }
  for (x = 0; x < 26; x += 1) {
    RM.display.draw(x, 21, ' ');
  }
  RM.display.draw(0, 0, 'L');
  RM.display.drawText(1, 0, player.level.toString());
  RM.display.draw(0, 1, 'X');
  RM.display.drawText(1, 1, player.xp.toString());
  RM.display.draw(0, 2, 'H');
  RM.display.drawText(1, 2, player.health.toString());
  RM.display.draw(0, 3, 'M');
  RM.display.drawText(1, 3, player.mana.toString());
  RM.display.draw(0, 4, 'B');
  RM.display.drawText(1, 4, player.burden.toString());
  RM.display.draw(0, 5, 'S');
  RM.display.drawText(1, 5, player.strength.toString());
  RM.display.draw(0, 6, 'W');
  RM.display.drawText(1, 6, player.wisdom.toString());
  RM.display.draw(0, 7, 'A');
  RM.display.drawText(1, 7, player.agility.toString());
  RM.display.draw(0, 8, 'P');
  RM.display.drawText(1, 8, player.precision.toString());
  RM.display.draw(2, 10, '_');
  RM.display.draw(2, 11, '_');
  RM.display.draw(1, 12, '_');
  RM.display.draw(2, 12, '_');
  RM.display.draw(3, 12, '_');
  RM.display.draw(1, 13, '_');
  RM.display.draw(2, 13, '_');
  RM.display.draw(3, 13, '_');
};

RM.clearMap = function () {
  'use strict';
  var x, y;
  for (x = 5; x < 26; x += 1) {
    for (y = 0; y < 21; y += 1) {
      RM.display.draw(x, y, '');
    }
  }
};
