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
  const state: any = JSON.parse(JSON.stringify(req));
  return new Proxy(state, {
    get (target, key) {
      if (currentObserver) {
        observers.add(currentObserver);
      }
      return state[key];
    },
    set(target, key, newValue): boolean {
      if (JSON.stringify(target[key]) === JSON.stringify(newValue)) {
        return true;
      }
      target [key] = newValue
      observers.forEach(observer => observer())
      return true;
    }
  });
}
