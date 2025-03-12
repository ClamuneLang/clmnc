# In C++
If it is possible, use camelCase in functions, variables; PascalCase in class names; lowercase in namespaces.

Comment namespaces closing brackets; i.e: `} // namespace foo`. In others cases as you wish.
In headers nested namespaces are separated with `::`.

Keywords, such as `public:`, `private:` and `protected:` have the same indentation as the class declaration.

Macros are primarily UPPER_SNAKE_CASE.

K&R style;

i.e:
```cpp
#define FOURTY_TWO 42

namespace qwe::rty {
class Foo {
public:
    int somethingCool = FOURTY_TWO;
}

Foo barFoo() {
    // Code ...
}
} // namespace qwe
```

# In Clamune
Use camelCase in functions, variables; PascalCase in class names, interfaces, types, decorators; lowercase in namespaces.

Semicolon is required. If expression is ended, if it's not non-parens object or array declaration
Indentation, whitespace, newlines matter!

Decorators are written above their targets, except for parameters decorators
Macros are primarily UPPER_SNAKE_CASE
```clmn
#set FOURTY_TWO 42

namespace qwe.rty
    @Bar()
    class Foo(somethingNotCool: int) overloads
        public somethingCool = somethingNotCool + 1;

    barFoo() ->
        42 (7 // FOURTY_TWO);

    const obj =
        qwe: 42
        bar: 32

    const arr =
        -
            name: "Jonh"
            hired: true

        -
            name: #<"UniqueForAnonymous">
            hired: false
```
