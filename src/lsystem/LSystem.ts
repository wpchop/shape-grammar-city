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
    rules: {[input: string] : string} = {};
    outputString: LinkedList;

    initRules() {
        this.rules["X"] = "F-[[X]+X]+F[+FX]-X";
        this.rules["F"] = "FF";
        this.rules["A"] = "B[A][A][A]A";
        this.rules["C"] = "B[A][A]A";
        this.rules["D"] = "B[A][A][A][A]A";
        this.rules["B"] = "BB";
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
            let curr = this.axiom.head;
            // debugger;
            while (curr !== null) {
                let currChar: string = curr.symbol;
                let temp = curr.next;
                if (this.rules[currChar] !== undefined) {
                    console.log(currChar);
                    let ruleLL = stringToLinkedList(this.rules[currChar]);
                    curr.symbol = ruleLL.head.symbol;
                    curr.next = ruleLL.head.next;
                    ruleLL.tail.next = temp;
                }
                curr = temp;
            }
            this.expandAxiom(count - 1);
        }
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