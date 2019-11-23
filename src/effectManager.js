import {Effect} from './effect';

/**
 * Represents a tool to handle the Effects of an Actor.
 * @export
 * @class EffectManager
 */
export class EffectManager {
  /**
   * Creates an instance of EffectManager.
   * @param {Actor} bearer - The Actor under the Effects.
   * @memberof EffectManager
   */
  constructor(bearer) {
    // Set the bearer.
    this.bearer = bearer;

    // Initialize the collection of active Effects.
    this.effects = {};
  }

  /**
   * Adds the specified Effect to the bearer or updates it to reset the
   * remaining time.
   * @param {string} type - The effectTypes.json typename of the Effect.
   * @memberof Actor
   */
  add(type) {
    // Add a new Effect or update the existing one with a new one.
    this.effects[type] = new Effect(this.bearer, type);
  }

  /**
   * Returns true if the bearer currently has the specified Effect.
   * @param {string} type - The effectTypes.json typename of the Effect.
   * @return {boolean} - True if the bearer has the Effect.
   * @memberof Actor
   */
  has(type) {
    // Return true if the specified Effect is part of the active Effects.
    return type in this.effects;
  }

  /**
   * Removes the specified Effect from the bearer.
   * @param {string} type - The effectTypes.json typename of the Effect.
   * @memberof Actor
   */
  remove(type) {
    // Remove the reference to the Effect.
    this.effects[type] = null;
  }
}
