import { IPossibleMoves, GameState, IGameGrid, Coord, IMoveBranch, IMoveTree } from '../types'
import { HEAD_CELL, EMPTY_CELL, TAIL_CELL, HAZARD_CELL } from "./cellTypes"


// Step 0: Don't let your Battlesnake move back on it's own neck
export function evaluateForNeck(gameState: GameState, possibleMoves: IPossibleMoves) {
  const myHead = gameState.you.head
  const myNeck = gameState.you.body[1]
  if (myNeck.x < myHead.x) {
    possibleMoves.left = false
  } else if (myNeck.x > myHead.x) {
    possibleMoves.right = false
  } else if (myNeck.y < myHead.y) {
    possibleMoves.down = false
  } else if (myNeck.y > myHead.y) {
    possibleMoves.up = false
  }

  return possibleMoves
}

//Step 1 - Don't hit walls.
export function evaluateForWalls(gameState: GameState, possibleMoves: IPossibleMoves) {
  // TODO: 
  const myHead = gameState.you.head

  const boardWidth = gameState.board.width
  const boardHeight = gameState.board.height

  const maxWidth = boardWidth - 1
  const maxHeight = boardHeight - 1

  console.log("myHead", myHead)
  console.log("maxWidth", maxWidth)
  console.log("maxHeight", maxHeight)

  if (maxHeight === myHead.y) {
    possibleMoves.up = false
  }
  if (maxWidth === myHead.x) {
    possibleMoves.right = false
  }
  if (myHead.x === 0) {
    possibleMoves.left = false
  }
  if (myHead.y === 0) {
    possibleMoves.down = false
  }

  return possibleMoves
}

// Step 2 - Don't hit yourself.
export function evaluateForSelf(gameState: GameState, possibleMoves: IPossibleMoves) {
  const myBody = gameState.you.body
  const myHead = gameState.you.head

  myBody.forEach((coordinate) => {
    possibleMoves = evaluateCoordinate(possibleMoves, myHead, coordinate)
  })

  return possibleMoves
}

// Step 3 - Dont Hit Others
export function evaluateForOtherSnakes(gameState: GameState, possibleMoves: IPossibleMoves) {
  const myId = gameState.you.id
  const myHead = gameState.you.head

  const occupiedCoords = gameState.board.snakes
    .filter(snake => myId !== snake.id)
    .reduce((coords, snake) => {
      coords.push(...snake.body)
      return coords
    }, <Coord[]>[])

  occupiedCoords.forEach(coordinate => {
    possibleMoves = evaluateCoordinate(possibleMoves, myHead, coordinate)
  })

  return possibleMoves
}


function hasAnotherMove(grid: IGameGrid, coord: Coord) {
  const moveOptions = [{ x: coord.x, y: coord.y + 1 }, { x: coord.x, y: coord.y - 1 }, { x: coord.x + 1, y: coord.y }, { x: coord.x - 1, y: coord.y }]
  let moves = 0
  moveOptions.forEach(({ x, y }) => {
    let cell = null
    try {
      cell = grid[x][y]
      if (cell !== null && (cell.type === EMPTY_CELL || cell.type === TAIL_CELL)) {
        moves += 1
      }
    } catch (error) {
      cell = null
    }
  })

  return Boolean(moves)
}

export function evaluateLookAheadDeadEnd(gameState: GameState, possibleMoves: IPossibleMoves, grid: IGameGrid) {
  const head = gameState.you.head
  console.log('evaluating possibleMoves for a deadEnd', possibleMoves)
  if (possibleMoves.up) {
    possibleMoves.up = hasAnotherMove(grid, { x: head.x, y: head.y + 1 })
  }
  if (possibleMoves.down) {
    possibleMoves.down = hasAnotherMove(grid, { x: head.x, y: head.y - 1 })
  }
  if (possibleMoves.right) {
    possibleMoves.right = hasAnotherMove(grid, { x: head.x + 1, y: head.y })
  }
  if (possibleMoves.left) {
    possibleMoves.left = hasAnotherMove(grid, { x: head.x - 1, y: head.y })
  }
  return possibleMoves
}

function evaluateCoordinate(possibleMoves: IPossibleMoves, currentCoord: Coord, targetCoord: Coord) {
  const updatedPossibleMoves = { ...possibleMoves }

  if ((currentCoord.x - 1) === targetCoord.x &&
    currentCoord.y === targetCoord.y) {
    updatedPossibleMoves.left = false
  }
  if ((currentCoord.x + 1) === targetCoord.x &&
    currentCoord.y === targetCoord.y) {
    updatedPossibleMoves.right = false
  }
  if ((currentCoord.y + 1) === targetCoord.y &&
    currentCoord.x === targetCoord.x) {
    updatedPossibleMoves.up = false
  }
  if ((currentCoord.y - 1) === targetCoord.y &&
    currentCoord.x === targetCoord.x) {
    updatedPossibleMoves.down = false
  }

  return updatedPossibleMoves
}
