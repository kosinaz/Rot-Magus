/*global ROT*/
var RM = {
  VERSION: 'Version 0.2.0.43'
};

RM.init = function () {
  'use strict';
  var bcr;
  RM.resources = 0;
  RM.loaded = 0;
  RM.tileSet = RM.createImage('tileset.png');
  RM.hud = RM.createImage('hud.png');
  RM.title = RM.createImage('title.png');
  RM.gameover = RM.createImage('gameover.png');
  RM.terrainSet = RM.getTerrainSet();
  RM.actorSet = RM.getActorSet();
  RM.canvas = document.getElementById('rm');
  bcr = RM.canvas.getBoundingClientRect();
  RM.clientXPX = bcr.left;
  RM.clientYPX = bcr.top;
  RM.mapClientXPX = RM.clientXPX + 128;
  RM.mapClientYPX = RM.clientYPX + 9;
  RM.mapWidthPX = 504;
  RM.mapHeightPX = 441;
  RM.invXPX = 16;
  RM.invYPX = 114;
  RM.invClientXPX = RM.clientXPX + RM.invXPX;
  RM.invClientYPX = RM.clientYPX + RM.invYPX;
  RM.invWidthPX = 96;
  RM.invHeightPX = 336;
  RM.c = RM.canvas.getContext('2d');
};

RM.createImage = function (src) {
  'use strict';
  var img = document.createElement('img');
  RM.resources += 1;
  img.onload = function () {
    RM.loaded += 1;
    if (RM.loaded === RM.resources) {
      RM.loadTitle();
    }
  };
  img.src = src;
  return img;
};

RM.loadTitle = function () {
  'use strict';
  RM.c.drawImage(RM.title, 0, 0);
  RM.c.font = '16px Immortal';
  RM.c.textAlign = 'center';
  RM.c.textBaseline = 'top';
  RM.c.fillStyle = '#808080';
  RM.c.fillText(RM.VERSION, 320, 440);
  RM.canvas.addEventListener('click', RM.start);
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
  RM.canvas.removeEventListener('click', RM.start);
  RM.c.drawImage(RM.hud, 0, 0);
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

RM.drawFOV = function (player) {
  'use strict';
  var x, y, p, dx, dy, tx, ty, actor, point;
  x = 10 - player.x;
  y = 10 - player.y;
  RM.c.fillStyle = '#000000';
  RM.c.fillRect(128, 9, 504, 441);
  for (p in player.fov) {
    if (player.fov.hasOwnProperty(p)) {
      dx = player.fov[p][0];
      dy = player.fov[p][1];
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
      RM.c.drawImage(RM.tileSet,
                       tx, ty, 24, 21,
                       (x + dx) * 24 + 128, (y + dy) * 21 + 9, 24, 21);
      if (p === player.target) {
        RM.c.drawImage(RM.tileSet,
                       17 * 24, 21, 24, 21,
                       (x + dx) * 24 + 128, (y + dy) * 21 + 9, 24, 21);
      }
    }
  }
};

RM.drawHUD = function (player) {
  'use strict';
  var p, item;
  RM.c.font = '12px Immortal';
  RM.c.textAlign = 'center';
  RM.c.textBaseline = 'top';
  p = Math.floor(player.xp / (50 * Math.pow(2, player.level)) * 70);
  RM.c.fillStyle = '#616161';
  RM.c.fillRect(41, 10, 70, 19);
  RM.c.fillStyle = '#e3e300';
  RM.c.fillRect(41, 10, p, 19);
  RM.c.fillStyle = '#000000';
  RM.c.fillText(player.xp + '/' + (50 * Math.pow(2, player.level)), 76, 12);
  p = Math.floor((player.health / player.maxHealth) * 70);
  RM.c.fillStyle = '#616161';
  RM.c.fillRect(41, 31, 70, 19);
  RM.c.fillStyle = '#e30000';
  RM.c.fillRect(41, 31, p, 19);
  RM.c.fillStyle = '#000000';
  RM.c.fillText(Math.floor(player.health) + '/' + player.maxHealth, 76, 33);
  p = player.maxMana ? Math.floor((player.mana / player.maxMana) * 70) : 0;
  RM.c.fillStyle = '#616161';
  RM.c.fillRect(41, 52, 70, 19);
  RM.c.fillStyle = '#0020e3';
  RM.c.fillRect(41, 52, p, 19);
  RM.c.fillStyle = '#000000';
  RM.c.fillText(player.mana + '/' + player.maxMana, 76, 54);
  RM.c.fillStyle = '#616161';
  RM.c.fillRect(16, 93, 96, 21);
  RM.c.fillStyle = '#000000';
  RM.c.fillText(player.strength, 28, 97);
  RM.c.fillText(player.wisdom, 52, 97);
  RM.c.fillText(player.agility, 76, 97);
  RM.c.fillText(player.precision, 100, 97);
  for (p = 0; p < player.items.length; p += 1) {
    item = player.items[p];
    RM.c.drawImage(RM.tileSet,
                   RM.items[item].x, RM.items[item].y, 24, 21,
                   RM.invXPX + p % 4 * 24,
                   RM.invYPX + Math.floor(p / 4) * 21, 24, 21);
    if (player.primary === p ||
        player.cloak === p) {
      RM.c.drawImage(RM.tileSet,
                     18 * 24, 21, 24, 21,
                     RM.invXPX + p % 4 * 24,
                     RM.invYPX + Math.floor(p / 4) * 21, 24, 21);
    }
  }
};
