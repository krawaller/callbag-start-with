
const startWith = (...xs) => inputSource => (start, outputSink) => {
  if (start !== 0) return;
  xs = xs.map(v => [1, v]);
  let inited = false;
  let completed = false;
  inputSource(0, (it, id) => {
    if (it === 0){
      const inputTalkback = id;

      outputSink(0, (ot, od) => {
        if (ot === 0) return;
        if (ot === 2) xs.length = 0;
        if (!completed) inputTalkback(ot, od);
      });

      while (xs.length !== 0) {
        outputSink(...xs.shift());
      }

      inited = true;
      return
    }

    if (it === 2) completed = true;

    if (!inited) {
      xs.push([it, id]);
      return
    }

    outputSink(it, id);
  });
};

module.exports = startWith;
