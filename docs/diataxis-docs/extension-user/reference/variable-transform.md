---
audience: extension-user
diataxis: reference
reading-time: 4 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 4 minutes
# The transform variable

Build a custom variable: the result is a `transform` computation over other variables. Transforms can be nested and sequenced with `apply`.

### Variable `transform`

Say you have a command/script that wants a series of numbers and they can be in a single argument. The numbers have to be clean, no other text in between. You also want to be able to select some text in an editor and use that to filter out the numbers.

```json
{
  "version": "0.2.0",
  "tasks": [
    {
      "label": "echo top 2 workspace folder names",
      "type": "shell",
      "command": "myScript",
      "args": [ "${input:numberSequence}" ]
    }
  ],
  "inputs": [
    {
      "id": "numberSequence",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Which number list?",
        "options": [
          "100 200 300",
          "51 99 2",
          ["Use a raw number list", "${transform:removeLeadingTrailingSpaces}"]
        ],
        "rememberTransformed": true,
        "key": "numSeq",
        "transform": {
          "removeLeadingTrailingSpaces": {
            "text": "${transform:nonNumbersToSpace}",
            "find": "^ +| +$",
            "flags": "g",
            "transform": {
              "nonNumbersToSpace": {
                "text": "${pickStringRemember:getRawNumberList}",
                "find": "[^0-9]+",
                "replace": " ",
                "flags": "g",
                "pickStringRemember": {
                  "getRawNumberList": {
                    "description": "Which raw number list?",
                    "options": [
                      "foo 123 bar bar 456      ",
                      "Alice: 10,  Bob: 3",
                      ["Selected text", "${selectedText}"]
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  ]
}
```

The above example can be made more readable with the `apply` property to define a sequence of find-replace operations (we also replace multiple spaces by 1 space)

```json
  "inputs": [
    {
      "id": "numberSequence",
      "type": "command",
      "command": "extension.commandvariable.pickStringRemember",
      "args": {
        "description": "Which number list?",
        "options": [
          "100 200 300",
          "51 99 2",
          ["Use a raw number list", "${transform:rawNumberList}"]
        ],
        "rememberTransformed": true,
        "key": "numSeq",
        "transform": {
          "rawNumberList": {
            "text": "${pickStringRemember:getRawNumberList}",
            "apply": [
              {
                "find": "[^0-9]+",
                "replace": " ",
                "flags": "g",
              },
              {
                "find": "^ +| +$",
                "flags": "g",
              },
              {
                "find": " {2,}",
                "replace": " ",
                "flags": "g",
              }
            ]
            "pickStringRemember": {
              "getRawNumberList": {
                "description": "Which raw number list?",
                "options": [
                  "foo 123 bar bar 456      ",
                  "Alice: 10,  Bob: 3",
                  ["Selected text", "${selectedText}"]
                ]
              }
            }
          }
        }
      }
    }
  ]
```
