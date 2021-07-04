import { gridSize } from "../constants"

export class CSimState {
    simulating: Boolean
    constructor(simulating: Boolean) {
        this.simulating = simulating
    }
}

export class CCircuitItem {
    kind: string
    key: string

    constructor(kind: string, key: string) {
        this.kind = kind
        this.key = key
    }
}

export class CCircuitItemWithCoords extends CCircuitItem  {
    xGrid: number
    yGrid: number
    constructor(kind: string, key: string, xGrid: number, yGrid: number) {
        super(kind, key)
        this.xGrid = xGrid
        this.yGrid = yGrid
    }
    xPix() {
        return this.xGrid * gridSize
    }
    yPix() {
        return this.yGrid * gridSize
    }
}

export class CCircuit {
    name: string
    id: string
    items: CCircuitItem[]
    constructor(name: string, id: string) {
        this.name = name
        this.id = id
        this.items = []
    }
}

