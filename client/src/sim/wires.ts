import { CCircuitItem } from "./base"

export class CWireSegment {
    x1Grid: number
    y1Grid: number 
    x2Grid: number 
    y2Grid: number
    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1Grid = x1
        this.y1Grid = y1
        this.x2Grid = x2
        this.y2Grid = y2
    }
}

export class CWire extends CCircuitItem {
    segments: CWireSegment[]
    constructor(key: string) {
        super("wire", key)
        this.segments = []
    }
}
