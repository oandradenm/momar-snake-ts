import { GameState } from "../types"

export default function start(gameState: GameState): void {
    console.log(`${gameState.game.id} START`)
}