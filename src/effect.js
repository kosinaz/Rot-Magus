/**
 * Represents the temporary impact of an actor's action upon the same or a
 * different actor. It can modify his stats, his behavior, or the way how the
 * the engine will handle him during his next action.
 * @export
 * @class Effect
 */
export class Effect {
  /**
   * Creates an instance of Effect.
   * @param {Actor} actor - The effected actor.
   * @param {string} type - The typename of the effect.
   * @memberof Effect
   */
  constructor(actor, type) {
    this.actor = actor;
    this.config = this.cache.json.get('effectTypes')[type];
    this.time = this.config.time;
    this.actor.events.on('act', this.decreaseTime);
  }
  /**
   * Decreases the remaining time while the effect is active with one and
   * destroys it if no time left.
   * @memberof Effect
   */
  decreaseTime() {
    // Decrease the time.
    this.time -= 1;

    // If no time left.
    if (this.time < 0) {
      // Stop reacting to the actions of the actor.
      this.actor.events.off('act');

      // Delete this effect from the active effect list of the actor.
      this.actor.removeEffect(this.type);
    }
  }
}
