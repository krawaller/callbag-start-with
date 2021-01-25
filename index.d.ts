import { Source } from 'callbag';

export default function startWith<T, U>(...args: T[]): (src: Source<U>) => Source<T | U>;