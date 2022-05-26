const Table = require("cli-table");
const colors = require("colors");
const getConfig = require("./config");

module.exports = function instrument(target, config) {
  const {showCallers} = getConfig(config);
  const targetName = target.name;  
  let keys;
  if (target.prototype) {
    keys = Object.getOwnPropertyNames(target.prototype);
    if (keys[0] === 'constructor') {
      keys = keys.slice(1);
    }
    target = target.prototype;
  } else {
      keys = Object.keys(target);
  }
  const instrumentedClass = instrumentedClasses[targetName] = {
    _showCallers: showCallers
  };

  keys.forEach(key => {
    if (typeof(target[key]) === 'function') {
        const profile = {
          key,
          iterations: 0,
          totalTime: 0n,
        }
        
        if (showCallers) {
          profile.callers = {};
        }
        instrumentedClass[key] = profile;
        
        const _func = target[key];

        target[key] = function() {
            if (showCallers) {
              const caller = new Error().stack.split("\n")[2];
              profile.callers[caller] = (profile.callers[caller] || 0) + 1;
            }
            const _this = this;
            profile.iterations = profile.iterations + 1;
            const startTime = process.hrtime.bigint();
            const res = _func.call(_this, ...arguments);
            const isPromise = v => typeof v === 'object' && typeof v.then === 'function';
            if (isPromise(res)) {
                return res.then(promiseResult => {
                    profile.totalTime = profile.totalTime + process.hrtime.bigint() - startTime;
                    return promiseResult;    
                });
            } else {
              profile.totalTime = profile.totalTime + process.hrtime.bigint() - startTime;
              return res;
            }
        };
    }
  });
  return {
    startTimer: getTimerStart(instrumentedClass)
  };
}

function getTimerStart(profiles) {
  return (key) => {
    const startTime = process.hrtime.bigint();
    const profile = profiles[key] = profiles[key] || {iterations: 0, totalTime: 0n};
    
    return () => {
      profile.iterations += 1;
      profile.totalTime = profile.totalTime + process.hrtime.bigint() - startTime;
    };
  }
}

const instrumentedClasses = {};

function output() {
  for (const targetName in instrumentedClasses) {
    const instrumentedClass = instrumentedClasses[targetName];

    console.log();
    console.log(colors.red("Profiling: ") + colors.green(targetName));
    console.group();

    const timingsTable = new Table({
      head: ["Function", "Iterations", "Nanoseconds", "Ns per iteration"],
      colWidths: [20,20,20,20]
    });
    for (const profileKey in instrumentedClass) {
      if (profileKey.indexOf("_") === -1) {
        const profile = instrumentedClass[profileKey];
        const perIteration = profile.iterations == 0 ? "-" : `${profile.totalTime / BigInt(profile.iterations)}ns`;
        timingsTable.push([profileKey, profile.iterations, `${profile.totalTime}ns`, perIteration])
      }
    }

    console.log(timingsTable.toString());

    if(instrumentedClass._showCallers) {
      for (const profileKey in instrumentedClass) {
        if (profileKey.indexOf("_") === -1) {

          const {callers} = instrumentedClass[profileKey];
          if (callers) {
            console.log();
            console.log(colors.green(profileKey) + colors.red(" callers:"));

            const callersTable = new Table({
              head: ["Caller", "Count"],
              colWidths: [72,10]
            });
            for (const callerKey in callers) {
              callersTable.push([
                callerKey.trim(),
                callers[callerKey]
              ]);
            }

            console.log(callersTable.toString());
          }
        }
      }
    }
    console.groupEnd();
  };
}
  
process.on('exit', output);