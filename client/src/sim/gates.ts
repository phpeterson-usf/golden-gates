import { CCircuitItemWithCoords } from "./base"

export class CAndGate extends CCircuitItemWithCoords {
    numInputs: number
    constructor(key: string, xGrid: number, yGrid: number, numInputs: number) {
        super("and-gate", key, xGrid, yGrid)
        this.numInputs = numInputs
    }
}
