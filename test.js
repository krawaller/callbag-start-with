const test = require('tape');
const fromIter = require('callbag-from-iter');
const forEach = require('callbag-for-each');
const makeMockCallbag = require('callbag-mock');
const startWith = require('./index');

test('it seeds the source with initial value, then passes the rest on down', t => {
  const source = makeMockCallbag(true);
  const seedWithFoo = startWith('foo');
  const sink = makeMockCallbag();

  seedWithFoo(source)(0, sink);

  source.emit(1, 'bar');
  source.emit(1, 'baz');
  source.emit(2, 'error');

  t.deepEqual(
    sink.getReceivedData(),
    ['foo','bar','baz'],
    'sink gets seed and subsequent data'
  );
  t.ok(!sink.checkConnection(), 'sink gets termination');
  t.end();
});

test('it passes requests back up', t => {
  let history = [];
  const report = (t,d) => t !== 0 && history.push([t,d]);

  const source = makeMockCallbag(report, true);
  const seedWithFoo = startWith('foo');
  const sink = makeMockCallbag();

  seedWithFoo(source)(0, sink);

  sink.emit(1);
  sink.emit(2);

  t.deepEqual(history, [
    [1, undefined],
    [2, undefined],
  ], 'source gets requests from sink');

  t.end();
});

test('it supports iterables', t => {
  const seededSrc = startWith('a')(fromIter(['b', 'c']));

  const expected = [];

  forEach((v) => {
    expected.push(v);
  })(seededSrc);

  t.deepEqual(expected, ['a', 'b', 'c'], 'sink gets data in the correct order');

  t.end();
});

test('it supports multiple arguments', t => {
  const source = makeMockCallbag(true);
  const seedWithMultipleEmits = startWith('foo', 'bar', 'baz');
  const sink = makeMockCallbag();

  seedWithMultipleEmits(source)(0, sink);

  source.emit(1, 'qu');

  t.deepEqual(
    sink.getReceivedData(), 
    ['foo','bar','baz','qu'],
    'sink gets seed and subsequent data'
  );

  t.end();
});
