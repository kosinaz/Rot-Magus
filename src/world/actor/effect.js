/**
 * Represents the temporary impact of an Actor's action upon the same or a
 * different Actor. It can modify his stats, his behavior, or the way how the
 * the engine will handle him during his next action.
 * @export
 * @class Effect
 */
export class Effect {
  /**
   * Creates an instance of Effect.
   * @param {Actor} bearer - The Actor under the Effect.
   * @param {string} type - The effectTypes.json typename of the Effect.
   * @memberof Effect
   */
  constructor(bearer, type) {
    // Set the bearer.
    this.bearer = bearer;

    // Get the configuration of the Effect from the preloaded effectTypes.json.
    this.config = this.cache.json.get('effectTypes')[type];

    // Set the expiration time based on the configuration of the Effect.
    this.time = this.config.time;

    // Every time when it is the bearer's turn to act, decrease the remaining
    // time of the Effect.
    this.bearer.events.on('act', this.decreaseTime, this);
  }

  /**
   * Decreases the remaining time while the Effect is active with one and
   * removes it if no time left.
   * @memberof Effect
   */
  decreaseTime() {
    // Decrease the time.
    this.time -= 1;

    // If no time left.
    if (this.time < 0) {
      // Stop reacting to the actions of the bearer.
      this.bearer.events.off('act', this.decreaseTime, this);

      // Delete this Effect from the Effects of the bearer.
      this.bearer.effects.remove(this.type);
    }
  }
}
