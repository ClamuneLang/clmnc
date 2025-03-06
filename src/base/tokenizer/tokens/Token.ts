import { isNull } from "../../utils/funcs";
import { Opt } from "../../utils/types";
import { keywords, Kind } from "./kinds";

export class Token {
    constructor(
        public kind: Kind,
        public content: string = "",
        public pos: number,
        public fileline: number,
        public line: number,
        public filepath: string,
        public prev: Opt<Token> = null,
        public next: Opt<Token> = null,
        public metadata: Record<string, unknown> = {}
    ) {}

    *[Symbol.iterator] () {
        let curr: Opt<Token> = this;

        do yield curr;
        while (curr = curr.next);

        return;
    }

    * until(data: Token | Kind | number) {
        let curr: Opt<Token> = this;
        let i = 0;
        do yield curr;
        while ((curr = curr.next) && (typeof data === "number" ? (isFinite(i) ? i++ < data : true) : (typeof data === "string" ? curr.kind !== data : curr !== data)));

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

    public leaveChainUntil(until: Token | Kind | number, prevIfNull?: Opt<Token>) {
        let newPrev = prevIfNull;
        for (const t of this.until(until)) newPrev = t.leaveChain(prevIfNull);
        return newPrev;
    }

    public inChainNext(values: readonly Kind[]): Opt<Token>
    public inChainNext(value: Kind): Opt<Token>
    public inChainNext(predicate: readonly Kind[] | Kind | ((x: Token) => boolean)): Opt<Token> {
        const p = typeof predicate === "function"
            ? predicate
            : (typeof predicate === "string"
                ? (x: Token) => x.kind === predicate
                : (Array.isArray(predicate)
                    ? (x: Token) => predicate.includes(x.kind)
                    : (x: Token) => false
                )
            )

        for (const t of this) if (p(t)) return t;
        return null;
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

    set replaceInsertingNext(token: Opt<Token[]>) {
        if (!token || token.length === 0) return;
        const [ f, ...other ] = token;
        ({
            kind: this.kind,
            content: this.content,
            fileline: this.fileline,
            pos: this.pos,
            line: this.line,
            filepath: this.filepath
        } = f);
        this.nextChain = other;
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
