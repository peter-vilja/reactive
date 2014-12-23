function Observer(generator, thisp, observable) {
  this.generator = generator;
  this.thisp = thisp;
  this.observable = observable;
  this.value = null;
  this.index = null;
  this.pending = false;
}

Observer.prototype.yield = function (value, index) {
  this.value = value;
  this.index = index;
  this.done = false;
  if (!this.pending) {
    this.pending = true;

    //TODO Lazyness
    this.call();
    //asap(this);
  }
};

Observer.prototype.call = function () {
  if (this.pending && !this.cancelled) {
    this.pending = false;
    this.generator.call(this.thisp, this.value, this.index, this.observable);
  }
};

Observer.prototype.cancel = function () {
  this.observable.cancelObserver(this);
  this.cancelled = true;
};
