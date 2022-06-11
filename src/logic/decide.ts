import { IPossibleMoves, GameState, IGameGrid, Coord } from '../types'

import { evaluateFood } from './evaluate'

export function decideMove(gameState: GameState, possibleMoves: IPossibleMoves, grid: IGameGrid ) {
    const safeMoves = Object.keys(possibleMoves).filter(key => possibleMoves[key])

  let moveIndex = -1
  const evaluatedFood : {totalDistance: number, coord: Coord, directionsToFood: string[]}[] = []
  if (gameState.you.length < 15 || gameState.you.health < 33) {
    evaluatedFood.push(...evaluateFood(gameState, grid, 100))
  }


  if (evaluatedFood.length) {
    // if there is food choose the move that reduces distance to food.
    // find closest
    const closestFood = evaluatedFood.sort((a, b) => {
      if (a.totalDistance > b.totalDistance) {
        return 1
      } else {
        return -1
      }
    })[0]

    console.log('closestFood', closestFood)

    closestFood.directionsToFood.forEach(direction => {
      if (moveIndex < 0) {
        moveIndex = safeMoves.indexOf(direction)
      }
    })

    if (moveIndex < 0) {
      console.log('unable to find safe move towards food, defaulting to random safe move')
      moveIndex = Math.floor(Math.random() * safeMoves.length)
    } else {
      console.log(`Headings towards food at ${closestFood.coord} using direction ${safeMoves[moveIndex]}`)
    }

  } else {
    // pick random valid move
    moveIndex = Math.floor(Math.random() * safeMoves.length)
  }

  console.log("moveIndex", moveIndex)

  return safeMoves[moveIndex]
}

export function decideRankedMove(gameState: GameState, rankedMoves: {direction:string, length: number}[], grid: IGameGrid ) {

  const FOOD_RANK_VALUE_THRESHOLD = 1
  
  const evaluatedFood = evaluateFood(gameState, grid, 100)

  const closestFood = evaluatedFood.sort((a, b) => {
      if (a.totalDistance > b.totalDistance) {
        return 1
      } else {
        return -1
      }
    })[0]

  let foodDirection = null
  
  for (let i = 0; i < rankedMoves.length; i++) {
    if (closestFood.directionsToFood.includes(rankedMoves[i].direction)
       && rankedMoves[i].length > FOOD_RANK_VALUE_THRESHOLD) {
      
      foodDirection = rankedMoves[i].direction
      console.log('Found a ranked move towards food!', foodDirection)
    }
  }

  return foodDirection ? foodDirection : rankedMoves[0].direction
}