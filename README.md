# callbag-start-with

[Callbag](https://github.com/callbag/callbag) operator that seeds a source with an initial data output. It works for both listenable and pullable sources.

`npm install callbag-start-with`

Every argument passed in will be emitted to the sink individually, so doing...

```
startWith(1,2,3)(source)
```

...will make the source emit `1`, then `2`, then `3` before the "actual" emits.

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
