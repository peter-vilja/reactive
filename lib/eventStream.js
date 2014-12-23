var handlers = new WeakMap();

function EventStream(fn) {
  var event = EventStream.event();
  fn(event.in.yield);
  return event.out;
}

EventStream.event = function (value, index) {
  var observable = new Observable(value, index);
  var emitter = new EventEmitter();
  var eventStream = Object.create(EventStream.prototype);
  handlers.set(emitter, observable);
  handlers.set(eventStream, observable);
  return {in: emitter, out: eventStream};
};

EventStream.asEventStream = function (name, elem) {
  return EventStream(function (event) {
    elem.addEventListener(name, event);
  });
};

EventStream.prototype.map = function (cb, thisp) {
  var event = EventStream.event();
  this.forEach(function (value, index) {
    event.in.yield(cb.call(thisp, value, index, this), index);
  }, this);
  return event.out;
};

EventStream.prototype.forEach = function (generator, thisp) {
  var observable = handlers.get(this);
  var observers = observable.observers;
  var observer = new Observer(generator, thisp, observable);
  observable.addObserver(observer);
  return observer;
};
