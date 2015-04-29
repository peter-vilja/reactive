# Reactive

A small monadic functional reactive library.

Exposes two Types
  - EventStream
  - Behavior

### Example

```js
var downs = EventStream.fromEvent('mousedown', document.body);
var ups = EventStream.fromEvent('mouseup', document.body);
var moves = EventStream.fromEvent('mousemove', document.body);
var clicks = downs.merge(ups);

clicks
  .merge(moves)
  .map(function (e) { return e.target; })
  .subscribe(function (e) {
    console.log(e);
  });
```
