'use strict';
var should = require('should');
var R = require('ramda');
var Maybe = require('data.maybe');
var reactive = require('../lib/reactive');
var Behavior = reactive.Behavior;

var value = function (behavior) { return behavior.observable.event; };
var bEqual = R.curry(function (a, b) { value(a).should.equal(value(b)); });

describe('Behavior should follow fantasy-land\'s laws', function () {
  describe('Applictive algebras', function () {
    it('a.of(function(a) { return a; }).ap(v) is equivalent to v (identity)', function () {
      var v = Behavior(5);
      var x = Behavior.of(R.identity).ap(v);
      bEqual(x, v);
    });

    it('a.of(f).ap(a.of(x)) is equivalent to a.of(f(x)) (homomorphism)', function () {
      var f = R.identity;
      var x = 3;
      var a = Behavior.of(f).ap(Behavior.of(x));
      var b = Behavior.of(f(x));
      bEqual(a, b);
    });

    it('u.ap(a.of(y)) is equivalent to a.of(function(f) { return f(y); }).ap(u) (interchange)', function () {
      var u = Behavior.of(function (v) { return v + 1; });
      var y = 3;
      var a = u.ap(Behavior.of(y));
      var b = Behavior.of(function (f) { return f(y); }).ap(u);
      bEqual(a, b);
    });
  });

  describe('Chain algebras', function () {
    it('m.chain(f).chain(g) is equivalent to m.chain(function(x) { return f(x).chain(g); }) (associativity)', function () {
      var m = Behavior(3);
      var f = function (value) { return Behavior.of(value + 1); };
      var g = function (value) { return Behavior.of(value + 2); };
      var a = m.chain(f).chain(g);
      var b = m.chain(function (x) { return f(x).chain(g); });
      bEqual(a, b);
    });
  });

  describe('Monad algebras', function () {
    it('m.of(a).chain(f) is equivalent to f(a) (left identity)', function () {
      var m = Behavior;
      var a = 2;
      var f = function (a) { return Behavior.of(a); };
      var x = m.of(a).chain(f);
      var y = f(a);
      bEqual(x, y);
    });

    it('m.chain(m.of) is equivalent to m (right identity)', function () {
      var m = Behavior();
      var a = m.chain(m.of);
      var b = m;
      (value(a) === value(b)).should.be.true;
    });
  });
});

describe('Behavior functionality', function () {
  it('should define ap method', function () {
    var b = Behavior(R.add(1));
    var b2 = b.ap(Behavior(2));
    value(b2).should.equal(3);

    b2.next(4);
    value(b2).should.equal(4);

    var x = Behavior.of(R.curry(function (x, y) { return x + y}))
                    .ap(Behavior(2))
                    .ap(Behavior(3));
    var y = Behavior.of(5);
    bEqual(x, y);
  });

  it('should define filter method', function (done) {
    var b = Behavior.of(2);
    var bf = b.filter(function (x) { return x % 2 === 0; });
    bf.subscribe(function (value) {
      (value % 2 === 0).should.be.true;
      if (value === 6) done();
    });
    b.next(3);
    b.next(4);
    b.next(5);
    b.next(6);
  });

  it('should lift value from other containers also', function (done) {
    // var behavior = Behavior(R.add(1));
    // var a = behavior.ap(Behavior(2));
    // var b = behavior.ap(Maybe.Just(2));
    // bEqual(a, b);
    done();
  });

  it('should work with liftA2', function (done) {
    // var b3 = Behavior(3);
    // var b4 = Behavior(4);
    // var log = R.curry((a, b) => console.log(a, b));
    //
    // liftA2(log, b3, b4)
    // console.log(liftA2(R.add, b3, b4));
    done();
  });
});
