import { readFile } from "fs/promises";
import { Opt } from "../utils/types";
import { equalize, Kind } from "./tokens/kinds";
import { Token } from "./tokens/Token";
import { capitalize, isNull } from "../utils/funcs";

export class Tokenizer {
    public first: Opt<Token> = null;
    public last:  Opt<Token> = null;

    public push(kind: Kind, content: string) {
        const newToken = new Token(kind, content);
        if (!this.first) this.first = newToken;
        if (this.last) {
            this.last.next = newToken;
            newToken.prev = this.last;
        }
        this.last = newToken;
    }

    public replaceLast(kind: Kind, content: string) {
        if (isNull(this.last)) return;

        this.last.kind = kind;
        if (content) this.last.content = content;
    }

    public replacePossibleKeyword(t: Opt<Token> = this.last) {
        if (isNull(t) || t.kind !== "identifier") return;

        if (t.isKeyword) this.replaceLast(t.content as Kind, t.content);
        else if (t.prev?.kind === "hash") {
            t.prev.kind = ("hash" + capitalize(t.content)) as Kind;
            t.prev.content = "#" + t.content;
            t.prev.next = null;
            this.last = t.prev;
        }
    }

    public lastIs(kind: Kind):     this is { last: Token } { return !isNull(this.last) && this.last.kind === kind;        }
    public lastAre(kinds: Kind[]): this is { last: Token } { return !isNull(this.last) && kinds.includes(this.last.kind); }

    public async process(entryFile: string) {
        const content = await readFile(entryFile, "utf-8");

        if (!content) return null;

        for (const c of content) switch (c) {
            //#region IDENTIFIER
            case 'A':
            case 'B':
            case 'C':
            case 'D':
            case 'E':
            case 'F':
            case 'G':
            case 'H':
            case 'I':
            case 'J':
            case 'K':
            case 'L':
            case 'M':
            case 'N':
            case 'O':
            case 'P':
            case 'Q':
            case 'R':
            case 'S':
            case 'T':
            case 'U':
            case 'V':
            case 'W':
            case 'X':
            case 'Y':
            case 'Z':
            case 'a':
            case 'b':
            case 'c':
            case 'd':
            case 'e':
            case 'f':
            case 'g':
            case 'h':
            case 'i':
            case 'j':
            case 'k':
            case 'l':
            case 'm':
            case 'n':
            case 'o':
            case 'p':
            case 'q':
            case 'r':
            case 's':
            case 't':
            case 'u':
            case 'v':
            case 'w':
            case 'x':
            case 'y':
            //#endregion IDENTIFIER
            case 'z':
                if (this.lastIs("identifier")) this.last.content += c;
                else this.push("identifier", c);
                break;

            //#region DIGIT
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
                case '8':
            //#endregion DIGIT
            case '9':
                if (this.lastAre(["number", "identifier"])) this.last.content += c;
                else this.push("number", c);
                break;

            case '\n':
                this.replacePossibleKeyword();
                if (this.lastIs("backslash")) this.replaceLast("hidden", "\n");
                else this.push("newline", c);
                break;

            case ' ':
            case '\t':
                this.replacePossibleKeyword();
                if (this.lastIs("whitespace")) this.last.content += c;
                else this.push("whitespace", c);
                break;

            case '\\':
                this.replacePossibleKeyword();
                this.push("backslash", c);
                break;

            case "#":
                this.replacePossibleKeyword();
                if      (this.lastIs("slash"))             this.replaceLast("singleLineComment", "/#");
                else if (this.lastIs("singleLineComment")) this.replaceLast("lMultiLineComment", "/##");
                else if (this.lastIs("hash"))              this.replaceLast("hashHash", "##");
                else                                       this.push("hash", c);
                break;

            case '(':
                this.replacePossibleKeyword();
                if (this.lastIs("hash")) this.replaceLast("hashLParens", '#(');
                else this.push("lParens", c);
                break;

            case ')':
                this.replacePossibleKeyword();
                this.push("rParens", c);
                break;

            case '[':
                this.replacePossibleKeyword();
                if (this.lastIs("hash")) this.replaceLast("hashLBracket", '#[');
                else this.push("lBracket", c);
                break;

            case ']':
                this.replacePossibleKeyword();
                this.push("rBracket", c);
                break;

            case '{':
                this.replacePossibleKeyword();
                if (this.lastIs("hash")) this.replaceLast("hashLBrace", '#{');
                else this.push("lBrace", c);
                break;

            case '}':
                this.replacePossibleKeyword();
                this.push("rBrace", c);
                break;

            case '<':
                this.replacePossibleKeyword();
                if (this.lastIs("hash")) this.replaceLast("hashLessThan", "#<");
                else this.push("lessThan", c);
                break;

            case '>':
                this.replacePossibleKeyword();
                if (this.lastIs("minus")) this.replaceLast("thinArrow", "->");
                else this.push("greaterThan", ">");
                break;

            case '.':
                this.replacePossibleKeyword();
                if (this.lastIs("dot"))         this.replaceLast("dotDot", "..");
                else if (this.lastIs("dotDot")) this.replaceLast("dotDotDot", "...");
                else                            this.push("dot", '.');
                break;

            case '=':
                this.replacePossibleKeyword();
                const eq = equalize(this.last?.kind);
                if (isNull(eq)) this.push("equals", '=');
                else this.replaceLast(...eq);
                break;

            case '+':
                this.replacePossibleKeyword();
                if (this.lastIs("plus")) this.replaceLast("plusPlus", "++");
                else                     this.push("plus", c);
                break;

            case '-':
                this.replacePossibleKeyword();
                if (this.lastIs("minus")) this.replaceLast("minusMinus", "--");
                else                      this.push("minus", c);
                break;

            case '*':
                this.replacePossibleKeyword();
                if (this.lastIs("asterisk")) this.replaceLast("asteriskAsterisk", "**");
                else                         this.push("asterisk", c);
                break;

            case '/':
                this.replacePossibleKeyword();
                if (this.lastIs("slash"))         this.replaceLast("slashSlash", "//");
                else if (this.lastIs("hashHash")) this.replaceLast('rMultiLineComment', "##/");
                else                              this.push("slash", c);
                break;

            case '%':
                this.replacePossibleKeyword();
                if (this.lastIs("percent")) this.replaceLast("percentPercent", "%%");
                else                        this.push("percent", c);
                break;

            case '&':
                this.replacePossibleKeyword();
                if (this.lastIs("ampersand")) this.replaceLast("ampAmp", "&&");
                else                          this.push("ampersand", c);
                break;

            case '|':
                this.replacePossibleKeyword();
                if (this.lastIs("pipe")) this.replaceLast("pipePipe", "||");
                else                     this.push("pipe", c);
                break;

            case '@':
                this.replacePossibleKeyword();
                this.push("at", c);
                break;

            case '!':
                this.replacePossibleKeyword();
                this.push("em", c);
                break;

            case '?':
                this.replacePossibleKeyword();
                if (this.lastIs("qm")) this.replaceLast("qmqm", "??");
                else                   this.push("qm", c);
                break;

            case ':':
                this.replacePossibleKeyword();
                this.push("colon", c);
                break;

            case ';':
                this.replacePossibleKeyword();
                this.push("semiColon", c);
                break;

            case ',':
                this.replacePossibleKeyword();
                this.push("comma", c);
                break;

            case '\'':
                this.replacePossibleKeyword();
                this.push("quote", c);
                break;

            case '"':
                this.replacePossibleKeyword();
                this.push("doubleQuote", c);
                break;
        }

        return this.first;
    }
}
