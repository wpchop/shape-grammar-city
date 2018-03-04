import Turtle from "./Turtle";

class LNode {
    next: LNode;
    prev: LNode;
    symbol: string;
    constructor (symbol: string) {
        this.next = null;
        this.prev = null;
        this.symbol = symbol;
    }
}

// LinkedList class 
class LinkedList {
    head: LNode;
    tail: LNode;
    constructor() {
        this.head = null;
        this.tail = null;
    }
    
    append(node: LNode) {
        if (this.head === null) {
            this.head = node;
        } else {
            this.tail.next = node;
            node.prev = this.tail;
        }
        this.tail = node;
    }
}

class Rule {
    symbol: string;
    map: {[input: string] : number} = {};

    constructor(symbol: string) {
        this.symbol = symbol;   
    }
    
    addRule(nextSymbol: string, p : number) {
        this.map[nextSymbol] = p;
    }

    getNextSymbol() : string {
        let aProb = this.map["A"];
        let bProb = aProb + this.map["B"];
        let cProb = bProb + this.map["C"];
        let dProb = cProb + this.map["D"];
        let rn = Math.random();
        if (rn < aProb) {
            return "A";
        } else if (rn < bProb) {
            return "B";
        } else if (rn < cProb) {
            return "C";
        } else {
            return "D";
        }
    }
}

export function stringToLinkedList(string: string) {
    let link: LinkedList = new LinkedList();
    // console.log(string);
    for (let i = 0; i < string.length; i++) {
        let nextNode: LNode = new LNode(string.charAt(i));
        link.append(nextNode);
    }
    return link;
}

export class LSystem {
    axiom: LinkedList;
    iterations: number;
    rules: {[input: string] : Rule} = {};
    outputString: LinkedList;

    initRules() {
        let baseRule: Rule = new Rule(" ");
        baseRule.addRule("A", 0.25);
        baseRule.addRule("B", 0.25);
        baseRule.addRule("C", 0.25);
        baseRule.addRule("D", 0.25);

        let arule: Rule = new Rule("A");
        arule.addRule("A", 0.2);
        arule.addRule("B", 0.3);
        arule.addRule("C", 0.4);
        arule.addRule("D", 0.1);        

        let brule: Rule = new Rule("B");
        brule.addRule("A", 0.2);        
        brule.addRule("B", 0.2);
        brule.addRule("C", 0.2);
        brule.addRule("D", 0.2);

        let crule: Rule = new Rule("C");
        crule.addRule("A", 0.4);
        crule.addRule("B", 0.1);
        crule.addRule("C", 0.3);
        crule.addRule("D", 0.2);        

        let drule: Rule = new Rule("D");
        drule.addRule("A", 0.4);
        drule.addRule("B", 0);
        drule.addRule("C", 0);        
        drule.addRule("D", 0.6);
        

        this.rules["A"] = arule;
        this.rules["C"] = brule;
        this.rules["D"] = crule;
        this.rules["B"] = drule;
        this.rules[" "] = baseRule;
    }

    constructor(axiom: string, iter: number) {
        this.axiom = stringToLinkedList(axiom);
        this.iterations = iter;
        this.initRules();
        this.outputString = new LinkedList();
    }

    // Expand axiom for number of iterations
    expandAxiom (count: number) {
        if (count === 0) {
            return;
        } else {
            let lastSymbol = " ";
            if (this.axiom.tail.symbol !== null) {
                lastSymbol = this.axiom.tail.symbol;
            }
            let nextSymbol = this.rules[lastSymbol].getNextSymbol();
            let nextNode: LNode = new LNode(nextSymbol);
            this.axiom.append(nextNode);
            count--;
            this.expandAxiom(count);
        }
    }

    getAxiom(count: number) {
        this.axiom = stringToLinkedList(" ");
        this.expandAxiom(count);
        return this.LinkedListToString(this.axiom);
    }

    // mostly for debugging purposes
    LinkedListToString(list: LinkedList) {
        let charArray = [];
        let j = list.head;
        while (j != null) {
            charArray.push(j.symbol);
            j = j.next;
        }
        return charArray.join("");
    }

};

export default LSystem;