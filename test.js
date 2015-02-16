
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
b.next(4);


// -- Behavior ---------------------

//var behavior = Behavior(R.add(1));
//console.log(behavior.ap(Behavior(2)));


// var b3 = Behavior(2);
// var b4 = b3.map(x => x + 1);
// var filtered = b4.filter(x => x % 2 === 0);
// filtered.fork(log);
// b3.next(9);

// var bf = Behavior(x => y => y + x);
// var b = bf.ap(Behavior(2)).ap(Behavior(3));
// b.fork(log);


// var behavior = Behavior(R.add(1));
// console.log(behavior.ap(Behavior(2)));
// console.log(behavior.ap(Maybe.Just(7)));
//
// var b3 = Behavior(3);
// var b4 = Behavior(4);
// var log = R.curry((a, b) => console.log(a, b));
//
// liftA2(log, b3, b4)
// console.log(liftA2(R.add, b3, b4));

// console.log('-- Applictive algebras ------------------');
//
// var id = function (a) {return a};
// console.log('a.of(function(a) { return a; }).ap(v) is equivalent to v (identity)');
// console.log(Behavior.of(id));
// console.log(Behavior.of(id).ap(Behavior(5)), Behavior(5));
//
// console.log('a.of(f).ap(a.of(x)) is equivalent to a.of(f(x)) (homomorphism)');
// console.log(Behavior.of(id).ap(Behavior.of(3)), Behavior.of(id(3)));
//
// var u = Behavior.of(function (v) { return v + 1; });
// var y = Behavior.of(3);
// console.log('u.ap(a.of(y)) is equivalent to a.of(function(f) { return f(y); }).ap(u) (interchange)');
// console.log(u.ap(y), Behavior.of(function (f) { return f(3); }).ap(u));
//
// console.log('--------------------');
//
// console.log('-- Chain algebras -----------------------');
//
// var addOne = function (value) { return Behavior.of(value + 1); };
// var addTwo = function (value) { return Behavior.of(value + 2); };
// console.log('m.chain(f).chain(g) is equivalent to m.chain(function(x) { return f(x).chain(g); }) (associativity)');
// console.log(Behavior.of(3).chain(addOne).chain(addTwo), Behavior(3).chain(function (x) { return addOne(x).chain(addTwo); }));
//
// console.log('--------------------');
//
// console.log('-- Monad algebras -----------------------');
//
// var bId = function (a) { return Behavior.of(a); };
// console.log('m.of(a).chain(f) is equivalent to f(a) (left identity)');
// console.log(Behavior.of(2).chain(bId), bId(2));
// console.log('m.chain(m.of) is equivalent to m (right identity)');
// console.log(Behavior.of(2).chain(Behavior.of), Behavior.of(2));
//
// console.log('--------------------');
