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

  // emit request with data (request_id) to make sure that this very request is passed to the source
  sink.emit(1, 'request_id');
  sink.emit(2);

  t.deepEqual(history, [
    [1, 'request_id'],
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

test('it queues sync completion', t => {
  let history = [];

  const seededSrc = startWith('a', 'b', 'c')(fromIter(['d']));

  const makeSink = () => {
    let talkback
    return (t, d) => {
      if (t === 0) talkback = d
      else history.push([t,d])

      if (t !== 2) talkback(1)
    }
  }

  seededSrc(0, makeSink());

  t.deepEqual(history, [
    [1, 'a'],
    [1, 'b'],
    [1, 'c'],
    [1, 'd'],
    [2, undefined],
  ], 'sink gets data in the correct order');

  t.end();
});

