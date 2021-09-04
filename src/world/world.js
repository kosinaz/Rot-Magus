/* global Phaser */
import PreciseShadowcasting from '../../lib/rot/fov/precise-shadowcasting.js';
import AStar from '../../lib/rot/path/astar.js';
import Terrain from './terrain.js';
import ActorGroup from './actorGroup.js';

/**
 * Represents the game world.
 *
 * @export
 * @class World
 */
export default class World {
  /**
   *Creates an instance of World.
   * @param {*} config
   * @memberof World
   */
  constructor(config) {
    this.config = config;
    this.selected = null;
    this.map = new Map();
    this.visibleTiles = new Set();
    this.fovcomputer = new PreciseShadowcasting(this.isTransparent.bind(this));
    this.events = new Phaser.Events.EventEmitter();
  }

  /**
   *
   *
   * @param {*} config
   * @memberof World
   */
  create() {
    this.actors = new ActorGroup();
    this.actors.events.on('add', (actor) => this.events.emit('add', actor));
    this.config.pcs.forEach((pc) => this.actors.add(pc));
    this.actors.events.on('next', this.controlActor, this);
    this.actors.next();
  }

  addChunkFor(x, y) {
    const chunkX = Math.floor(x / 50);
    const chunkY = Math.floor(y / 50);
    for (let x = chunkX * 50; x < chunkX * 50 + 50; x += 1) {
      for (let y = chunkY * 50; y < chunkY * 50 + 50; y += 1) {
        const floor = chunkX % 2 ? 
          chunkY % 2 ? 'dirt' : 'gravel' :
          chunkY % 2 ? 'grass' : 'sand';
        const wall = chunkX % 2 ?
          chunkY % 2 ? 'mountain' : 'mountain' :
          chunkY % 2 ? 'tree' : 'palmTree';
        const tile = Math.random() > 0.1 ? floor : wall;
        this.createTerrain({
          layer: 'terrain',
          image: tile,
          name: tile,
          walkable: !['mountain', 'tree', 'palmTree'].includes(tile),
          transparent: !['mountain', 'tree', 'palmTree'].includes(tile),
        }, x, y);
      }
    }
  }

  /**
   *
   *
   * @param {*} terrainType
   * @param {*} x
   * @param {*} y
   * @param {*} isPC
   * @memberof World
   */
  createTerrain(terrainType, x, y) {
    const terrain = new Terrain(terrainType, x, y);
    this.map.set(terrain.position, terrain);
    this.events.emit('add', terrain);
  }

  /**
   *
   *
   * @memberof World
   */
  controlActor(actor) {    
    this.currentActor = actor;
    this.updatePossibleTargets(actor);
    if (actor.isPC) this.controlPC(actor, this.possibleTargets);
    else this.controlNPC(actor, this.possibleTargets);
  }

  controlPC(actor, targets) {
    // All that happened since the player's last action, will be revealed now. 
    this.updateVisibleTiles();

    // The world will stop if the player character doesn't have any actions 
    // left from their last order to let the player give another order. 
    // Otherwise the player character will scan their surroundings for enemies
    // or newly discovered items, and the world will stop just like in the 
    // other case, if there is any. 
    // However, if there is none, there is no reason for the player character 
    // not to continue towards their target, so the game won't stop and won't 
    // reveal anything until any of the above conditions are true again. 
    const targetInSight = !!(targets.filter(target => !target.isPC)[0]);
    if (!actor.orders.length || targetInSight) this.revealAndWait(actor);
    else actor.act();
  }

  controlNPC(actor, targets) {
    const target = targets.filter(target => target.isPC)[0];
    if (target) this.giveOrder(actor, target.x, target.y);
    actor.act();
  }

  revealAndWait(actor) {
    this.actors.forEach(this.updateActorVisibility, this);
    this.pause(actor);
    this.select(actor);
  }

  /**
   *
   * @param {*} actor
   * @memberof World
   */
  select(actor) {
    this.selected = actor;
    this.events.emit('select', actor);
  }

  /**
   *
   * @param {*} actor
   * @memberof World
   */
  pause(actor) {
    this.pausedFor = actor;
    this.events.emit('pause', actor);
  }

  /**
   *
   *
   * @param {*} x
   * @param {*} y
   * @return {Boolean}
   * @memberof World
   */
  isTransparent(x, y) {
    const terrain = this.map.get(`terrain,${x},${y}`);
    if (this.actors.hasPCAt(`${x},${y}`)) return true;
    if (!terrain) return false;
    return terrain.type.transparent;
  }

  /**
   * Updates all the tiles of the world currently visible for the player by
   * updating the FOV of all the player characters.
   *
   * @param {*} actor
   * @memberof World
   */
  updateVisibleTiles() {
    // Add the newly visible tiles.
    this.tilesToHide = new Set(this.visibleTiles);
    this.visibleTiles.clear();
    this.actors.forEachPC(this.updateFov, this);

    // Hide all the tiles that were visible before but not anymore.
    this.tilesToHide.forEach(this.hideTile, this);
  }

  hideTile(tile) {
    this.map.get(`terrain,${tile}`).events.emit('hide');
  }

  updateActorVisibility(actor) {
    if (this.visibleTiles.has(`${actor.xy}`)) actor.show();
    else actor.hide();
  }

  updateFov(actor) {
    // Reset the list of tiles that are visible for the actor.
    actor.fov.clear();

    // Iterate through all the tiles around the actor and determine if they
    // are in the line of sight of the actor or not.
    this.fovcomputer.compute(actor.x, actor.y, 13, this.updateTile.bind(this));
  }

  updateTile(x, y) {
    const xy = `${x},${y}`;
    this.currentActor.fov.add(xy);

    // If the tile is not already visible for any other PC then add it to the
    // list of currently visible tiles.
    this.visibleTiles.add(xy);

    // And try to remove it from the list of previously visible tiles, to only
    // keep those tiles there that are not visible now and will need to be
    // hidden.
    // If couldn't that means this tile is newly explored, so we need to check
    // what's there and show it.
    if (!this.tilesToHide.delete(xy)) this.revealTile(x, y);
  }

  revealTile(x, y) {
    const tile = `terrain,${x},${y}`;

    // If there is nothing at the given position, create it.
    if (!this.map.has(tile)) this.addChunkFor(x, y);

    // Then show what's there.
    this.map.get(tile).events.emit('reveal');
  }

  /**
   *
   *
   * @param {*} actor
   * @memberof World
   */
  updatePossibleTargets(actor) {
    this.possibleTargets = [];
    // Iterate through all the tiles around the actor and determine if they
    // are in the line of sight of the actor or not.
    this.fovcomputer.compute(actor.x, actor.y, 13, this.addTarget.bind(this));
  }

  addTarget(x, y) {
    const target = this.actors.getAt(`${x},${y}`);
    if (target) this.possibleTargets.push(target);
  }

  /**
   * Give the actor an order.
   *
   * @param {*} actor
   * @param {*} x
   * @param {*} y
   * @memberof Actor
   */
  giveOrder(actor, x, y) {
    // Initialize a new astar pathmap based on the given target.
    const a = new AStar(x, y, this.isWalkable.bind(this));

    // After generated the pathmap create a new path for the actor.
    actor.orders = [];

    // Compute the shortest path between the actor's current position and the
    // given target position based on the astar map.
    a.compute(actor.x, actor.y, this.addNextStep.bind(this));

    // Remove the first order, because that's current position of the actor.
    actor.orders.shift();
  }

  isWalkable(x, y) {
    const xy = `${x},${y}`;
    if (this.currentActor.isAt(xy)) return true;
    if (this.map.get(`terrain,${xy}`).type.walkable) return true;
    return false;
  }

  addNextStep(x, y) {
    this.currentActor.orders.push({x: x, y: y});
  }
}
