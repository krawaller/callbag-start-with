# callbag-start-with

[Callbag](https://github.com/callbag/callbag) operator that seeds a source with an initial data output. It works for both listenable and pullable sources.

`npm install callbag-start-with`

## example

```js
const merge = require('callbag-merge');
const pipe = require('callbag-pipe');
const startWith = require('callbag-start-with');

const actionStream = pipe(
  merge(submitActions, editActions, someOtherActions, .... ),
  startWith({type: "INIT"})
);
```
