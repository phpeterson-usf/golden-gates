import { CCircuitItemWithCoords } from "./base"

export class CInput extends CCircuitItemWithCoords {
    name: string
    value: number
    constructor(key: string, name: string, xGrid: number, yGrid: number, value: number) {
        super("input-io", key, xGrid, yGrid)
        this.name = name
        this.value = value
    }
}

export class COutput extends CCircuitItemWithCoords {
    name: string
    constructor(key: string, name: string, xGrid: number, yGrid: number) {
        super("output-io", key, xGrid, yGrid)
        this.name = name
    }
}
