import { isNull } from "../../utils/funcs";
import { Opt } from "../../utils/types";
import { keywords, Kind } from "./kinds";

export class Token {
    constructor(
        public kind: Kind,
        public content: string = "",
        public prev: Opt<Token> = null,
        public next: Opt<Token> = null,
    ) {}

    *[Symbol.iterator] () {
        let curr: Opt<Token> = this;

        do yield curr;
        while (curr = curr.next);

        return;
    }

    * until(kind: Kind) {
        let curr: Opt<Token> = this;

        do yield curr;
        while ((curr = curr.next) && curr.kind !== kind);

        return;
    }

    * untilPrev(kind: Kind) {
        let curr: Opt<Token> = this;

        do yield curr;
        while ((curr = curr.prev) && curr.kind !== kind);

        return;
    }

    public leaveChain(prevIfNull?: Opt<Token>) {
        if (isNull(this.prev) && !isNull(prevIfNull)) this.prev = prevIfNull;
        if (!isNull(this.prev)) {
            this.prev.next = this.next;
            if (!isNull(this.next)) this.next.prev = this.prev;
        }
        if (!isNull(this.next)) {
            this.next.prev = this.prev;
            if (!isNull(this.prev)) this.prev.next = this.next;
        }
        return this.prev;
    }

    get isKeyword() {
        return this.kind === "identifier" && keywords.includes(this.content as Kind);
    }

    set nextChain(tokens: Opt<Opt<Token>[]>) {
        if (!tokens || tokens.length === 0) return;
        else if (tokens.length === 1) { this.insertingNext = tokens[0]; return; }
        let curr: Opt<Token> = this;
        for (const t of tokens) if (!isNull(t)) curr = (curr.insertingNext = t);
    }

    set insertingNext(token: Opt<Token>) {
        if (!token) return;
        if (!isNull(this.next)) {
            this.next.prev = token;
            token.next = this.next;
        }
        this.next = token;
        token.prev = this;
    }

    set prevChain(tokens: Opt<Opt<Token>[]>) {
        if (!tokens || tokens.length === 0) return;
        else if (tokens.length === 1) { this.insertingNext = tokens[0]; return; }
        let curr: Opt<Token> = this;
        for (const t of tokens) if (!isNull(t)) curr = (curr.insertingPrev = t);
    }

    set insertingPrev(token: Opt<Token>) {
        if (!token) return;
        if (!isNull(this.prev)) {
            this.prev.next = token;
            token.prev = token;
        }
        this.prev = token;
        token.next = this;
    }

    toString() { this.content; };
    valueOf() { this.content; };
}
