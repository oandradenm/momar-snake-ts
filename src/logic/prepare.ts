import { GameState, IGameGrid, Cell } from '../types'
import { HEAD_CELL, BODY_CELL, YOU_HEAD_CELL, EMPTY_CELL, TAIL_CELL, HAZARD_CELL } from "./cellTypes"

function paintSnakes(gameState: GameState, grid: IGameGrid) {
  const myId = gameState.you.id
  gameState.board.snakes
    .filter(snake => myId !== snake.id)
    .forEach(snake => {
      snake.body.forEach((part, index) => {
        if (!index) {
          grid[part.x][part.y].value = 0
          grid[part.x][part.y].type = HEAD_CELL
          grid[part.x][part.y].strength = snake.length
          return
        } else if ((snake.length - 1) === index) {
          grid[part.x][part.y].value = 0
          grid[part.x][part.y].type = TAIL_CELL
        }
        grid[part.x][part.y].value = 0
        grid[part.x][part.y].type = BODY_CELL
        return
      })
    })

  gameState.board.hazards.forEach(hazard => {
          grid[hazard.x][hazard.y].value = 0
          grid[hazard.x][hazard.y].type = HAZARD_CELL
  })

  gameState.you.body.forEach((part, index) => {
    if (!index) {
      grid[part.x][part.y].value = 0
      grid[part.x][part.y].type = YOU_HEAD_CELL
      return
    } else if ((gameState.you.length - 1) === index) {
      grid[part.x][part.y].value = 0
      grid[part.x][part.y].type = TAIL_CELL
    }
    grid[part.x][part.y].value = 0
    grid[part.x][part.y].type = BODY_CELL
    return
  })

  return grid
}

export function paintTheGrid(gameState: GameState) {
  const boardWidth = gameState.board.width
  const boardHeight = gameState.board.height
  // to do something like grid[x][y].value
  let grid: IGameGrid = []

  for (let x = boardWidth; x > 0; x--) {
    const row: Cell[] = []
    for (let y = boardHeight; y > 0; y--) {
      const cell: Cell = { value: 1, type: EMPTY_CELL }
      row.push(cell)
    }
    grid.push(row)
  }

  grid = paintSnakes(gameState, grid)

  for (let y = boardWidth - 1; y > 0; y--) {
    let rowString = ""
    for (let x = 0; x < boardWidth; x++) {
      rowString = rowString + grid[x][y].type
    }
    console.log(rowString)
  }
  // hazards

  return grid
}