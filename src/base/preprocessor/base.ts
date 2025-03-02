import { isAbsolute, join, parse } from "path";
import { Tokenizer } from "../tokenizer/base";
import { isNull } from "../utils/funcs";
import { cwd } from "process";
import { Token } from "../tokenizer/tokens/Token";
import { Opt } from "../utils/types";
import { preprocessorInstructionsKinds } from "../tokenizer/tokens/kinds";

export class Preprocessor {
    constructor (
        public mainFile: string,
        public mainLibDir: string = join(cwd(), "../test/lib"),
        public defines: Record<string, Token[]> = {},
    ) {}

    private visitedFiles = new Set<string>();

    public async preprocess(file: string = this.mainFile) {
        if (!isAbsolute(file)) file = join(cwd(), file);
        const main = await new Tokenizer().process(file);
        this.visitedFiles.add(file);
        if (isNull(main)) return null;

        const ws = new Token("whitespace", "");
        ws.next = main;
        main.prev = ws;

        for (const t of ws) if (preprocessorInstructionsKinds.includes(t.kind) && [...t.untilPrev("newline")].slice(1).some(x => x.kind !== "whitespace")) t.kind = "unknown";

        const insert = async () => {
            mainLoop: for (let t of ws) switch (t.kind) {
                case "hashImport": {
                    let path = [...t.until("newline")].slice(2);

                    if (path.length === 0) {
                        t.leaveChainUntil("newline");
                        break mainLoop;
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
                        break mainLoop;
                    }

                    const tokens = await new Tokenizer().process(finalPath);

                    if (isNull(tokens)) {
                        t.leaveChainUntil("newline");
                        break mainLoop;
                    }

                    let newPrev: Opt<Token> = ws;

                    for (const part of t.until("newline")) newPrev = part.leaveChain(ws);

                    (newPrev ?? ws).nextChain = [...tokens];
                    t = (newPrev ?? ws);

                    this.visitedFiles.add(finalPath);
                    break;
                }

                case "hashSet": {
                    const chain = [...t.until("newline")].slice(2);
                    if (chain[0].kind !== "identifier" || chain[1].kind !== "whitespace") {
                        t.leaveChainUntil("newline");
                        break mainLoop;
                    }

                    this.defines[chain[0].content] = chain.slice(2);
                }

                case "hashUnset": {
                    const chain = [...t.until("newline")].slice(2);
                    if (chain[0].kind !== "identifier") {
                        t.leaveChainUntil("newline");
                        break mainLoop;
                    }

                    delete this.defines[chain[0].content];
                    break;
                }

                // TODO: Add #if and similar into preprocessor
                case "hashIf": {
                    break;
                }

            }
        }

        while (ws.inChainNext(x => preprocessorInstructionsKinds.includes(x.kind))) await insert();

        return ws.next;
    }
}
