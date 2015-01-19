
function EventStream(fn) {
  if (!(this instanceof EventStream)) {
    return new EventStream(fn);
  }

  this.observable = new Observable();

  var _return = function (fn) {
    this.returnFn = fn;
  }.bind(this);

  fn(this.observable.next.bind(this.observable), _return);
  return this;
}

EventStream.prototype.of = function (value) {
  return new EventStream(function (next) {
    next(new Event(value));
  });
};

EventStream.of = EventStream.prototype.of;

EventStream.fromEvent = function (name, elem, capture) {
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
 * Transforms the successful value of the `EventStream[α, β]` using a regular unary
 * function.
 *
 * @summary @EventStream[α, β] => (β → γ) → EventStream[α, γ]
 */

EventStream.prototype.map = function (fn) {
  var fork = this.fork.bind(this);
  return new EventStream(function (next) {
    fork(function (a) {
      next(a.map(fn));
    });
  });
};

/**
 * Transforms the succesful value of the `EventStream[α, β]` using a function to a
 * monad.
 *
 * @summary @EventStream[α, β] => (β → EventStream[α, γ]) → EventStream[α, γ]
 */

EventStream.prototype.chain = function (fn) {
  var fork = this.fork.bind(this);
  return new EventStream(function (next) {
    fork(function (a) {
      fn(a).fork(next);
    });
  });
};

// -- Apply ------------------------------------------------------------

/**
 * Applies the event value of the `EventStream[α, (β → γ)]` to the
 * value of the `EventStream[α, β]`
 *
 * @summary @EventStream[α, (β → γ)] => EventStream[α, β] → EventStream[α, γ]
 */

EventStream.prototype.ap = function (es) {
  return this.chain(function (event) {
    return es.map(event.value);
  });
};

/**
 * Return a new filtered EventStream
 *
 * @summary @EventStream[α, β] => (β → γ) → EventStream[α, β]
 */

EventStream.prototype.filter = function (fn) {
  var fork = this.fork.bind(this);

  return new EventStream(function (next) {
    fork(function (a) {
      if (a.filter(fn)) next(a);
    });
  });
};

/**
 * Selects the earlier of the two  `EventStream[α, β]`
 *
 * @summary @EventStream[α, β] => EventStream[α, β] → EventStream[α, β]
 */

EventStream.prototype.concat = function (es) {
  var fork = this.fork.bind(this);
  return new EventStream(function (next) {
    fork(function (a) {
      if (a.isEmpty) es.fork.call(es, next);
      else next(a);
    });
  });
};

EventStream.prototype.merge = function (es) {
  var fork = this.fork.bind(this);
  return new EventStream(function (next) {
    fork(next);
    es.fork(next);
  });
};

EventStream.prototype.empty = function () {
  return new EventStream(function (next) {
    next(Event.empty());
  });
};

EventStream.empty = EventStream.prototype.empty;

EventStream.prototype.fork = function (generator) {
  var observer = new Observer(generator);
  var observable = this.observable;
  observable.addObserver(observer);
  return function () {
    observable.removeObserver(observer);
  };
};

EventStream.prototype.return = function (value) {
  if (this.returnFn) this.returnFn();
  this.observable.return(new Event(value));
};

function Observable(event) {
  this.observers = [];
  this.event = event;
}

Observable.prototype.next = function (event) {
  this.event = event;
  this.observers.forEach(function (observer) {
    observer.next(event);
  });
};

Observable.prototype.addObserver = function (observer) {
  this.observers.push(observer);
  if (this.event !== null && typeof this.event !== 'undefined') {
    observer.next(this.event);
  }
};

Observable.prototype.removeObserver = function (observer) {
  this.observers = this.observers.filter(function (obs) {
    return !obs.equals(observer);
  });
};

Observable.prototype.return = function (event) {
  if (event) this.next(event);
  this.observers = [];
};

function Observer(next) {
  this.fn = next;
  this.event = null;
  this.pending = false;
}

/** Setoid **/

Observer.prototype.equals = function (observer) {
  return this === observer;
};

Observer.prototype.next = function (event) {
  this.event = event;
  if (!this.pending) {
    this.pending = true;
    if (this.pending && !this.cancelled) {
      this.pending = false;
      this.fn.call(null, this.event);
    }
  }
};

Observer.prototype.throw = function () {
  this.cancelled = true;
  //TODO fire cancel event
};

Observer.prototype.return = function (value) {
  this.cancelled = true;
  //TODO fire cancel event
};

function Event(value) {
  if (!(this instanceof Event)) {
    return new Event(value);
  }
  this.value = value;
}

Event.prototype.map = function (fn) {
  return new Event(fn(this.value));
};

Event.prototype.filter = function (fn) {
  return fn(this.value);
};

Event.prototype.empty = function () {
  return new Event();
};

Event.empty = Event.prototype.empty;

Event.prototype.isEmpty = function () {
  return typeof this.value == 'undefined';
};

function Behavior(value) {
  if (!(this instanceof Behavior)) {
    return new Behavior(value);
  }

  this.observable = new Observable();
  this.observable.next.call(this.observable, value);
  return this;
}

/**
* Creates a new Behavior with given value.
*
* @summary α -> Behavior[α]
*/

Behavior.prototype.of = function (value) {
  return new Behavior(value);
};

Behavior.of = Behavior.prototype.of;

/**
* Transforms the Behavior with given function
*
* @summary @Behavior[α, β] => (β → γ) → Behavior[γ]
*/

Behavior.prototype.map = function (fn) {
  var b = new Behavior();
  this.fork(function (a) {
    b.next(fn(a));
  });
  return b;
};

/**
* Transforms the value of the `Behavior[α, β]` using a function to a monad.
*
* @summary @Behavior[α, β] => (β → Behavior[α, γ]) → Behavior[α, γ]
*/

Behavior.prototype.chain = function (fn) {
  return fn(this.observable.event);
};

/**
* Applies the value of the `Behavior[α, (β → γ)]` to the
* value of the `Behavior[α, β]`
*
* @summary @Behavior[α, (β → γ)] => Behavior[α, β] → Behavior[α, γ]
*/

Behavior.prototype.ap = function (behavior) {
  return behavior.map(this.observable.event);
};


Behavior.prototype.next = function (value) {
  this.observable.next.call(this.observable, value);
};

Behavior.prototype.fork = function (generator) {
  this.observable.addObserver(new Observer(generator));
};

/**
* Filter values and new Behavior
*
* @summary @Behavior[α, β] => (β → γ) → Behavior[α, β]
*/

Behavior.prototype.filter = function (fn) {
  var b = new Behavior();
  this.fork(function (a) {
    if (fn(a)) b.next(a);
  });
  return b;
};
