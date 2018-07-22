
const startWith = (...xs) => inputSource => (start, outputSink) => {
  if (start !== 0) return;
  let disposed = false;
  let inputTalkback;
  let trackPull = false;
  let lastPull;

  outputSink(0, (ot, od) => {
    if (trackPull && ot === 1) {
      lastPull = [1, od];
    }

    if (ot === 2) {
      disposed = true;
      xs.length = 0;
    }

    if (!inputTalkback) return;
    inputTalkback(ot, od);
  });

  while (xs.length !== 0) {
    if (xs.length === 1) {
      trackPull = true;
    }
    outputSink(1, xs.shift());
  }

  if (disposed) return;

  inputSource(0, (it, id) => {
    if (it === 0) {
      inputTalkback = id;
      trackPull = false;

      if (lastPull) {
        inputTalkback(...lastPull);
        lastPull = null;
      }
      return;
    }
    outputSink(it, id);
  });
};

export default startWith;
