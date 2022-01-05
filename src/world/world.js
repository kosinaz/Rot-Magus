/* global Phaser */
import Director from './director.js';
import Troupe from './troupe.js';
import WorldMap from './worldMap.js';

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
    this.map = new WorldMap();
    this.map.events.on('add', terrain => this.events.emit('add', terrain));
    this.actors = new Troupe();
    this.events = new Phaser.Events.EventEmitter();
    this.actors.events.on('add', actor => this.events.emit('add', actor));
    this.actors.events.on('select', pc => this.events.emit('select', pc));
    this.director = new Director(this.map, this.actors);
  }

  start() {
    this.config.pcs.forEach(pc => this.actors.add(pc));
    this.director.direct(this.actors.getNext());
  }

  /* async mainLoop() {
    let actor = this.actors.getNext();
    while (actor) {
      await actor.act();
      actor = this.actors.getNext();
    }
  }
  
  async function mainLoop() {
    for (let i = 0; i < 10; i += 1) {
      let actor = scheduler.next();
      if (!actor) { break; }
      await actor.act();
      SHOW(output.join("<br>"));
      output = [];
    }
  }
  
  let scheduler = new ROT.Scheduler.Simple();
  let output = [];
  
  resolver = (resolve) => {
    document.onclick = (e) => {
      console.log(e.x, e.y);
      resolve(e.x + "," + e.y);
    } 
  }
  
  let actor1 = { // sample actor: pauses the execution when dead
    act: async () => {
      let out = "1 moves to ";
      out += await new Promise(resolver); // pause
      output.push(out);
    }       
  }
  
  let actor2 = {
    act: () => { 
      output.push("2 is idle"); 
    }
  }
  
  let actor3 = {
    act: () => { 
      output.push("3 is idle"); 
    }
  }
  
  scheduler.add(actor1, true);
  scheduler.add(actor2, true);
  scheduler.add(actor3, true);
  mainLoop(); */

}
