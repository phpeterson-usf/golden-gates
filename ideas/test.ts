// Welcome to the TypeScript Playground, this is a website
// which gives you a chance to write, share and learn TypeScript.

// You could think of it in three ways:
//
//  - A place to learn TypeScript in a place where nothing can break
//  - A place to experiment with TypeScript syntax, and share the URLs with others
//  - A sandbox to experiment with different compiler features of TypeScript

enum Kind {
    AndGate,
    OrGate,
    NotGate,
}

interface Simulatable {
    Simulate(): number;
}

class Base {
    id: string;
    kind: Kind;
    value: number;

    constructor(id: string, kind: Kind) {
        this.id = id;
        this.kind = kind;
        this.value = 0;
    }
}

class AndGate extends Base implements Simulatable {
    numInputs: number;
    numDataBits: number;

    constructor(id: string, numInputs: number, numDataBits: number) {
        super(id, Kind.AndGate);
        this.numInputs = numInputs;
        this.numDataBits = numDataBits;
    }

    Simulate(): number {
        return 0;
    }

    static fromJSON(jo: AndGate): AndGate {
        return new AndGate(jo.id, jo.numInputs, jo.numDataBits);
    }
}

const g = new AndGate("temp id", 2, 1);
const s = JSON.stringify(g);
console.log(s);
const jo:AndGate = JSON.parse(s);
jo.id = "DB ID";
const g2 = AndGate.fromJSON(jo);
console.log(JSON.stringify(g2));
console.log(g2.Simulate());