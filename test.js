var stream = EventStream.fromEvent('click', document.querySelector('input'));

stream.forEach(function (e) {
  console.log(e);
});
