/*global ROT*/
var RM = {
  VERSION: 'Version 0.3.0.93'
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
      RM.map.setTerrain(x, y, RM.terrainSet.random());
      if (ROT.RNG.getPercentage() === 1) {
        RM.map.setTerrain(x, y, RM.terrains.grass);
        RM.map.setActor(x, y, new RM.Nasty(RM.actorSet.random(), x, y, true));
      }
    }
  }
  for (i = 0; i < 1; i += 1) {
    RM.map.setActor(i, 0, new RM.Actor(RM.actors.elf, i, 0));
  }
  im = new RM.Map();
  im.setItem(0, 0, new RM.Item(RM.items.elvenCloak));
  im.setItem(1, 0, new RM.Item(RM.items.dagger));
  RM.map.setTerrain(3, 3, RM.terrains.grass);
  RM.map.setItemMap(3, 3, im);
  RM.gui = new RM.GUI();
  RM.engine = new ROT.Engine(RM.scheduler);
  RM.engine.start();
};
