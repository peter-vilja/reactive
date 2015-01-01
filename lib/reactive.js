
function EventStream(fn) {
  if (!(this instanceof EventStream)){
    return new EventStream(fn);
  }

  this.observable = new Observable();
  fn(this.observable.next.bind(this.observable));
  return this;
}

EventStream.fromEvent = function (name, elem) {
  return EventStream(function (event) {
    elem.addEventListener(name, function (e) {
      event(Event(e));
    });
  });
};

EventStream.prototype.forEach = function (generator) {
  this.observable.addObserver(new Observer(generator));
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
  if (this.value !== null && typeof this.value !== 'undefined') {
    observer.next(this.value);
  }
};

function Observer(next) {
  this.fn = next;
  this.value = null;
  this.pending = false;
}

Observer.prototype.next = function (event) {
  this.value = event.value; //TODO do lifting
  if (!this.pending) {
    this.pending = true;
    setTimeout(function () {
      if (this.pending && !this.cancelled) {
        this.pending = false;
        this.fn.call(null, this.value); //TODO do lifting here
      }
    }.bind(this));
  }
};

Observer.prototype.throw = function () {
  this.cancelled = true;
  //TODO
};

Observer.prototype.return = function () {
  this.cancelled = true;
  //TODO
};

function Event(value) {
  if (!(this instanceof Event)){
    return new Event(value);
  }
  this.value = value;
}

Event.prototype.map = function (f) {
  return new Event(f(this.value));
};
