/*global RM, ROT*/
RM = {
  map: [],
  pcs: [],
  npcs: [],
  terrainSet: [],
  scheduler: new ROT.Scheduler.Action()
};

RM.init = function () {
  'use strict';
  RM.terrainSet = RM.getTerrainSet();
  RM.actorSet = RM.getActorSet();
};

RM.getTerrainSet = function () {
  'use strict';
  var terrain, i, set;
  set = [];
  for (terrain in RM.terrains) {
    if (RM.terrains.hasOwnProperty(terrain)) {
      for (i = 0; i < RM.terrains.terrain.chance; i += 1) {
        set.push(RM.terrains.terrain);
      }
    }
  }
  return set;
};

RM.getActorSet = function () {
  'use strict';
  var actor, i, set;
  set = [];
  for (actor in RM.actors) {
    if (RM.actors.hasOwnProperty(actor)) {
      for (i = 0; i < RM.actors.actor.chance; i += 1) {
        set.push(RM.actors.actor);
      }
    }
  }
  return set;
};

RM.start = function () {
  'use strict';
  var x, y, i;
  for (x = -50; x < 51; x += 1) {
    RM.map[x] = [];
    for (y = -50; y < 51; y += 1) {
      RM.map[x][y] = {
        terrain: RM.terrainSet.random(),
        actor: ROT.RNG.getPercentage() === 1 ? RM.actorSet.random() : null
      };
    }
  }
  for (i = 0; i < RM.pcs.length; i += 1) {
    RM.pcs[i].setXY(i, 0);
    RM.map[i][0] = {
      terrain: RM.terrains.grass,
      actor: RM.pcs[i]
    };
  }
  RM.engine = new ROT.Engine(RM.scheduler);
  RM.engine.start();
};

RM.mapHas = function (x, y) {
  'use strict';
  if (RM.map[x]) {
    return RM.map[x][y];
  }
  return false;
};

RM.isTransparent = function (x, y) {
  'use strict';
  if (RM.mapHas(x, y)) {
    return RM.map[x][y].terrain.transparent;
  }
  return false;
};

RM.getActor = function (x, y) {
  'use strict';
  if (RM.mapHas(x, y)) {
    return RM.map[x][y].actor;
  }
  return false;
};
