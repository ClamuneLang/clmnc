import { isAbsolute, join, parse } from "path";
import { Tokenizer } from "../tokenizer/base";
import { isNull } from "../utils/funcs";
import { cwd } from "process";
import { Token } from "../tokenizer/tokens/Token";
import { Opt } from "../utils/types";

export class Preprocessor {
    constructor (
        public mainFile: string,
        public mainLibDir: string = join(cwd(), "../test/lib"),
        public defines: Record<string, string> = {},
    ) {}

    private visitedFiles = new Set<string>();

    public async preprocess(file: string = this.mainFile) {
        if (!isAbsolute(file)) file = join(cwd(), file);
        const main = await new Tokenizer().process(file);
        this.visitedFiles.add(file);
        if (isNull(main)) return null;

        const ws = new Token("whitespace", "");

        for (let t of main) {
            switch (t.kind) {
                case "hashImport": {
                    if ([...t.untilPrev("newline")].slice(1).some(x => x.kind !== "whitespace")) continue;
                    let path = [...t.until("newline")].slice(2);

                    if (path.length === 0) continue;

                    const p = path.map(x => x.content).join("");
                    const parsed = parse(p);
                    let finalPath = "";

                    if (!parsed.root) {
                        finalPath = (/^\.\.?(?!\.)/.test(parsed.dir)) ?
                            join(file, p) :
                            join(this.mainLibDir, p);
                    } else finalPath = p;
                    finalPath += ".esp";
                    if (this.visitedFiles.has(finalPath)) continue;
                    const tokens = await new Tokenizer().process(finalPath);
                    if (isNull(tokens)) continue;
                    let newPrev: Opt<Token> = ws;
                    for (const part of t.until("newline")) newPrev = part.leaveChain(ws);
                    (newPrev ?? ws).nextChain = [...tokens];
                    t = (newPrev ?? ws);
                    this.visitedFiles.add(finalPath);
                    break;
                }

                // TODO: implement deep import and other preprocessor instructions
            }
        }

        return ws.next;
    }
}
