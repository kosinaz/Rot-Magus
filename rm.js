/*global ROT*/
var RM = {};

RM.init = function () {
  'use strict';
  var bcr;
  RM.tileSet = document.createElement('img');
  RM.tileSet.src = 'tileset.png';
  RM.hud = document.createElement('img');
  RM.hud.src = 'hud.png';
  RM.terrainSet = RM.getTerrainSet();
  RM.actorSet = RM.getActorSet();
  RM.canvas = document.createElement('canvas');
  RM.canvas.width = 640;
  RM.canvas.height = 480;
  document.getElementById('rm').appendChild(RM.canvas);
  bcr = RM.canvas.getBoundingClientRect();
  RM.clientXPX = bcr.left;
  RM.clientYPX = bcr.top;
  RM.mapClientXPX = RM.clientXPX + 128;
  RM.mapClientYPX = RM.clientYPX + 9;
  RM.mapWidthPX = 504;
  RM.mapHeightPX = 441;
  RM.ctx = RM.canvas.getContext('2d');
  RM.ctx.font = '12px Immortal';
  RM.ctx.textAlign = 'center';
  RM.ctx.textBaseline = 'top';
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
  RM.ctx.drawImage(RM.hud, 0, 0);
  RM.scheduler = new ROT.Scheduler.Action();
  RM.engine = new ROT.Engine(RM.scheduler);
  RM.map = [];
  for (x = -50; x < 51; x += 1) {
    RM.map[x] = [];
    for (y = -50; y < 51; y += 1) {
      RM.map[x][y] = {};
      RM.map[x][y].terrain = RM.terrainSet.random();
      if (ROT.RNG.getPercentage() === 1) {
        RM.map[x][y].actor = new RM.Actor(RM.actorSet.random(), x, y, true);
        RM.map[x][y].terrain = RM.terrains.grass;
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

RM.drawMap = function (x, y, points) {
  'use strict';
  var p, dx, dy, tx, ty, actor, point;
  x = 15 - x;
  y = 10 - y;
  RM.ctx.fillStyle = '#000000';
  RM.ctx.fillRect(128, 9, 504, 441);
  for (p in points) {
    if (points.hasOwnProperty(p)) {
      dx = points[p][0];
      dy = points[p][1];
      actor = RM.getActor(dx, dy);
      if (actor) {
        tx = actor.tx;
        ty = actor.ty;
      } else {
        point = RM.getPoint(dx, dy);
        if (point) {
          tx = point.terrain.x;
          ty = point.terrain.y;
        }
      }
      RM.ctx.drawImage(RM.tileSet,
                       tx, ty, 24, 21,
                       (x + dx) * 24 + 8, (y + dy) * 21 + 9, 24, 21);
    }
  }
};

RM.drawHUD = function (player) {
  'use strict';
  var p;
  p = Math.floor(player.xp / (50 * Math.pow(2, player.level)) * 70);
  RM.ctx.fillStyle = '#616161';
  RM.ctx.fillRect(41, 10, 70, 19);
  RM.ctx.fillStyle = '#e3e300';
  RM.ctx.fillRect(41, 10, p, 19);
  p = Math.floor((player.health / player.maxHealth) * 70);
  RM.ctx.fillStyle = '#616161';
  RM.ctx.fillRect(41, 31, 70, 19);
  RM.ctx.fillStyle = '#e30000';
  RM.ctx.fillRect(41, 31, p, 19);
  p = player.maxMana ? Math.floor((player.mana / player.maxMana) * 70) : 0;
  RM.ctx.fillStyle = '#616161';
  RM.ctx.fillRect(41, 52, 70, 19);
  RM.ctx.fillStyle = '#0020e3';
  RM.ctx.fillRect(41, 52, p, 19);
  RM.ctx.fillStyle = '#616161';
  RM.ctx.fillRect(16, 93, 96, 21);
  RM.ctx.fillStyle = '#000000';
  RM.ctx.fillText(player.strength, 28, 97);
  RM.ctx.fillText(player.wisdom, 52, 97);
  RM.ctx.fillText(player.agility, 76, 97);
  RM.ctx.fillText(player.precision, 100, 97);
  /*RM.display.drawText(1, 0, player.level.toString());
  RM.display.draw(0, 1, 'X');
  p = Math.floor(player.xp / (50 * Math.pow(2, player.level)) * 100);
  RM.display.drawText(1, 1, p + '%');
  RM.display.draw(0, 2, 'H');
  p = Math.floor((player.health / player.maxHealth) * 100);
  RM.display.drawText(1, 2, p + '%');
  RM.display.draw(0, 3, 'M');
  p = player.maxMana ? Math.floor((player.mana / player.maxMana) * 100) : 0;
  RM.display.drawText(1, 3, p + '%');
  RM.display.draw(0, 4, 'B');
  p = Math.floor((player.burden / player.strength) * 100);
  RM.display.drawText(1, 4, p + '%');
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
  RM.display.draw(3, 13, '_');*/
};
