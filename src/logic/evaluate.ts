import {
  IPossibleMoves,
  GameState,
  IGameGrid,
  Coord,
  IMoveBranch,
  IMoveTree,
} from "../types";
import { HEAD_CELL, EMPTY_CELL, TAIL_CELL, HAZARD_CELL } from "./cellTypes";

function getCoordPossibleMoves(
  gameState: GameState,
  grid: IGameGrid,
  currentCoord: Coord,
  previousCoord: Coord
) {
  const moveOptions = [
    { x: currentCoord.x, y: currentCoord.y + 1, direction: "up" },
    { x: currentCoord.x, y: currentCoord.y - 1, direction: "down" },
    { x: currentCoord.x + 1, y: currentCoord.y, direction: "right" },
    { x: currentCoord.x - 1, y: currentCoord.y, direction: "left" },
  ].filter((moveOption) => {
    return !(
      moveOption.x === previousCoord.x && moveOption.y === previousCoord.y
    );
  }); // make sure we dont consider going backwards.

  const possibleMoves: { x: number; y: number; direction: string }[] = [];
  moveOptions.forEach(({ x, y, direction }) => {
    let cell = null;
    try {
      cell = grid[x][y];
      if (
        cell !== null &&
        (cell.type === EMPTY_CELL || cell.type === TAIL_CELL) &&
        isCellSafe(gameState, grid, { x, y })
      ) {
        possibleMoves.push({ x, y, direction });
      }
    } catch (error) {
      cell = null;
    }
  });

  return possibleMoves;
}

export function evaluateLookAhead(
  gameState: GameState,
  grid: IGameGrid,
  targetDepth: number
) {
  const head = gameState.you.head;
  const neck = gameState.you.body[1];

  let currentDepth = 0;
  let rootTree: IMoveTree[] = [];

  rootTree.push(
    ...getCoordPossibleMoves(gameState, grid, head, neck)
      .map(({ x, y, direction }) => {
        const newBranch = {
          x,
          y,
          direction,
          depth: currentDepth,
          // parentBranch: undefined, parentBranch is left undefined
          moveBranches: [] as IMoveBranch[],
        };
        newBranch.moveBranches = recursivelyDiscoverBranches(
          gameState,
          grid,
          newBranch,
          targetDepth,
          currentDepth
        );
        return newBranch;
      })
      .map((moveBranch) => [moveBranch])
  );

  // sort the directions based on the best way forward.
  // TODO: better way to describe this length concept
  const maxLengthPerTree = rootTree.map((tree) => {
    // each tree has at most 4 branches
    // [2,3,1,0]
    return tree.map((branch) => ({
      direction: branch.direction,
      length: recurseBranchesForLength(branch),
    }))[0];
  });

  console.log("rootTree", rootTree);
  console.log("maxLengthPerTree", maxLengthPerTree);

  maxLengthPerTree.sort((a, b) => {
    if (a.length === b.length) return 0;
    return a.length < b.length ? 1 : -1;
  });

  if (maxLengthPerTree.length && maxLengthPerTree[0].length === 1) {
    console.log("CRASH!");
  }

  return maxLengthPerTree;
}

function recursivelyDiscoverBranches(
  gameState: GameState,
  grid: IGameGrid,
  branch: IMoveBranch,
  targetDepth: number,
  previousDepth: number
) {
  const currentDepth = previousDepth + 1;
  // console.log(`At depth: ${currentDepth} with targetDepth: ${targetDepth} for branch:`, branch)

  if (targetDepth < currentDepth) {
    // console.log('Reached max depth')
    return [];
  }

  const lastCoord = branch.parentBranch
    ? { x: branch.parentBranch.x, y: branch.parentBranch.y }
    : gameState.you.head; // use parentBranch coords or head

  return getCoordPossibleMoves(
    gameState,
    grid,
    { x: branch.x, y: branch.y },
    { x: lastCoord.x, y: lastCoord.y }
  ).map(({ x, y, direction }) => {
    const newBranch = {
      x,
      y,
      direction,
      depth: currentDepth,
      parentBranch: branch,
      moveBranches: [] as IMoveBranch[],
    };
    newBranch.moveBranches = recursivelyDiscoverBranches(
      gameState,
      grid,
      newBranch,
      targetDepth,
      currentDepth
    );
    return newBranch;
  });
}

function recurseBranchesForLength(branch: IMoveBranch) {
  // each branch should have at most 3 of its own branches
  // since the neck/body would be the previous coord

  let subBranchLengths = 0;
  branch.moveBranches.forEach((subBranch) => {
    subBranchLengths += recurseBranchesForLength(subBranch);
  });

  return subBranchLengths + 1; // 1 for itself
}

// Step 3a - Look ahead to see if the next spaces will collide with a snake head
export function evaluateLookAheadCollision(
  gameState: GameState,
  possibleMoves: IPossibleMoves,
  grid: IGameGrid
) {
  const head = gameState.you.head;
  if (possibleMoves.up) {
    possibleMoves.up = isCellSafe(gameState, grid, {
      x: head.x,
      y: head.y + 1,
    });
  }
  if (possibleMoves.down) {
    possibleMoves.down = isCellSafe(gameState, grid, {
      x: head.x,
      y: head.y - 1,
    });
  }
  if (possibleMoves.right) {
    possibleMoves.right = isCellSafe(gameState, grid, {
      x: head.x + 1,
      y: head.y,
    });
  }
  if (possibleMoves.left) {
    possibleMoves.left = isCellSafe(gameState, grid, {
      x: head.x - 1,
      y: head.y,
    });
  }
  return possibleMoves;
}

export function evaluateFood(
  gameState: GameState,
  grid: IGameGrid,
  threshold: number
) {
  if (gameState.you.health > threshold) {
    console.log("not hungry, going to roam instead.");
    return [];
  }
  console.log("HUNGRY! Looking for food!");

  const myHead = gameState.you.head;
  const food = gameState.board.food;

  return food.map((foodCoord) => {
    const directionsToFood: string[] = [];

    const yDist = foodCoord.y - myHead.y;
    const xDist = foodCoord.x - myHead.x;
    if (xDist !== 0) {
      xDist > 0
        ? directionsToFood.push("right")
        : directionsToFood.push("left");
    }
    if (yDist !== 0) {
      yDist > 0 ? directionsToFood.push("up") : directionsToFood.push("down");
    }

    const totalDistance = Math.abs(xDist) + Math.abs(yDist);

    return {
      totalDistance,
      coord: foodCoord,
      directionsToFood,
    };
  });
}

function isCellSafe(gameState: GameState, grid: IGameGrid, targetCell: Coord) {
  // look around the cell, find a head, then compare the snake length to our snake length
  let yourStrength = gameState.you.length;

  const maxWidth = gameState.board.width - 1;
  const maxHeight = gameState.board.height - 1;

  // look left
  let lookAhead =
    targetCell.x > 0 ? grid[targetCell.x - 1][targetCell.y] : null; // make sure its not next to a wall
  if (lookAhead && lookAhead.type === HEAD_CELL) {
    if (lookAhead.strength && lookAhead.strength > yourStrength) return false;
  }

  //look right
  lookAhead =
    targetCell.x < maxWidth ? grid[targetCell.x + 1][targetCell.y] : null;
  if (lookAhead && lookAhead.type === HEAD_CELL) {
    if (lookAhead.strength && lookAhead.strength >= yourStrength) return false;
  }

  // look down
  lookAhead = targetCell.y > 0 ? grid[targetCell.x][targetCell.y - 1] : null; // make sure its not next to a wall
  if (lookAhead && lookAhead.type === HEAD_CELL) {
    if (lookAhead.strength && lookAhead.strength >= yourStrength) return false;
  }

  // look up
  lookAhead =
    targetCell.y < maxHeight ? grid[targetCell.x][targetCell.y + 1] : null;
  if (lookAhead && lookAhead.type === HEAD_CELL) {
    if (lookAhead.strength && lookAhead.strength >= yourStrength) return false;
  }

  return true;
}
