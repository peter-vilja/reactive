'use strict';
var should = require('should');
var R = require('ramda');
var Maybe = require('data.maybe');
var reactive = require('../lib/reactive');
var EventStream = reactive.EventStream;

var equal = R.curry(function (a, b) {
  a.subscribe(function (c) {
    b.subscribe(function (d) {
      c.should.eql(d);
    });
  });
});

describe('EventStream should follow fantasy-land\'s laws', function () {
  describe('Semigroup algebras', function () {
    it('a.concat(b).concat(c) is equivalent to a.concat(b.concat(c)) (associativity)', function () {
      var a = EventStream.of(['a']);
      var b = EventStream.of(['b']);
      var c = EventStream.of(['c']);
      equal(a.concat(b).concat(c), a.concat(b.concat(c)));
    });
  });

  describe('Monoid algebras', function () {
    it('m.concat(m.empty()) is equivalent to m (right identity)', function () {
      var m = EventStream.of(1);
      equal(m.concat(m.empty()), m);
    });

    it('m.empty().concat(m) is equivalent to m (left identity)', function () {
      var m = EventStream.of(2);
      equal(m.empty().concat(m), m);
    });
  });

  describe('Functor algebras', function () {
    it('u.map(function(a) { return a; }) is equivalent to u (identity)', function () {
      var u = EventStream.of(1);
      equal(u, u.map(R.I))
    });

    it('u.map(function(x) { return f(g(x)); }) is equivalent to u.map(g).map(f) (composition)', function () {
      var u = EventStream.of(1);
      var f = R.add(1);
      var g = R.add(2);
      equal(u.map(function (a) { return f(g(a)); }), u.map(f).map(g));
    });
  });

  describe('Apply algebras', function () {
    it('a.map(function(f) { return function(g) { return function(x) { return f(g(x))}; }; }).ap(u).ap(v) is equivalent to a.ap(u.ap(v)) (composition)', function () {
      var a = EventStream.of(function (a) { return a + 1; });
      var u = EventStream.of(function (x) { return x + 1; });
      var v = EventStream.of(2);
      equal(a.map(function (f) {
        return function (g) {
          return function (x) {
            return f(g(x));
          };
        };
      }).ap(u).ap(v), a.ap(u.ap(v)));
    });
  });

  describe('Applictive algebras', function () {
    it('a.of(function(a) { return a; }).ap(v) is equivalent to v (identity)', function () {
      var v = EventStream.of(3);
      equal(EventStream.of(R.I).ap(v), v);
    });

    it('a.of(f).ap(a.of(x)) is equivalent to a.of(f(x)) (homomorphism)', function () {
      var f = function (a) { return a * 5 };
      equal(EventStream.of(f).ap(EventStream.of(5)), EventStream.of(f(5)));
    });

    it('u.ap(a.of(y)) is equivalent to a.of(function(f) { return f(y); }).ap(u) (interchange)', function () {
      var u = EventStream.of(function (a) { return a*a; });
      var y = 3;
      equal(u.ap(EventStream.of(y)), EventStream.of(function (f) { return f(y); }).ap(u));
    });

    it('a.of(y) is equivalent a[y]', function () {
      var u = EventStream.of(5)
      u.should.be.instanceof(EventStream);
      u.subscribe(function (a) {
        a.value.should.equal(5);
      });
    });
  });

  describe('Chain algebras', function () {
    it('m.chain(f).chain(g) is equivalent to m.chain(function(x) { return f(x).chain(g); }) (associativity)', function () {
      var m = EventStream.of(5);
      var f = function (a) { return EventStream.of(a) };
      var g = function (a) { return EventStream.of(a) };
      equal(m.chain(f).chain(g), m.chain(function (x) { return f(x).chain(g) }));
    });
  });

  describe('Monad algebras', function () {
    it('m.of(a).chain(f) is equivalent to f(a) (left identity)', function () {
      var a = 5;
      var f = function (b) { return EventStream.of(b); };
      equal(EventStream.of(a).chain(f), f(a));
    });

    it('m.chain(m.of) is equivalent to m (right identity)', function () {
      var m = EventStream.empty();
      equal(m.chain(m.of), m);
    });
  });
});
