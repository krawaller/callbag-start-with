
const startWith = value => inputSource => (start, outputSink) => {
  if (start !== 0) return;
  let inputTalkback;
  inputSource(0, (it,id) => {
    if (it === 0){
      inputTalkback = id;
      outputSink(0, (ot, od) => {
        if (ot !== 0) inputTalkback(ot, od);
      });
      outputSink(1, value);
    } else {
      outputSink(it, id);
    }
  });
};

module.exports = startWith;
