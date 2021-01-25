import { Source } from 'callbag';

export default function startWith<T>(...args: T[]): {<U>(src: Source<U>):Source<T | U>};