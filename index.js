
const startWith = (...xs) => inputSource => (start, outputSink) => {
  if (start !== 0) return;
  xs = xs.map(v => [1, v]);
  let inputTalkback;
  let inited = false;
  inputSource(0, (it, id) => {
    if (it === 0){
      inputTalkback = id;

      outputSink(0, (ot, od) => {
        if (ot === 0) return;
        if (ot === 2) xs.length = 0;
        inputTalkback(ot, od);
      });

      while (xs.length !== 0) {
        outputSink(...xs.shift());
      }

      inited = true;
      return
    }

    if (!inited) {
      xs.push([it, id]);
      return
    }

    outputSink(it, id);
  });
};

module.exports = startWith;
