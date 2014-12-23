
var stream = EventStream(function (event) {
  event(1);
});

stream.map(function (value) {
  return value + 10;
}).forEach(function (value) {
  console.log(value);
});


var clickStream = EventStream.asEventStream('click', document.querySelector('input'));

clickStream.map(function (e) {
  return 1;
}).map(function (value) {
  return value + 2;
}).forEach(function (value) {
  console.log(value);
});
