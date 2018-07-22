const test = require('tape');
const fromIter = require('callbag-from-iter');
const forEach = require('callbag-for-each');
const makeMockCallbag = require('callbag-mock');
const of = require('callbag-of');
const pipe = require('callbag-pipe');
const take = require('callbag-take');
const startWith = require('.');

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
  const source = makeMockCallbag(true);
  const seedWithFoo = startWith('foo');
  const sink = makeMockCallbag();

  seedWithFoo(source)(0, sink);

  // emit request with data (request_id) to make sure that this very request is passed to the source
  sink.emit(1, 'request_id');
  sink.emit(2);

  t.deepEqual(
    source.getMessages().slice(1),
    [
      [1, 'request_id'],
      [2, undefined],
    ],
    'source gets requests from sink'
  );

  t.end();
});

test('it supports iterables', t => {
  const expected = [];

  pipe(
    fromIter(['b', 'c']),
    startWith('a'),
    forEach((v) => expected.push(v))
  );

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
  const seededSrc = startWith('a', 'b', 'c')(of('d'));

  const sink = makeMockCallbag();

  seededSrc(0, sink);

  t.deepEqual(
    sink.getMessages().slice(1),
    [
      [1, 'a'],
      [1, 'b'],
      [1, 'c'],
      [1, 'd'],
      [2, undefined],
    ],
    'sink gets data in the correct order'
  );

  t.end();
});

test('it doesn\'t request data when receiving uknown type', t => {
  const autoPull = () => {};

  const source = makeMockCallbag(true);

  pipe(
    source,
    startWith('foo'),
    forEach(autoPull)
  )

  source.emit(1, 'a');
  source.emit(1, 'b');
  source.emit('unknown', 'c');
  source.emit(1, 'd');
  source.emit('unknown', 'e');

  t.deepEqual(
    source.getMessages().slice(1),
    [
      [1, undefined], // request sent up on 0
      [1, undefined],
      [1, undefined],
      [1, undefined],
    ],
    'source gets correct number of requests from sink'
  );

  t.end();
});

test('it passes sink errors up (& data for unknown types too)', t => {
  const source = makeMockCallbag(true);
  const seedWithFoo = startWith('foo');
  const sink = makeMockCallbag();

  seedWithFoo(source)(0, sink);

  sink.emit(1);
  sink.emit('unknown', 'payload');
  sink.emit(11, 'other_data');
  sink.emit(2, 'err');

  t.deepEqual(
    source.getMessages().slice(1),
    [
      [1, undefined],
      ['unknown', 'payload'],
      [11, 'other_data'],
      [2, 'err'],
    ],
    'source gets type & data from sink'
  );

  t.end();
});

test('it stops emitting after receiving unsubscription request', t => {
  const sink = makeMockCallbag();

  pipe(
    fromIter(['d']),
    startWith('a', 'b', 'c'),
    take(2),
    source => source(0, sink)
  );

  t.deepEqual(
    sink.getReceivedData(),
    ['a', 'b'],
    'sink stops receiving data after unsubscribing'
  );

  t.end();
});
