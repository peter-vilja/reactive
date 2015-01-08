/*var e1 = EventStream.of(1);
e1.fork(function (e) {console.log(e);});*/

var stream = EventStream.fromEvent('click', document.querySelector('.btn1'));

/*stream.map(function () {
  return 2;
}).filter(function (e) {
  return e >= 2;
}).fork(function (e) {
  console.log(e);
});*/

var stream2 = EventStream.fromEvent('click', document.querySelector('.btn2'));

/*var aORb = stream.chain(function () {return stream2;});

aORb.fork(function (b) {
  console.log("asd", b);
});*/

/*var bothClicked = function (a) {
  return function (b) {
    console.log('both done', a.x, b.x);
  };
};

var newStream = EventStream.of(bothClicked).ap(stream).ap(stream2);*/

// a.of(function(a) { return a; }).ap(v) is equivalent to v (identity)
//EventStream.of(function(a) {console.log(a);}).ap(stream);

// a.of(f).ap(a.of(x)) is equivalent to a.of(f(x)) (homomorphism)
//EventStream.of(function(a) {console.log(a);}).ap(EventStream.of(2));

// u.ap(a.of(y)) is equivalent to a.of(function(f) { return f(y); }).ap(u) (interchange)
//stream.ap(EventStream.of(3));

var both = stream.concat(stream2);
both.fork(function (e) {
  console.log(e);
});
