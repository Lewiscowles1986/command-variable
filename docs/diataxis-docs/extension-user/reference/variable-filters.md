---
audience: extension-user
diataxis: reference
reading-time: 2 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 2 minutes
# Variable filters

A variable can pass its result through filters, written after the variable
name and separated by `|`.

### Variable Filters

You can pass the result of a variable to 0, 1 or more filters.

The filters are specified after the variable name and possible properties:

* <code>&dollar;{<em>varName</em>|<em>filterName</em>}</code>
* <code>&dollar;{<em>varName</em>:<em>property</em>|<em>filterName</em>}</code>
* <code>&dollar;{<em>varName</em> <em>separator</em> <em>properties</em> <em>separator</em>|<em>filterName</em>}</code>

You can specify 0, 1 or more filters, each separated with `|`. They are applied in the order defined.

The following filters are defined:

* `upperCase` : convert the text to upper case
* `lowerCase` : convert the text to lower case
* `regexEscape` : if you use the variable in a property that is used as a regular expression (like `find` in a `transform`) but you want to search for that text literal it is good to pass it through the `regexEscape` filter. All special characters for a regular expression are escaped.

> [!CAUTION]
> Be aware you **don't create an infinite loop**. To be able to apply a filter all variables need to be resolved until no variable left. A known possibility is `pickStringRemember` with `"rememberTransformed": false` and you want to have the previous picked string but filtered.
> ```jsonc
> {
>   "version": "2.0.0",
>   "tasks": [
>     {
>       "label": "cpp lint",
>       "type": "shell",
>       "command": "cpplint ${input:selectDir}"
>     }
>   ],
>   "inputs": [
>     {
>       "id": "selectDir",
>       "type": "command",
>       "command": "extension.commandvariable.pickStringRemember",
>       "args": {
>         "description": "Which directory to Lint for C++?",
>         "options": [
>           ["Use previous", "${remember:lintPath|upperCase}"], // !!! infinite loop
>           ["All", "all"],
>           ["dir1", "dir1"],
>           ["dir2", "dir2"]
>         ],
>         "key": "lintPath"
>       }
>     }
>   ]
> }
> ```
>
> `dir1` and `dir2` are placeholders and can be in reality as complex as you want and most likely contain some prompt or pick option.
>
> The result of `pickStringRemember` is always the transformed string (all variables resolved). If `"rememberTransformed": false` and you pick the **Use previous** option the remembered value for `lintPath` is `${remember:lintPath|upperCase}` (save the picked value **before** variable resolution). When we now want to resolve the picked value (`${remember:lintPath|upperCase}`) because we want to filter we need `${remember:lintPath}`.
>
> **Solution** always use `"rememberTransformed": true` when you have a **Use previous** option and add the filter to a `${pickStringRemember}` variable:
> ```jsonc
> {
>   "version": "2.0.0",
>   "tasks": [
>     {
>       "label": "cpp lint",
>       "type": "shell",
>       "command": "cpplint ${input:selectDir}"
>     }
>   ],
>   "inputs": [
>     {
>       "id": "selectDir",
>       "type": "command",
>       "command": "extension.commandvariable.transform",
>       "args": {
>         "text": "${pickStringRemember:pickDir|upperCase}",
>         "pickStringRemember": {
>           "pickDir": {
>             "description": "Which directory to Lint for C++?",
>             "options": [
>               ["Use previous", "${remember:lintPath}"],
>               ["All", "all"],
>               ["dir1", "dir1"],
>               ["dir2", "dir2"]
>             ],
>             "key": "lintPath",
>             "rememberTransformed": true
>           }
>         }
>       }
>     }
>   ]
> }
> ```

### Variables in Javascript expression

User [`dvirtz`](https://github.com/rioj7/command-variable/issues/78#issuecomment-1918957939) has found a nice way to use the result of variables in a JavaScript expression and have that as a result.

```json
{
  "id": "uniqueFolder",
  "type": "command",
  "command": "extension.commandvariable.config.expression",
  "args": {
    "expression": "['${workspaceFolder:b.1:nomsg}', '${workspaceFolder:b.2:nomsg}', '${workspaceFolder:b.3:nomsg}'].find(folder => folder != 'Unknown')"
  }
}
```

You don't have to specify the `configVariable` property.
