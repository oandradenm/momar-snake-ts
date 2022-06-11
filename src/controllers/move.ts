import { GameState, MoveResponse, IPossibleMoves } from "../types"

import { paintTheGrid } from '..//logic/prepare'
import { 
  evaluateLookAheadCollision, 
  evaluateLookAheadDeadEnd,
  evaluateForSelf, 
  evaluateForOtherSnakes,
  evaluateForWalls,
  evaluateForNeck,
  evaluateLookAhead
} from '..//logic/evaluate'
import { decideMove, decideRankedMove } from '..//logic/decide'

export default function move(gameState: GameState): MoveResponse {
  console.log(`${gameState.game.id} MOVE`)

  let grid = paintTheGrid(gameState)
  let lookAheadDepth = 1

  // let possibleMoves: IPossibleMoves = {
  //   up: true,
  //   down: true,
  //   left: true,
  //   right: true
  // }
  
  // possibleMoves = evaluateForNeck(gameState, possibleMoves)
  // possibleMoves = evaluateForWalls(gameState, possibleMoves)
  // possibleMoves = evaluateForSelf(gameState, possibleMoves)
  // possibleMoves = evaluateForOtherSnakes(gameState, possibleMoves)
  // possibleMoves = evaluateLookAheadCollision(gameState, possibleMoves, grid)
  // possibleMoves = evaluateLookAheadDeadEnd(gameState, possibleMoves, grid)
  const rankedMoves = evaluateLookAhead(gameState, grid, lookAheadDepth)

  console.log("rankedMoves", rankedMoves)

  // const move = decideMove(gameState, possibleMoves, grid)
  const move = decideRankedMove(gameState, rankedMoves, grid)

  const response: MoveResponse = {
    move,
  }

  console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`)
  return response
}