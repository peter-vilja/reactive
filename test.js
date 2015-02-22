
/*var e1 = EventStream.of(1);
e1.subscribe(function (e) {console.log(e);});*/

var stream = EventStream.fromEvent('click', document.querySelector('.btn1'));

/*stream.map(function () {
  return 2;
}).filter(function (e) {
  return e >= 2;
}).subscribe(function (e) {
  console.log(e);
});*/

var stream2 = EventStream.fromEvent('click', document.querySelector('.btn2'));

/*var aORb = stream.chain(function () {return stream2;});

aORb.subscribe(function (b) {
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
/*var empty = EventStream.empty();

var both = empty.concat(stream);

var unsubscribe = both.subscribe(function (e) {
  console.log(e);
});

var I = function (a) {
  return function () {
    return a;
  };
};

stream.map(I(1)).merge(stream2.map(I(-1))).scan(function (a, b) {
  return a + b;
}).subscribe(function (a) {
  console.log(a);
});
*/

//stream.throttle(5000).subscribe(function (e) {console.log(e);});

/*
var asd = stream2.debounce(1000).scan(function (a, _) {
  return !a;
}, true);

asd.subscribe(function (a) {
  console.log(a);
});

var b = Behavior.of(1)
var c = b.bufferWithCount(2);
c.subscribe(function (a) {
  console.log(a);
});

b.next(2);
b.next(3);
b.next(4);*/

var add = function (a) {
  return function (b) {
    return a+b;
  }
};
var newCount = stream.scan(function (a, b) {
                        return {newCount: a.newCount + 1}
                        }, {newCount: 0});

var deletedCount = stream2.scan(function (a, b) {
                            return {deletedCount: a.deletedCount + 1}
                            }, {deletedCount: 0});


var a = Behavior.of(function(a) {return function (b) {return [a.newCount, b.deletedCount];}}).ap(newCount).ap(deletedCount);
a.subscribe(function(a) {
  console.log(a);
});
