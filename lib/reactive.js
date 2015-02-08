'use strict';

module.exports = {
  EventStream: EventStream,
  Behavior: Behavior
};

// ** EventStream **************************************************

/**
 * TODO
 *
 * @class
 * @api public
 * @type EventStream :: (a → Void) → EventStream[α, β]
 *
 * EventStream[α, β] <: Functor[α]
 *                    , Chain[α]
 *                    , Applicative[α]
 *                    , Semigroup[α]
 *                    , Monoid[α]
 *                    , Monad[α]
 *
 */

function EventStream(fn) {
  if (!(this instanceof EventStream)) {
    return new EventStream(fn);
  }

  this.observable = new Observable();

  this.returnFn = function () {};

  var _return = function (returnFn) {
    if (returnFn) this.returnFn = returnFn;
  }.bind(this);

  fn(this.observable.next.bind(this.observable), _return);
  return this;
}

/**
 * Constructs a new `EventStream[α, β]` containing the single value `α`.
 *
 * @api public
 * @type of :: a → EventStream[α, β]
 */

EventStream.of = function _of(value) {
  return new EventStream(function (next) {
    next(new Event(value));
  });
};

EventStream.prototype.of = EventStream.of;

/**
 * TODO
 *
 * @api public
 * @type fromEvent :: String → DOMElem → Boolean → EventStream[α, β]
 */

EventStream.fromEvent = function _fromEvent(name, elem, capture) {
  capture = capture || false;
  return new EventStream(function (next, end) {
    var fn = function (e) {
      next(new Event(e));
    };

    elem.addEventListener(name, fn, capture);

    end(function () {
      elem.removeEventListener(name, fn, capture);
    });
  });
};

/**
 * Create an `EventStream[α, β]` from WebSocket
 *
 * @api public
 * @type fromWebSocket :: WebSocket → EventStream[α, β]
 */

EventStream.fromWebSocket = function _fromWebSocket(ws) {
  return new EventStream(function (next, end) {
    var close = function () {
      ws.close();
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
    }
    ws.onmessage = function (e) { next(new Event(e)) };
    ws.onclose = close;
    ws.onerror = close; // TODO EvenStream.throw
    end(close);
  });
};

/**
 * Create an `EventStream[α, β]` from EventSource
 *
 * @api public
 * @type fromEventSource :: EventSource → EventStream[α, β]
 */

EventStream.fromEventSource = function _fromEventSource(es) {
  return new EventStream(function (next, end) {
    var close = function () {
      es.close();
      es.onmessage = null;
      es.onerror = null;
    }
    es.onmessage = function (e) { next(new Event(e)); };
    es.onerror = close;
    end(close);
  });
};

// -- Functor ----------------------------------------------------------

/**
 * Transforms the successful value of the `EventStream[α, β]` using a regular unary
 * function.
 *
 * @api public
 * @type map :: @EventStream[α, β] => (α → γ) → EventStream[γ, β]
 */

EventStream.prototype.map = function _map(fn) {
  var subscribe = this.subscribe.bind(this);
  return new EventStream(function (next) {
    subscribe(function (a) {
      console.log(a);
      next(a.map(fn));
    });
  });
};

// -- Chain ------------------------------------------------------------

/**
 * TODO
 *
 * @api public
 * @type chain :: @EventStream[α, β] => (α → EventStream[γ, β]) → EventStream[γ, β]
 */

EventStream.prototype.chain = function _chain(fn) {
  var subscribe = this.subscribe.bind(this);
  return new EventStream(function (next) {
    subscribe(function (a) {
      fn(a).subscribe(next);
    });
  });
};

// -- Applicative ------------------------------------------------------

/**
 * Applies the event value of the `EventStream[(α → γ), β]` to the
 * value of the `EventStream[α, β]`
 *
 * @api public
 * @type ap :: @EventStream[(α → γ), β] => EventStream[α, β] → EventStream[γ, β]
 */

EventStream.prototype.ap = function _ap(es) {
  return this.chain(function (event) {
    return es.map(event.value);
  });
};

// -- Semigroup --------------------------------------------------------

/**
* TODO
*
* @api public
* @type concat :: @EventStream[α, β] => EventStream[γ, δ] → EventStream[α:γ, β:δ]
*/

EventStream.prototype.concat = function _concat(es) {
  var subscribe = this.subscribe.bind(this);
  return new EventStream(function (next) {
    subscribe(function (a) {
      if (a.isEmpty) es.subscribe.call(es, next);
      else next(a);
    });
  });
};

// -- Monoid -----------------------------------------------------------

/**
* Returns an `EventStream[α, β]` that does not fire events
*
* @api public
* @type empty :: Void → EventStream[α, β]
*/

EventStream.empty = function _empty() {
  return new EventStream(function (next) {
    next(Event.empty());
  });
};

EventStream.prototype.empty = EventStream.empty;

// -- Transformations --------------------------------------------------

/**
 * Return a new filtered `EventStream[γ, β]`
 *
 * @api public
 * @type filter :: @EventStream[α, β] => (α → γ) → EventStream[γ, β]
 */

EventStream.prototype.filter = function _filter(fn) {
  var subscribe = this.subscribe.bind(this);

  return new EventStream(function (next) {
    subscribe(function (a) {
      if (fn(a.value)) next(a);
    });
  });
};

/**
 * TODO
 *
 * @api public
 * @type merge :: @EventStream[α, β] => EventStream[γ, δ] → EventStream[α|γ, β|δ]
 */

EventStream.prototype.merge = function _merge(es) {
  var subscribe = this.subscribe.bind(this);
  return new EventStream(function (next) {
    subscribe(next);
    es.subscribe(next);
  });
};

/**
 * TODO
 *
 * @api public
 * @type scan :: @EventStream[α, β] => (α → β → γ) → α → Behavior(γ)
 */

EventStream.prototype.scan = function _scan(fn, seed) {
  var value = seed;
  var b = new Behavior(value);
  this.subscribe(function (a) {
    if (typeof value !== 'undefined') {
      value = fn(value, a.value);
      b.next(value);
    } else {
      value = a.value;
      b.next(value);
    }
  });
  return b;
};

/**
 * Debounce
 *
 * @api private
 * @type debounce :: α → α
 */

var debounce = function _debounce(wait, fn) {
  var timeout, args, context, timestamp, result;

  var later = function() {
    var last = Date.now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      result = fn.apply(context, args);
      context = args = null;
    }
  };

  return function() {
    context = this;
    args = arguments;
    timestamp = Date.now();
    if (!timeout) timeout = setTimeout(later, wait);
    return result;
  };
};


/*var debounce = function _debounce(wait, fn) {
  var timeout, args, timestamp, result;

  var later = function () {
    var last = Date.now() - timestamp;
    if (last < wait) {
      timeout = setTimeout(later, wait - last);
    } else {
      result = fn.apply(null, args);
      timeout = args = null;
    }
  };

  return function () {
    args = arguments;
    timestamp = Date.now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    return result;
  };
};*/

/**
 * TODO
 *
 * @api public
 * @type debounce :: @EventStream[α, β] => (α → Void) → (Void → Void)
 */

EventStream.prototype.debounce = function _debounce(wait) {
  var subscribe = this.subscribe.bind(this);
  return new EventStream(function (next) {
    subscribe(debounce(wait, next));
  });
};

/**
 * TODO
 *
 * @api public
 * @type subscribe :: @EventStream[α, β] => (α → Void) → (Void → Void)
 */

EventStream.prototype.subscribe = function _subscribe(generator) {
  var observer = new Observer(generator);
  var observable = this.observable;
  observable.addObserver(observer);
  return function () {
    observable.removeObserver(observer);
  };
};

/**
 * TODO
 *
 * @api public
 * @type return :: @EventStream[α, β] => α → Void
 */

EventStream.prototype.return = function _return(value) {
  this.returnFn();
  this.observable.return(new Event(value));
};


// ** Observable **************************************************

/**
 * TODO
 *
 * @class
 * @api private
 * @type Observable :: α → Observable[α]
 */

function Observable(event) {
  this.observers = [];
  this.event = event;
}

/**
 * TODO
 *
 * @api private
 * @type next :: @Observable[α] => α → Void
 */

Observable.prototype.next = function _next(event) {
  this.event = event;
  this.observers.forEach(function (observer) {
    observer.next(event);
  });
};

/**
 * TODO
 *
 * @api private
 * @type addObserver :: @Observable[α] => Observer[β] → Void
 */

Observable.prototype.addObserver = function _addObserver(observer) {
  this.observers.push(observer);
  if (this.event !== null && typeof this.event !== 'undefined') {
    observer.next(this.event);
  }
};

/**
 * TODO
 *
 * @api private
 * @type removeObserver :: @Observable[α] => Observer[β] → Void
 */

Observable.prototype.removeObserver = function _removeObserver(observer) {
  this.observers = this.observers.filter(function (obs) {
    return !obs.equals(observer);
  });
};

/**
 * TODO
 *
 * @api private
 * @type return :: @Observable[α] => α → Void
 */

Observable.prototype.return = function _return(event) {
  if (event) this.next(event);
  this.observers = [];
};


// ** Observer ****************************************************

/**
 * TODO
 *
 * @class
 * @api private
 * @type Observer :: (α → Void)  → Observer[(α → Void)]
 *
 * Observer[α] <: Setoid[(α → Void)]
 *
 */

function Observer(next) {
  this.fn = next;
  this.event = null;
  this.pending = false;
}

// -- Setoid ----------------------------------------------------------

/**
 * TODO
 *
 * @api private
 * @type equals :: @Observer[(α → Void)] => @Observer[(α → Void)] → Boolean
 */

Observer.prototype.equals = function _equals(observer) {
  return this === observer;
};

/**
 * TODO
 *
 * @api private
 * @type next :: @Observer[(α → Void)] => α → Void
 */

Observer.prototype.next = function _next(event) {
  this.event = event;
  if (!this.pending) {
    this.pending = true;
    if (this.pending && !this.cancelled) {
      this.pending = false;
      this.fn.call(null, this.event);
    }
  }
};

/**
 * TODO
 *
 * @api private
 * @type throw :: @Observer[(α → Void)] => Void → Void
 */

Observer.prototype.throw = function _throw() {
  this.cancelled = true;
  //TODO fire cancel event
};

/**
 * TODO
 *
 * @api private
 * @type return :: @Observer[(α → Void)] => α → Void
 */

Observer.prototype.return = function _return(value) {
  this.cancelled = true;
  //TODO fire cancel event
};


// ** Event *******************************************************

/**
 * TODO
 *
 * @class
 * @api private/public
 * @type Event :: (a → Void) → Event[α]
 *
 * Event[α] <: Functor[α]
 */

function Event(value) {
  if (!(this instanceof Event)) {
    return new Event(value);
  }
  this.value = value;
}

/**
 * TODO
 *
 * @api private
 * @type map :: @Event[α] => (α → γ) → Event[γ]
 */

Event.prototype.map = function _map(fn) {
  return new Event(fn(this.value));
};

/**
 * TODO
 *
 * @api private
 * @type empty :: Void → Event[_]
 */

Event.empty = function _empty() {
  return new Event();
};

Event.prototype.empty = Event.empty;

/**
 * TODO
 *
 * @api private
 * @type isEmpty :: @Event[α] => Void → Boolean
 */

Event.prototype.isEmpty = function _isEmpty() {
  return typeof this.value == 'undefined';
};


// ** Behavior ****************************************************

/**
 * TODO
 *
 * @class
 * @api public
 * @type Behavior :: α → Behavior[α]
 *
 * Behavior[α] <: Functor[α]
 *              , Chain[α]
 *              , Applicative[α]
 *              , Monad[α]
 */

function Behavior(value) {
  if (!(this instanceof Behavior)) {
    return new Behavior(value);
  }

  this.observable = new Observable();
  this.observable.next.call(this.observable, value);
  return this;
}

/**
 * Creates a new `Behavior[a]` with given value.
 *
 * @api public
 * @type of :: α -> Behavior[α]
 */

Behavior.of = function _of(value) {
  return new Behavior(value);
};

Behavior.prototype.of = Behavior.of;

// -- Functor ----------------------------------------------------------

/**
 * Transforms the `Behavior[α]` with given function
 *
 * @api public
 * @type map :: @Behavior[α] => (α → γ) → Behavior[γ]
 */

Behavior.prototype.map = function _map(fn) {
  var b = new Behavior();
  this.subscribe(function (a) {
    b.next(fn(a));
  });
  return b;
};

// -- Chain ------------------------------------------------------------

/**
 * Transforms the value of the `Behavior[α]` using a function to a monad.
 *
 * @api public
 * @type chain :: @Behavior[α] => (α → Behavior[γ]) → Behavior[γ]
 */

Behavior.prototype.chain = function _chain(fn) {
  // return fn(this.observable.event);
  var subscribe = this.subscribe.bind(this);
  return new EventStream(function (next) {
    subscribe(function (a) {
      fn(a).subscribe(next);
    });
  });
};

// -- Applicative ------------------------------------------------------

/**
 * Applies the value of the `Behavior[(α → γ)]` to the
 * value of the `Behavior[α]`
 *
 * @api public
 * @type ap :: @Behavior[(α → γ)] => Behavior[α] → Behavior[γ]
 */

Behavior.prototype.ap = function _ap(behavior) {
  return behavior.map(this.observable.event);
};

/**
 * TODO
 *
 * @api public
 * @type next :: @Behavior[α] => α → Void
 */

Behavior.prototype.next = function _next(value) {
  this.observable.next.call(this.observable, value);
};

/**
 * TODO
 *
 * @api public
 * @type subscribe :: @Behavior[α] => (α → Void) → Void
 */

Behavior.prototype.subscribe = function _subscribe(generator) {
  this.observable.addObserver(new Observer(generator));
};

// -- Transformations --------------------------------------------------

/**
 * Filter values and new Behavior
 *
 * @api public
 * @type filter :: @Behavior[α] => (α → γ) → Behavior[γ]
 */

Behavior.prototype.filter = function _filter(fn) {
  var b = new Behavior(); // TODO Behavior should contain some value?
  this.subscribe(function (a) {
    if (fn(a)) b.next(a);
  });
  return b;
};
