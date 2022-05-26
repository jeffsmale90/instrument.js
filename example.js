class TestClass {
  syncronous() {
    for (let x = 0 ; x< 10; x++) {
      const stop = startTimer("loop");
      for (let i = 0; i < 10000; i++) {

      }
      stop();
    }
  }
  asyncronous() {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), 1000);
    });
  }
}
class ClassTest {
  Something() {}
  Else() {}
}

const instrument = require(".");
const {startTimer} = instrument(TestClass, { showCallers: true });
instrument(ClassTest);


new ClassTest().Else();

const t = new TestClass();
t.syncronous();
for (let i = 0; i < 10; i++) {
  t.asyncronous();
}
