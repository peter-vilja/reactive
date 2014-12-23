function Observable(value, index) {
  this.observers = [];
  this.value = value;
  this.index = index;
  this.active = false;
}

Observable.prototype.yield = function (value, index) {
  this.value = value;
  this.index = index;
  if (!this.active) {
    return;
  }
  var observers = this.observers;
  var observerIndex = observers.length;
  while (observerIndex--) {
    observers[observerIndex].yield(value, index);
  }
};

Observable.prototype.addObserver = function (observer) {
  this.observers.unshift(observer);
  if (this.active && this.value !== null && typeof this.value !== 'undefined') {
    observer.yield(this.value, this.index);
  }

  //TODO Lazyness
  //activate the observable if first observer
  this.call();
};

Observable.prototype.cancelObserver = function () {
  var index = this.observers.indexOf(observer);
  if (index < 0) {
    return;
  }
  this.observers.swap(index, 1);

  //TODO deactivate the observer if last observer
};

Observable.prototype.call = function () {
  if (!this.active) {
    if (this.observers.length) {
      if (this.onstart) {
        this.onstart();
      }
      this.active = true;
      if (this.value !== null && typeof this.value !== 'undefined') {
        this.yield(this.value, this.index);
      }
    }
  } else {
    if (!this.observers.length) {
      if (this.onstop) {
        this.onstop();
      }
      this.active = false;
    }
  }
};
