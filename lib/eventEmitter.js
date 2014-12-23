function EventEmitter() {
  this.yield = this.yield.bind(this);
}

EventEmitter.prototype.yield = function (value, index) {
  var handler = handlers.get(this);
  handler.yield(value, index);
};
