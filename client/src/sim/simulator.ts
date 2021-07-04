import { CCircuit, CCircuitItem } from "./base";

// CSimEndpoint represents one individual input or output of a circuit item
class CSimEndpoint {
    item: CCircuitItem
    which: number
    constructor(item: CCircuitItem, which: number) {
        this.item = item
        this.which = which
    }
}

// CSimSegment represents a pair of CSimEndpoints which are geometrically
// connected by a CWire
class CSimSegment {
    src: CSimEndpoint
    dst: CSimEndpoint
    constructor(src: CSimEndpoint, dst: CSimEndpoint) {
        this.src = src
        this.dst = dst
    }
}

/* CSimulator runs the simulation by
    1. deriving endpoints
    2. matching segments
    3. looping over segments which have pending output to propagate

   This simulation is oblivious to propagation delay
*/
export class CSimulator {
    makeSegments(items: CCircuitItem[]): CSimSegment[] {
        let segments: CSimSegment[] = []
        
        return segments
    }

    findInputKeys(): CCircuitItem[] {
        let inputKeys: CCircuitItem[] = []
        return inputKeys
    }

    start(circuit: CCircuit) {
        console.log("CSimulator start")
        const segments = this.makeSegments(circuit.items)
    }

    stop() {
        console.log("CSimulator stop")
    }
}