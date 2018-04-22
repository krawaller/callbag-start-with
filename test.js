const test = require('tape');
const fromIter = require('callbag-from-iter');
const forEach = require('callbag-for-each');
const makeMockCallbag = require('callbag-mock');
const startWith = require('./index');

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
    ['sink', 'body', 1, 'foo'],
    ['sink', 'body', 1, 'bar'],
    ['sink', 'body', 1, 'baz'],
    ['sink', 'body', 2, 'error'],
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
    ['sink', 'body', 1, 'foo'],
    ['source', 'talkback', 1, undefined],
    ['source', 'talkback', 2, undefined],
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