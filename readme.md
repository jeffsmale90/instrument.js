# instrument.js

A tool for instrumenting JavaScript to help with performance analysis.

### Installation
Run the following to install dependencies:
```npm install```

I have been using this tool via npm link, rather than publishing it to any npm registry. To do the following:

```npm link```

From your project that you would like to instrument:

```npm link instrument```

### Basic usage
After integrating instrument.js into your project, when the node.js event "exit" is emitted, instrument.js will output usage summary information to the console.

See `example.js` for an example, (`node example.js` to execute) which will output something similar to:
```
Profiling: TestClass
  ┌────────────────────┬────────────────────┬────────────────────┬────────────────────┐
  │ Function           │ Iterations         │ Nanoseconds        │ Ns per iteration   │
  ├────────────────────┼────────────────────┼────────────────────┼────────────────────┤
  │ syncronous         │ 1                  │ 1570791ns          │ 1570791ns          │
  ├────────────────────┼────────────────────┼────────────────────┼────────────────────┤
  │ asyncronous        │ 10                 │ 10024042248ns      │ 1002404224ns       │
  ├────────────────────┼────────────────────┼────────────────────┼────────────────────┤
  │ loop               │ 10                 │ 394001ns           │ 39400ns            │
  └────────────────────┴────────────────────┴────────────────────┴────────────────────┘

  syncronous callers:
  ┌────────────────────────────────────────────────────────────────────────┬──────────┐
  │ Caller                                                                 │ Count    │
  ├────────────────────────────────────────────────────────────────────────┼──────────┤
  │ at Object.<anonymous> (/Users/jeffsmale/instrument.js/example.js:30:3) │ 1        │
  └────────────────────────────────────────────────────────────────────────┴──────────┘

  asyncronous callers:
  ┌────────────────────────────────────────────────────────────────────────┬──────────┐
  │ Caller                                                                 │ Count    │
  ├────────────────────────────────────────────────────────────────────────┼──────────┤
  │ at Object.<anonymous> (/Users/jeffsmale/instrument.js/example.js:32:5) │ 10       │
  └────────────────────────────────────────────────────────────────────────┴──────────┘

Profiling: ClassTest
  ┌────────────────────┬────────────────────┬────────────────────┬────────────────────┐
  │ Function           │ Iterations         │ Nanoseconds        │ Ns per iteration   │
  ├────────────────────┼────────────────────┼────────────────────┼────────────────────┤
  │ Something          │ 0                  │ 0ns                │ -                  │
  ├────────────────────┼────────────────────┼────────────────────┼────────────────────┤
  │ Else               │ 1                  │ 18334ns            │ 18334ns            │
  └────────────────────┴────────────────────┴────────────────────┴────────────────────┘
```

* Iterations: shows the number of times a class was called
* Nanoseconds: shows the total runtime of the function in nanoseconds
* Ns per iteration: the average runtime of the function in nanoseconds

In order to instrument the class TestClass, add the following:

```JavaScript
class TestClass {...}

require("instrument.js")(TestClass);
```

#### "Advanced" configuration
You can provide additional configuration to access "advanced" features (presently listing function callers), by passing a second configuration argument to the function:

```JavaScript
class TestClass {...}

require("instrument.js")(TestClass, {listCallers: true});
```

Note: listing callers is _expensive_, as an `Error` object is created with every call in order to access the stack trace.

#### Custom timers
Custom timers can be used with the following:
```JavaScript
class TestClass {
  constructor() {
    const stopTimer = startTimer("constructor");
    ...
    stopTimer();
  }
}

const {startTimer} = instrument(TestClass);
```

### Limitations
Constructors are not instrumented by default - you can use custom timers, or move constructor logic into an `init()` method which will be instrumented.

Only functions defined in the specified class will be instrumented. No inherited classes will be instrumented.

Function names and class names are used as keys in internal data objects :sweat_smile:, so duplicates will cause pain (including custom timers).