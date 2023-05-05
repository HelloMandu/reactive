import { observable, observe } from "../reactive";

const wait = (time = 1000 / 60) =>
  new Promise((resolve) => setTimeout(resolve, time));


describe("reactive test", () => {
  it('test', () => {
    function compute() {
      return 123
    }
    expect(compute()).toEqual(123);
  })
  it("observable로 만든 객체가 observe 내에서 사용될 경우", async () => {
    const state = observable({ a: 1, b: 2 });

    let computed = '';
    function compute() {
       computed = `a + b = ${state.a + state.b}`;
    }

    observe(compute);

    expect(computed).toBe(`a + b = 3`);
    state.b = 10;

    await wait();

    expect(computed).toBe(`a + b = 12`);
    state.b = 20;

    await wait();
    expect(computed).toBe(`a + b = 30`);
  });

  it("똑같은 값을 할당할 경우, 실행하지 않음", async () => {
    let computed = '';
    const state = observable({ a: 1, b: 2 });

    let callCount = 0;
    function compute() {
      computed = `a + b = ${state.a + state.b}`;
      callCount += 1;
    }

    observe(compute);

    expect(computed).toBe(`a + b = 3`);
    expect(callCount).toBe(1);

    state.a = 10;
    await wait();

    expect(computed).toBe(`a + b = 12`);
    expect(callCount).toBe(2);

    state.b = 20;
    await wait();

    expect(computed).toBe(`a + b = 30`);
    expect(callCount).toBe(3);

    state.a = 10;
    await wait();

    expect(computed).toBe(`a + b = 30`);
    expect(callCount).toBe(3);
  });

  it("똑같은 값을 할당할 경우, 실행하지 않음 - 얕은비교(배열)", async () => {
    const state = observable({ a: 1, b: 2, c: [3, 4] });

    let computed = '';
    let callCount = 0;
    function compute() {
      const [ c, d ] = state.c;
      computed = `a + b + c + d = ${state.a + state.b + c + d}`;
      callCount += 1;
    }

    observe(compute);

    expect(computed).toBe(`a + b + c + d = 10`);
    expect(callCount).toBe(1);

    state.c = [3, 4];

    expect(computed).toBe(`a + b + c + d = 10`);
    expect(callCount).toBe(1);
  });

  it("똑같은 값을 할당할 경우, 실행하지 않음 - 얕은비교(객체)", async () => {
    const state = observable({ a: 1, b: 2, child: { c: 3, d: 4 } });

    let computed = '';
    let callCount = 0;
    function compute() {
      const { c, d } = state.child;
      computed = `a + b + c + d = ${state.a + state.b + c + d}`;
      callCount += 1;
    }

    observe(compute);

    expect(computed).toBe(`a + b + c + d = 10`);
    expect(callCount).toBe(1);

    state.child = { c: 3, d: 4 }

    expect(computed).toBe(`a + b + c + d = 10`);
    expect(callCount).toBe(1);
  });

  it("마지막으로 할당한 값에 대해서만 observe를 실행함", async () => {
    const state = observable({ a: 1, b: 2 });

    let computed = '';
    let callCount = 0;
    function compute() {
      computed = `a + b = ${state.a + state.b}`;
      callCount += 1;
    }

    observe(compute);

    expect(computed).toBe(`a + b = 3`);
    expect(callCount).toBe(1);

    state.a = 2;
    state.a = 3;
    state.a = 4;
    state.a = 5;
    state.a = 6;
    state.a = 7;
    state.a = 8;
    state.a = 9;
    state.a = 10;


    await wait();

    expect(computed).toBe(`a + b = 12`);
    expect(callCount).toBe(2);
  });
})