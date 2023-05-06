const debounceFrame = (callback) => {
  let currentCallback: NodeJS.Timeout | null = null;
  return () => {
    clearTimeout(currentCallback)
    currentCallback = setTimeout(callback, 16);
  }
};

const observers = new Set<any>()
let currentObserver = null

export function observe(callback) {
  currentObserver = debounceFrame(callback);
  callback();
  currentObserver = null;
}

export function observable(req) {
  const state: any = {}
  for (const key of Object.keys(req)) {
    let value = req[key];
    Object.defineProperty(state, key, {
      get () {
        if (currentObserver) {
          observers.add(currentObserver);
        }
        return value;
      },
      set (newValue) {
        if (JSON.stringify(value) === JSON.stringify(newValue)) {
          return;
        }
        value = newValue
        observers.forEach(observer => observer())
      }
    });
  }
  return state;
}
