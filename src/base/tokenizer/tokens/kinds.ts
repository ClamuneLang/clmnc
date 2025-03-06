import { isNull } from "../../utils/funcs";
import { Opt } from "../../utils/types";

export const kinds = [
    "unknown",           "whitespace",
    "newline",           "backslash",
    "singleLineComment", "hidden", // For preprocessor
    "lMultiLineComment", "rMultiLineComment",

    "number",
    "identifier",

    // ? Reserved preprocessor instructions
    "hashImport", "hashIf",  "hashElif",  "hashIfnot",  "hashElifnot",
    "hashEndif",  "hashSet", "hashUnset", "hashPragma", "hashLink",

    // ? Misc characters
    "thinArrow", "hash",   "hashHash",  "colon",        "semiColon", "comma",
    "equals",    "em",     "qm",        "qmqm",         "quote",     "doubleQuote",
    "dot",       "dotDot", "dotDotDot", "dotDotEquals", "at",

    // ? Assignment operators
    "plusEq",       "minusEq",   "asteriskEq",       "astAstEq", "slashEq",
    "slashSlashEq", "percentEq", "percentPercentEq", "ampAmpEq", "pipePipeEq", "bNotEq",
    "qmEq",         "qmqmEq",    "bAndEq",           "bOrEq",    "bXorEq",

    // ? Operators
    "plus",      "plusPlus",
    "minus",     "minusMinus",
    "asterisk",  "asteriskAsterisk",
    "slash",     "slashSlash",
    "percent",   "percentPercent",
    "ampersand", "ampAmp",
    "pipe",      "pipePipe",
    "tilde",      "caret",

    // ? Comparison operators
    "equalsEquals", "emEquals",
    "gtOrEquals",   "ltOrEquals",

    // ? Either operators or Parentheses
    "greaterThan", "lessThan",

    // ? Parentheses
    "lParens",     "rParens",
    "lBracket",    "rBracket",
    "lBrace",      "rBrace",
    "hashLParens", "hashLBracket",
    "hashLBrace",  "hashLessThan",


    // ? Reserved keywords
    // ! Do not change the order of If keyword
    // ! And do not use PascalCase in keywords. Only Capitalcase
    "if",         "else",        "when",       "then",      "for",     "do",          "implicit",
    "while",      "unless",      "until",      "for",       "class",   "decorator",   "explicit",
    "extends",    "overloads",   "implements", "interface", "extern",  "constexpr",   "loop",
    "binary",     "commutative", "prefix",     "postfix",   "defer",   "func",        "with",
    "this",       "super",       "const",      "let",       "is",      "isnt",        "not",
    "in",         "using",       "await",      "async",     "switch",  "try",         "catch",
    "finally",    "enum",        "record",     "new",       "break",   "skip",        "goto",
    "step",       "continue",    "return",     "as",        "type",    "constructor",
    "destructor", "get",         "set",        "public",    "private", "protected",
    "abstract",   "final",       "static",     "null",      "true",    "false",
    "yes",        "no",          "on",         "off",
    // ! Please, do not add other enum members below the keywords as they will be interpreted as keywords
] as const;

export type Kind = typeof kinds[number];

export const preprocessorInstructions = [
    "import", "if",  "elif",  "ifnot", "elifnot",
    "endif",  "set", "unset", "pragma",
];
export const preprocessorInstructionsKinds: Kind[] = [
    "hashImport", "hashIf", "hashElif",  "hashIfnot",  "hashElifnot",
    "hashEndif", "hashSet", "hashUnset", "hashPragma", "hashLink"
];

export const keywords = kinds.slice(kinds.indexOf("if"));
export const nonKeywords = kinds.slice(0, kinds.indexOf("if"));

const equalized = {
    equals:           ["equalsEquals",     "==" ],
    qm:               ["qmEq",             "?=" ],
    qmqm:             ["qmqmEq",           "??="],
    minus:            ["minusEq",          "-=" ],
    pipePipe:         ["pipePipeEq",       "||="],
    asterisk:         ["asteriskEq",       "*=" ],
    slash:            ["slashEq",          "/=" ],
    slashSlash:       ["slashSlashEq" ,    "//="],
    percent:          ["percentEq",        "%=" ],
    percentPercent:   ["percentPercentEq", "%%="],
    ampAmp:           ["ampAmpEq",         "&&="],
    asteriskAsterisk: ["astAstEq",         "**="],
    em:               ["emEquals",         "!=" ],
    lessThan:         ["ltOrEquals",       "<=" ],
    greaterThan:      ["gtOrEquals",       ">=" ],
    ampersand:        ["bAndEq",           "&=" ],
    pipe:             ["bOrEq",            "|=" ],
    caret:            ["bXorEq",           "^=" ],
    tilde:            ["bNotEq",           "~=" ],
    dotDot:           ["dotDotEquals",     "..="],
} as Record<Kind, [Kind, string]>;

export const equalize = (kind?: Opt<Kind>): Opt<[Kind, string]> => !isNull(kind) && kind in equalized ? equalized[kind] : null;
