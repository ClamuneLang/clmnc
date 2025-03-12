# Clamune
is a middle-level general-purpose programming language with "- CR - RE - EC -" philosofy: *- Code Rapidly - Read Easily - Ensue Compiled*

This language was inspired mostly by CoffeeScript, TypeScript, C++ and C#; (And originally was planning for fun. But now I'm sure it may be a nice language for serious project)

There is the simple syntax and syntax sugar, for sure
Here's simple program - Hello world!

```clmn
#import io

@io.Main()
func main
    io.out "Hello world!";
```

What's happening here? Let's take a look at each line:

`#import io` litteraly tells preprocessor to import "io" library. It inserts the tokenized content of it.
`@io.Main()` calls a decorator in "io" namespace which tells that it is the program entry point.
`func main` is the function declaration which means there are no arguments.
`   io.out "Hello world!";` This is the interesting one. `io.out` here is a function. And if after the function identifier there is a whitespace with arguments (which can be separated with a comma) it is function call; indentation matters as it creates a new scope in declarations

Or another example: Decorator-logger
Let's say we have file `logger.clmn`
```clmn
#import io

decorator Logging(arg: string): func
    io.out arg;
    this();
```

And file `main.clmn`
```clmn
#import ./main

@io.Main()
@Logging("Meow")
func main
    const a = 2;
    const b = a 5; /# b will be 10. Because calling expression for number is implicit multiplying

    io.out "#{b}";
```

Expecting output:
```
Meow
10
```

## Current state
Now clmn version is 33% done. Or to be more precise - Tokenizer/Lexer and Preprocessor. We are going to make next stages: Parser (AST builder), semantic analyzer written by hand, and builder with LLVM

And assuming me, the new one in programing language creation, there may be some mistakes. Feel free to help this project developing, Issues and Pull Requests are open. I hope you will like that language

Here are other examples
```clmn
#import json
#import io

@io.Main()
async main
    io.out await json.stringify
        cats:
            -
                name: "Barsik"
                age: 5
                male: yes
            -
                name: "Chloe"
                age: 3
                male: no
```

Expecting output (without whitespaces):
```
{
    "cats": [
        {
            "name": "Barsik",
            "age": 5,
            "male": true
        },
        {
            "name": "Chloe",
            "age": 3,
            "male": false
        }
    ]
}
```

```clmn
#import io
#import promise

@io.Main()
async main
    const p = new Promise<int> (resolve, reject) ->
        reject "Oops";

    const result1 = await p ? 42; /# Single "?" null-coalescing operator, need double. Otherwise... exception

    const result2 = await p ?? 42; /# Will return 42

    const a: int = null; /# Won't work. Requires "?"
    const b: int? = null;

    const array: (int | float)[] = []; /# And other
```

In total: Yes. Yet another oversyntax-sugared language
