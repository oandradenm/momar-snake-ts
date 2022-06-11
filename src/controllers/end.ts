import { GameState } from "../types"


export default function end(gameState: GameState): void {
    console.log(`${gameState.game.id} END\n`)
}