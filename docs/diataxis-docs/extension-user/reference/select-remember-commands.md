---
audience: extension-user
diataxis: reference
reading-time: 12 min
minimum-extension-version: 1.71.0
---

> **Audience:** Extension user · **Reading time:** 12 minutes
# Selection list and prompt commands

These two commands show an input prompt while the task starts and store the
result in the remember store under a key. They are the commands behind the
[`rememberPick` deprecation](deprecations.md).

## pickStringRemember

The command `extension.commandvariable.pickStringRemember` look a lot like the [Input variable `pickString`](https://code.visualstudio.com/docs/editor/variables-reference#_input-variables).

The configuration attributes need to be passed to the command in the `args` attribute.

The command has the following configuration attributes:

* `description` : Shown some context for the input.
* `default` : Value returned if the user does not make a choice.  
  (**Not in Web**) It can contain [variables](variables.md).
* `options` : An array that can contain the following elements:
  * `string` : The label in the pickList and the value returned are this string.
  * <code>[<em>label</em>,<em>value</em>]</code> tuple : The label in the pickList is the first element of the tuple, the second element is the value returned and the description in the pickList.
  * An object with the following attributes:
    * `value` : The value returned when selected.  
      (**Not in Web**) Any [variables](variables.md) are resolved when item is picked.
    * `label` : (Optional) The label to be displayed for the item in the pick list. If not specified, the `value` is used.  
      (**Not in Web**) Any [variables](variables.md) are resolved when pick list is constructed.
    * `description`: (Optional) The description to be used for the item in the pick list.  
      (**Not in Web**) Any [variables](variables.md) are resolved when pick list is constructed.
    * `detail`: (Optional) The detail to be used for the item in the pick list.  
      (**Not in Web**) Any [variables](variables.md) are resolved when pick list is constructed.
    * `picked`: [_boolean_] (Optional) Used in multi pick list. In the **first** show of the list should this item have a check mark (is picked) (default: `false`).
    * `name`: [_string_] (Optional) Used in multi pick list. They are the variables used in the `dependsOn` expressions.  
      It must be a [valid JavaScript variable name](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#variables).
    * `dependsOn`: [_string_] (Optional) Used in multi pick list. It must be a [valid JavaScript expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators) that has a boolean ([ `true` | `false` ]) result. The variables allowed in the expression are the `name`s of items or groups. Here defined on an item it controls if the value of the item is part of the result when it is picked. See [`dependsOn`](select-remember-commands.md#dependson). (default: `true`)

  The _`value`_ can be a string, a [**string manipulation object**](remember.md) or an object with _key_-_value_ pair(s). The _`value`_ of a _key_-_value_ pair can be a string or a string manipulation object. Every _key_-_value_ is stored in the `remember` storage. `pickStringRemember` returns the value from the `remember` storage for the `key` argument of the command (see Example 4). You can override the `key` argument by using a special key in the object. If the object contains the key `__key` its value is used as the key to get a value from the `remember` storage for this object, also when `multiPick` is true (see Example 11).  
  If you only want to store some _key_-_value_ pairs you can set the _`key`_ argument of the command to `"empty"`. The command will then return an empty string (see [`remember`](remember.md) command).  
  A special _`key`_ is `__undefined`. If used any selected option that uses a _key_-_value_ pair(s) object will return `undefined`. This will abort the current task/launch/command, but the remember store is updated.
* `optionGroups` : (Optional) It can be an array or an object. If `optionGroups` is defined the property `options` is ignored.  
  Is it an array it contains option groups with constraint checks.  
  If a group has a constraint the `pickStringRemember` is not accepted until all constraints are met.  
  An option group is an object with the properties:
  * `label` : (Optional) A description of the group shown in the top right of the group (below separator line)
  * `minCount` : [_number_] (Optional) If defined a check is performed if the number of items selected is at least `minCount`, also shown in the top right of the group
  * `maxCount` : [_number_] (Optional) If defined a check is performed if the number of items selected is at most `maxCount`, also shown in the top right of the group
  * `options` : Identical to the `options` property of the `args` attribute
  * `name`: [_string_] (Optional) Used in multi pick list. They are the variables used in the `dependsOn` expressions.  
    It must be a [valid JavaScript variable name](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#variables).
  * `dependsOn`: [_string_] (Optional) Used in multi pick list. It must be a [valid JavaScript expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators) that has a boolean ([ `true` | `false` ]) result. The variables allowed in the expression are the `name`s of items or groups. Here defined on a group it controls if the group validation is performed and if the value of the group items is part of the result when it is picked. See [`dependsOn`](select-remember-commands.md#dependson). (default: `true`)
  * `key`, `separator`, `joinByKey` : (Optional) If you want to remember the picked items of a group in a different remember store item define these properties in the group. They have the same meaning as for the top `args`  property. They are not inherited from the top `args` property (see Example 13).
  * `fileName` : (**Not in Web**) Identical to the `fileName` property of the `args` attribute.
  * `fileFormat` : (**Not in Web**) Identical to the `fileFormat` property of the `args` attribute.
  * `pattern` : (**Not in Web**) Identical to the `pattern` property of the `args` attribute.
  * `jsonOption` : (**Not in Web**) Identical to the `jsonOption` property of the `args` attribute.

  Is it an object it will construct the array of option groups the same way it loads `options` from a file. (see Example 14)  
  It can have the following properties:
  * `fileName` : (**Not in Web**) A string, with possible [variables](variables.md), specifying a file path that contains option groups. The file is assumed to have an UTF-8 encoding. The format of the file is determined by the `fileFormat` property.
  * `fileFormat` : (**Not in Web**) [_string_] (Optional) How should the file content be processed. (default: `json` )  
    Possible values:
    * `load` : the file content is an array in JSON format that contains option groups.
    * `json` : use the `jsonOptionGroup` property
  * `jsonOptionGroup` : (**Not in Web**) (Optional) An object that is a template for an option group but the values of the properties can be taken from the `fileName` with JavaScript expressions. This constructs the `optionGroups` property array with as many entries as there are in the target array of the file. It works the same as the `jsonOption` property of the `args` attribute.

  The loaded or constructed option groups can contain `fileName`, ... properties to load options from a file.
* `addLabelToTop` : [_string_] (Optional) Any [variables](variables.md) are resolved. The pickItem with the identical label will be put on top. If needed add an extra remember item (see Example 7).
* `key` : (Optional) Used to store and retrieve a particular pick. (default: `pickString` )  
  The value can later be retrieved with the [`remember`](remember.md) command or [`${remember}`](variable-remember.md) variable.
* `separator` : [_string_] (Optional) If multiple items are picked (`multiPick`) the values are concatenated with this string (default: `" "`)
* `multiPick` : [ `true` | `false` ] (Optional) If `true` you can pick multiple items. The values of the items are joined (concatenated) with the property `separator` string. The selected items are remembered persistent, `multiPickStorage`. (default: `false`)
* `joinByKey` : [ `true` | `false` ] (Optional) If `multiPick` is `true` you can determine what happens if the values are objects with key-value pairs. If `false` each objects key-value pairs are put in the remember storage and the value for this picked item is determined by `key` (or `__key` in the object). If `true` the objects are joined (concatenated) by key with the property `separator` string. And these new key-value pairs are put in the remember storage. See Example 12. (default: `false`)
* `multiPickStorage` : [ `"global"` | `"workspace"` ] (Optional) If `multiPick` is `true` the picked items are remembered and stored persistent. This property determines if that is done global or for the current workspace. Using the property `key`. (default: `"workspace"`)
* `rememberTransformed` : (**Not in Web**) if _`value`_ contains variables they are transformed in the result of the command. If `true` we store the transformed string. If `false` we store the _`value`_ string as given in the `options` property. (default: `false` )
* `fileName` : (**Not in Web**) A string, with possible [variables](variables.md), specifying a file path that contains additional options. The options in the file are appended to the already specified `options`. The file is assumed to have an UTF-8 encoding. The format of the file is determined by the `fileFormat` property.
* `fileFormat` : (**Not in Web**) [_string_] (Optional) How should the file content be processed. (default: `pattern` )  
  Possible values:
  * `pattern` : use the `pattern` property
  * `json` : use the `jsonOption` property
* `pattern` : (**Not in Web**) An object describing a line to match in the file containing the _label_ and optional _value_ of the option. Optional if all attributes have the default value.  
  The object has the following attributes:
  * `regexp` : (Optional) A regular expression describing a line with capture groups for the _label_, _value_ and _option_ strings for the option. (default: `^(.*)$` )
  * `flags` : (Optional) The flags to be used in the regular expression, like `gimsy`, default (`""`)
  * `label`: (Optional) A string containing capture group references <code>&dollar;<em>n</em></code> (like `$1`) that makes up the _label_ in the pickList. (default: `$1` )
  * `value`: (Optional) A string containing capture group references <code>&dollar;<em>n</em></code> (like `$1`) that makes up the _value_ in the pickList. (default: the same as `label`)
  * `json`: (Optional) A string containing a capture group reference <code>&dollar;<em>n</em></code> (like `$1`) that makes up the _value_ object in the pickList. You have to write the `regexp` to recognize a possible JSON object string.
  * `match`: (Optional) How should the `regexp` be applied. (default: `"line"` )  
    Possible values:  
    * `line` : the file content is parsed line by line and the `regexp` is used to create an option if a match is found.
    * `find` : the file content is searched for all matches of `regexp` and any match is used to create an option. You have to use the `g` flag otherwise only 1 match is found. To be used for multi line options.
    * `split` : the file content is split using `split-regexp`. Every split that has a match for `regexp` is used to create an option. To be used for multi line options.
  * `split-regexp` : (Optional) A regular expression describing where to split the file content. The start of a match is used to split the file content. The matched text is part of the next split. You have to use the `g` flag otherwise only 1 match is found. If you use `^` and/or `$` you have to use the `m` flag. If set `match` is set to `split`. If you split with `/^/gm` you get an infinite loop, use `"match": "line"`.
  * `split-flags` : (Optional) The flags to be used in `split-regexp`, like `gimsy`, default (`"gm"`)
  * `option`: (Optional) In the `options` array you can specify an option in multiple ways. The `option` property can be any of those alternatives but the strings contain capture group references <code>&dollar;<em>n</em></code> (like `$1`) as found by searching the `regexp`. If `option` specified the properties `label`, `value` and `json` are ignored.  
  A possible attribute of `option` is `json`. If specified and the resulting string is non empty, the string is parsed as a JSON object string and the result is set as the property `value`.  
  See a [complete example where you select an SSH server](select-remember-examples-3.md#select-server-from-pattern).
* `jsonOption` : (**Not in Web**) In the `options` array you can specify an option in multiple ways. The `jsonOption` property is a template for any of those alternatives but the strings are JavaScript expressions that gets the value you want from the variable `content`. The variable `content` is the parsed JSON file. You can even use the _`value`_ as object with _key_-_value_ pair(s). The expressions **must** use the variable `__itemIdx__` to address an item in some array of the JSON file. The expression can manipulate the retieved data in any way.  
  As an example you can concatenate multiple items from different arrays:  
      `content.Array1[__itemIdx__].p1+'-'+content.Array2[__itemIdx__].p2`  
  Or you can iterate over the keys of an object:  
      `Object.keys(content.servers)[__itemIdx__]`  
  The maximum number of items read is 10000. To prevent an infinite loop if expressions contain an error.  
  The JSON file can contain comments and trailing commas.  
  See a [complete example where you select a server](select-remember-examples-2.md#select-server-from-json) and Example 12 for a usage in a multi pick list.  
  The Javascript expression strings can contain variables. The template variables are resolved once before the template is used in a loop to construct all the options. The properties for these variables are stored as siblings of the `jsonOption` property. Use remember variables if you need the result of a pickStringRemember multiple times in the template.  
  Example 15 uses a pickStringRemember variable to choose a key and then construct a pickString with the elements of the array for that key.
* [`checkEscapedUI`](../explanation/cancelled-inputs-and-compound-tasks.md) : (Optional) [ `true` | `false` ] Check if in a compound task/launch a previous UI has been escaped, if `true` behave as if this UI is escaped. This will not start the task/launch. (default: `false`)

(**Not in Web**) The `value` string can contain [variables](variables.md), so you can add a pickFile or promptString or .... and use that result.  
&nbsp;&nbsp;&nbsp;&nbsp;`["pick directory", "${pickFile:someDir}"]`

If you Escape the UI and a `default` property is given the UI is not marked as Escaped.  
(**Not in Web**) If the `default` property contains variables that have a UI they can be Escaped and that will be remembered.

The `name` and `label` properties in `options` and `optionGroups` must be unique for this `pickStringRemember`.

### `dependsOn`

The `dependsOn` property of a group or pick item is a [valid JavaScript expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators) that has a boolean ([ `true` | `false` ]) result. The variables allowed in the expression are the `name`s of items or groups.

The value of these `name`-variables is the selection count in the group (`0` ... `N`) and for a named pick item it is `0` or `1` depending if it is picked.

The value of the `name`-variables is only calulated once. At the moment of accepting the pickString picked items. If an item in a group is picked but it `dependsOn` expression results in `false` the item is still counted in the group selection count. Otherwise the value of the `name`-variables change by evaluating `dependsOn` expressions that use the value of `name`-variables. Will that eventually converge to a stable situation in all cases?

In boolean expressions the number `0` is treated falsy and any other number is treated truthy.

If groupA has a `dependsOn` with referring to groupB that has a `dependsOn` on _`nameC`_ you must include the `dependsOn` expression of groupB in the groupA's `dependsOn` expression:

`"dependsOn": "((nameC) && groupB)"`

`()` around single variables can be removed. In this example all `()`'s can be removed.

## promptStringRemember

`extension.commandvariable.promptStringRemember` has the same configuration attributes as the [Input variable promptString](https://code.visualstudio.com/docs/editor/variables-reference#_input-variables).
`extension.commandvariable.promptStringRemember` also has the configuration attributes:
* `key` : (Optional) It is used to store and retrieve a particular entered string. (default: `promptString` )
* [`checkEscapedUI`](../explanation/cancelled-inputs-and-compound-tasks.md) : (Optional) [ `true` | `false` ] Check if in a compound task/launch a previous UI has been escaped, if `true` behave as if this UI is escaped. This will not start the task/launch. (default: `false`)


The configuration attributes need to be passed to the command in the `args` attribute. The **`key`** attribute is optional if you only have one prompt to remember or every prompt can use the same **`key`** name.

If you have given a `key` attribute the Input Box will be prefilled with:

* first call in session: the default value
* next call in session: the previous value

The string can later be retrieved with the [`remember`](remember.md) command or variable.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Task 1",
      "type": "shell",
      "command": "dostuff1",
      "args": ["-p", "${input:promptPath}"]
    },
    {
      "label": "Task 2",
      "type": "shell",
      "command": "dostuff2",
      "args": ["-p", "${input:rememberPath}"]
    },
    {
      "label": "Do Task 1 and 2",
      "dependsOrder": "sequence",
      "dependsOn": ["Task 1", "Task 2"],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "promptPath",
      "type": "command",
      "command": "extension.commandvariable.promptStringRemember",
      "args": {
        "key": "path",
        "description": "Enter a path"
      }
    },
    {
      "id": "rememberPath",
      "type": "command",
      "command": "extension.commandvariable.remember",
      "args": { "key": "path" }
    }
  ]
}
```

## Worked examples

The fifteen worked examples for `pickStringRemember` live on their own page:

[Selection list examples](select-remember-examples.md)
