let test = require('tape');

let startWith = require('./index');

test('it seeds the source with initial value, then passes the rest on down', t => {
  let history = [];
  const report = (name,dir,t,d) => t !== 0 && d !== undefined && history.push([name,dir,t,d]);

  const source = makeMockCallbag('source', true);
  const seedWithFoo = startWith('foo');
  const sink = makeMockCallbag('sink', report);

  seedWithFoo(source)(0, sink);

  source.emit(1, 'bar');
  source.emit(1, 'baz');
  source.emit(2, 'error');

  t.deepEqual(history, [
    ['sink', 'fromUp', 1, 'foo'],
    ['sink', 'fromUp', 1, 'bar'],
    ['sink', 'fromUp', 1, 'baz'],
    ['sink', 'fromUp', 2, 'error'],
  ], 'sink gets seed and subsequent data');

  t.end();
});

test('it passes requests back up', t => {
  let history = [];
  const report = (name,dir,t,d) => t !== 0 && history.push([name,dir,t,d]);

  const source = makeMockCallbag('source', report, true);
  const seedWithFoo = startWith('foo');
  const sink = makeMockCallbag('sink', report);

  seedWithFoo(source)(0, sink);

  sink.emit(1);
  sink.emit(2);

  t.deepEqual(history, [
    ['sink', 'fromUp', 1, 'foo'],
    ['source', 'fromDown', 1, undefined],
    ['source', 'fromDown', 2, undefined],
  ], 'source gets requests from sink');

  t.end();
});

function makeMockCallbag(name, report=()=>{}, isSource) {
  if (report === true) {
    isSource = true;
    report = ()=>{};
  }
  let talkback;
  let mock = (t, d) => {
    report(name, 'fromUp', t, d);
    if (t === 0){
      talkback = d;
      if (isSource) talkback(0, (st, sd) => report(name, 'fromDown', st, sd));
    }
  };
  mock.emit = (t, d) => {
    if (!talkback) throw new Error(`Can't emit from ${name} before anyone has connected`);
    talkback(t, d);
  };
  return mock;
}
