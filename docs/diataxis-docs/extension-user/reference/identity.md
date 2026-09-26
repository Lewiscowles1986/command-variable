---
audience: extension-user
diataxis: reference
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 2 minutes
# Identity and platform commands

## UUID

The commands `extension.commandvariable.UUID` and `extension.commandvariable.UUIDInEditor` generate a v4 UUID.

It has the following arguments:

* `output` : can change the output format (default: `hexString`):

    * `hexString` : `a0e0f130-8c21-11df-92d9-95795a3bcd40`
    * `hexNoDelim` : `a0e0f1308c2111df92d995795a3bcd40`
    * `bitString` : `101000001110000 ... 1100110101000000`
    * `urn` : `urn:uuid:a0e0f130-8c21-11df-92d9-95795a3bcd40`

* `use` : which UUID to use (default: `new`):
    * `new` : generate a new UUID
    * `previous`, `prev` : use the previous generated UUID

In this example the 3 printed UUIDs are all different

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "echo UUIDs",
      "type": "shell",
      "command": "echo",
      "args": [
        "${command:extension.commandvariable.UUID}",
        "${input:uuid-hexnodelim}",
        "${input:uuid-urn}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "uuid",
      "type": "command",
      "command": "extension.commandvariable.UUID"
    },
    {
      "id": "uuid-hexnodelim",
      "type": "command",
      "command": "extension.commandvariable.UUID",
      "args": { "output": "hexNoDelim" }
    },
    {
      "id": "uuid-urn",
      "type": "command",
      "command": "extension.commandvariable.UUID",
      "args": { "output": "urn" }
    },
    {
      "id": "uuid-bits",
      "type": "command",
      "command": "extension.commandvariable.UUID",
      "args": { "output": "bitString" }
    }
  ]
}
```

## Platform separators

* `extension.commandvariable.dirSep` : Directory separator for this platform. '\\' on Windows, '/' on other platforms
* `extension.commandvariable.envListSep` : Environment variable list separator for this platform. ';' on Windows, ':' on other platforms

## Related pages

- [Platform differences](platform-differences.md)
