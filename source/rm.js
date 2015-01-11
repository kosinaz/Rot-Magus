/*global ROT*/
var RM = {
  VERSION: 'Version 0.3.0.93',
  TERRAIN: 0,
  ITEMS: 1,
  ACTOR: 2
};

RM.init = function () {
  'use strict';
  var bcr;
  RM.resources = 0;
  RM.loaded = 0;
  RM.tileSet = RM.createImage('images/resources/tileset.png');
  RM.hud = RM.createImage('images/resources/hud.png');
  RM.title = RM.createImage('images/gamescreens/title.png');
  RM.gameover = RM.createImage('images/gamescreens/gameover.png');
  RM.terrainSet = RM.getTerrainSet();
  RM.actorSet = RM.getActorSet();
  RM.canvas = document.getElementById('rm');
  RM.c = RM.canvas.getContext('2d');
  RM.overlay = document.createElement('canvas');
  RM.overlay.width = RM.canvas.width;
  RM.overlay.height = RM.canvas.height;
  RM.oc = RM.overlay.getContext('2d');
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
  var x, y, actor, i, im;
  RM.canvas.removeEventListener('click', RM.start);
  RM.scheduler = new ROT.Scheduler.Action();
  RM.engine = new ROT.Engine(RM.scheduler);
  RM.map = new RM.Map();
  for (x = -50; x < 51; x += 1) {
    for (y = -50; y < 51; y += 1) {
      RM.map.setPoint(RM.terrainSet.random(), x, y, RM.TERRAIN);
      if (ROT.RNG.getPercentage() === 1) {
        RM.map.setPoint(RM.terrains.grass, x, y, RM.TERRAIN);
        RM.map.setPoint(new RM.Nasty(RM.actorSet.random(), x, y, true),
                        x, y, RM.ACTOR);
      }
    }
  }
  RM.map.setPoint(new RM.Hero(RM.actors.elf, 0, 0), 0, 0, RM.ACTOR);
  RM.gui = new RM.GUI();
  RM.engine = new ROT.Engine(RM.scheduler);
  RM.engine.start();
};
