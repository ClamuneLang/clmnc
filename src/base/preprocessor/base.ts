import { isAbsolute, join, parse } from "path";
import { Tokenizer } from "../tokenizer/base";
import { isNull } from "../utils/funcs";
import { cwd } from "process";
import { Token } from "../tokenizer/tokens/Token";
import { preprocessorInstructionsKinds } from "../tokenizer/tokens/kinds";

export class Preprocessor {
    constructor (
        public mainFile: string,
        public mainLibDir: string = join(cwd(), "../test/lib"),
        public defines: Record<string, Token[]> = {},
    ) {}

    private visitedFiles = new Set<string>();

    public async normalizeLines(init: Token) {
        let l = 1;
        for (const t of init) {
            t.line = l;
            if (t.kind === "newline" || (t.kind === "hidden" && t.content === '\n')) l++;
        }
    }

    public async preprocess(file: string = this.mainFile) {
        if (!isAbsolute(file)) file = join(cwd(), file);
        const main = await new Tokenizer(file).process();
        this.visitedFiles.add(file);
        if (isNull(main)) return null;

        const link: string[] = [];

        const ws = new Token("whitespace", "", 0, 1, 1, file);
        ws.next = main;
        main.prev = ws;

        for (const t of ws) if (preprocessorInstructionsKinds.includes(t.kind) && [...t.untilPrev("newline")].slice(1).some(x => x.kind !== "whitespace")) t.kind = "hidden";

        for (
        let t =   ws.inChainNext("hashImport");
            t !== null;
            t =   ws.inChainNext("hashImport")
        ) {
            const path = [...t.until("newline")].slice(2);
            if (path.length === 0) {
                t.leaveChainUntil("newline");
                continue;
            }

            const p = path.map(x => x.content).join("");
            const parsed = parse(p);
            let finalPath = "";

            if (!parsed.root) {
                finalPath = (/^\.\.?(?!\.)/.test(parsed.dir)) ?
                    join(file, p) :
                    join(this.mainLibDir, p);
            } else finalPath = p;
            finalPath += ".esp";

            if (this.visitedFiles.has(finalPath)) {
                t.leaveChainUntil("newline");
                continue;
            }

            const tokens = await new Tokenizer(finalPath).process();

            if (isNull(tokens)) {
                t.leaveChainUntil("newline");
                continue;
            }

            (t.leaveChainUntil("newline", ws) ?? ws).nextChain = [...tokens];

            this.visitedFiles.add(finalPath);
        }

        this.normalizeLines(ws);

        let ifLevel: [Token, number][] = [];

        const setunsetifs = ["hashIf", "hashElif",  "hashIfnot",  "hashElifnot", "hashEndif", "hashSet", "hashUnset"] as const;
        for (
        let t = ws.inChainNext(setunsetifs);
            t !== null;
            t = ws.inChainNext(setunsetifs)
        ) {
            const d = [...t.until(2)][1];
            switch (t.kind) {
                case "hashIf": {
                    if (d.kind !== "identifier") throw new SyntaxError(`#if on the line ${d.line} in file ${d.filepath} must have an identifier after space`);
                    const l = ifLevel.at(-1);
                    if (l && l[1] !== 1) ifLevel.push([t, -1]);
                    else ifLevel.push([t, +(d.content in this.defines)]);
                    break;
                }

                case "hashElif": {
                    if (d.kind !== "identifier") throw new SyntaxError(`#elif on the line ${d.line} in file ${d.filepath} must have an identifier after space`);
                    const l = ifLevel.pop();
                    if (!l) throw new SyntaxError(`Unexpected #elif on the line ${d.line} in file ${d.filepath}. Did you mean "#if"?`);
                    if (l[1] === 0) {
                        l[0].leaveChainUntil(t);
                        ifLevel.push([t, +(d.content in this.defines)]);
                    }
                    break;
                }

                case "hashIfnot": {
                    if (d.kind !== "identifier") throw new SyntaxError(`#ifnot on the line ${d.line} in file ${d.filepath} must have an identifier after space`);
                    const l = ifLevel.at(-1);
                    if (l && l[1] !== 1) ifLevel.push([t, -1]);
                    else ifLevel.push([t, +!(d.content in this.defines)]);
                    break;
                }

                case "hashElifnot": {
                    if (d.kind !== "identifier") throw new SyntaxError(`#elifnot on the line ${d.line} in file ${d.filepath} must have an identifier after space`);
                    const l = ifLevel.pop();
                    if (!l) throw new SyntaxError(`Unexpected #elifnot on the line ${d.line} in file ${d.filepath}. Did you mean "#ifnot"?`);
                    if (l[1] === 0) {
                        l[0].leaveChainUntil(t);
                        ifLevel.push([t, +!(d.content in this.defines)]);
                    }
                    break;
                }

                case "hashEndif": {
                    const l = ifLevel.pop();
                    if (!l) throw new SyntaxError(`Unexpected #endif on the line ${d.line} in file ${d.filepath}. Did you mean "#elif"?`);
                    if (l[1] !== 1) l[0].leaveChainUntil(t);
                    break;
                }

                case "hashSet": {
                    if (d.kind !== "identifier") throw new SyntaxError(`#set on the line ${d.line} in file ${d.filepath} must have an identifier after space`);
                    const l = ifLevel.at(-1);
                    t.leaveChainUntil("newline");
                    if (l && l[1] === 1) this.defines[d.content] = [...d.until("newline")].slice(4);
                    break;
                }

                case "hashUnset": {
                    if (d.kind !== "identifier") throw new SyntaxError(`#unset on the line ${d.line} in file ${d.filepath} must have an identifier after space`);
                    const l = ifLevel.at(-1);
                    if (l && l[1] === 1) delete this.defines[d.content];
                    t.leaveChainUntil("newline");
                    break;
                }

                case "hashLink": {
                    link.push([...t.until("newline")].slice(2).map(x => x.content).join(""));
                    t.leaveChainUntil("newline");
                    break;
                }
            }
        }

        for (const l of ifLevel) {
            if (l[1] !== 1) l[0].leaveChainUntil(Infinity);
            l[0].leaveChainUntil("newline");
        }

        for (const t of ws) {
            if (t.kind !== "hidden") continue;
            t.replaceInsertingNext = [...(await Tokenizer.fromContent(t.content))?.until(Infinity) ?? []];
        }

        return ws.next;
    }
}
