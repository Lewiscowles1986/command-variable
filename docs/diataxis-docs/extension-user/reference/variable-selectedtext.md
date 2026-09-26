---
audience: extension-user
diataxis: reference
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 2 minutes
# The selectedText variable

`${selectedText}` joins the selections of the current editor. With more than
one cursor you can choose the separator and which selections take part.

### Variable `selectedText`

If you only have 1 selection you don't need the properties `separator` and `filterSelection`.

For the [transform](#transform) command you can define the properties `separator` and `filterSelection` in the `args` property of the command.

* `separator` : (Optional) the string used to join the (multi cursor) selections for `${selectedText}`, default (`"\n"`)
* `filterSelection` : (Optional) a JavaScript expression that allows which (multi cursor) selections to use for `${selectedText}`, default (`"true"`) all are selected.<br/>The expression can use the following variables:
    * `index` : the 0-base sequence number of the selection
    * `value` : the text of the selection
    * `numSel` : number of selections (or cursors)

    The `index` is 0-based to make (modulo) calculations easier. The first `index` is 0.

```json
      "args": {
        "text": "${selectedText}",
        "separator": "@-@",
        "filterSelection": "index%2===1",
      }
```

And you can define/overrule the properties by embedding them in the variable:

<code>&dollar;{selectedText <em>separator</em> <em>properties</em> <em>separator</em>}</code>

All _`separator`_'s used in a variable need to be the same.

The _`separator`_ is a string of 1 or more characters that are not part of the a to z alfabet, `|` or `{}`, in regular expression `[^a-zA-Z{}|]+`. Choose a character string that is not used in the values of the _`properties`_ part. If you need to use more than 1 character do not use all the same character, it can lead to non conformant properties description that is still parsed. The reason is that JavaScript does not have non-backtrack greedy quantifiers. Currently the variable is matched with 1 regular expression. This makes everything easy to implement.

The _`properties`_ are the properties you want separated with the _`separator`_ string. Each property is defined as:

<code><em>propertyName</em>=<em>value</em></code>

Everyting between `=` and the next _`separator`_ is the _`value`_

The above example can be written as

```json
      "args": {
        "text": "${selectedText#separator=@-@#filterSelection=index%2===1#}"
      }
```

A few examples of `filterSelection` expressions

* every other **odd** selection : `"filterSelection": "index%2===1"`
* every selection containing `foo` or `bar` : `"filterSelection": "value.match(/foo|bar/)"`
* the before last selection : `"filterSelection": "index===numSel-2"`

You can use multiple `${selectedText}` variables that have different properties:

```json
      "args": {
        "text": "${selectedText#filterSelection=index===3#} ${selectedText#filterSelection=index===1#}"
      }
```
