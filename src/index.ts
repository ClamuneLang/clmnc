import { Preprocessor } from "./base/preprocessor/base";
import { Tokenizer } from "./base/tokenizer/base";
import { Token } from "./base/tokenizer/tokens/Token";

const t = (t: Token) => {
    let a: string;
    switch (t.kind) {
        case "unknown":
        case "whitespace":
        case "newline":
        case "identifier":
            a = "\x1b[37m"
            break;

        case "number":
            a = "\x1b[31m"
            break;

        case "backslash":
        case "singleLineComment":
        case "lMultiLineComment":
        case "rMultiLineComment":
        case "at":
        case "dot":
        case "dotDot":
        case "dotDotDot":
        case "dotDotEquals":
            a = "\x1b[36m"
            break;
        case "hashImport":
        case "hashIf":
        case "hashElif":
        case "hashIfnot":
        case "hashElifnot":
        case "hashEndif":
        case "hashSet":
        case "hashUnset":
        case "hashPragma":
        case "thinArrow":
        case "hash":
        case "hashHash":
        case "colon":
        case "semiColon":
        case "comma":
        case "equals":
        case "em":
        case "qm":
        case "qmqm":
        case "plusEq":
        case "minusEq":
        case "asteriskEq":
        case "astAstEq":
        case "slashEq":
        case "slashSlashEq":
        case "percentEq":
        case "percentPercentEq":
        case "ampAmpEq":
        case "pipePipeEq":
        case "qmEq":
        case "qmqmEq":
        case "bAndEq":
        case "bOrEq":
        case "bXorEq":
        case "bNotEq":
        case "plus":
        case "plusPlus":
        case "minus":
        case "minusMinus":
        case "asterisk":
        case "asteriskAsterisk":
        case "slash":
        case "slashSlash":
        case "percent":
        case "percentPercent":
        case "ampersand":
        case "ampAmp":
        case "pipe":
        case "pipePipe":
        case "tilde":
        case "caret":
        case "equalsEquals":
        case "emEquals":
        case "gtOrEquals":
        case "ltOrEquals":
        case "greaterThan":
        case "lessThan":
            a = "\x1b[35m"
            break;

        case "lParens":
        case "rParens":
        case "lBracket":
        case "rBracket":
        case "lBrace":
        case "rBrace":
        case "hashLParens":
        case "hashLBracket":
        case "hashLBrace":
        case "hashLessThan":
            a = "\x1b[33m"
            break;

        case "quote":
        case "doubleQuote":
            a = "\x1b[32m"
            break;

        default:
            a = "\x1b[35m";
            break;
        }

    return a + t.content;
}

(async () => {
    const a = await new Preprocessor("../test/helloworld.esp").preprocess();
    if (!a) return;
    for (const b of a) process.stdout.write(t(b));
})();
