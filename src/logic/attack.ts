// import { Battlesnake, GameState, IGameGrid } from "../types";


/**
 * Wall cut off attack
 * 
 * Conditions:
 * 1. You and Enemy are move the same direction
 * 2. Enemy is between You and the wall
 * 3. Enemy is one or more steps moves behind You
 *  3a. Enemy must be smaller if only one step behind
 * 
 */

/**
 *
 * @param gameState
 * @param snake
 * @param grid
 * @param maxEvalDistance
 * @returns
 */
export function parallelToWall(
  // gameState: GameState,
  // snake: Battlesnake,
  // grid: IGameGrid,
  // maxEvalDistance: number
) {
  let direction = "";

  return direction;
}

export function isEnemySquishable() {}


/**
 * Homing Collision
 * 1. You are longer than Enemy
 * 2. Path moves to get to Enemy is less than difference in length
 * 3. Move to collide
 * 
 */