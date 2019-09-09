import * as RouteOptimizer from "../src/RouteOptimizer";

function factorial (n: number)  {
    return [...Array(n + 1).keys()].slice(1).reduce((acc, cur) => acc * cur, 1);
}

test("getCombinations function", async function (done) {
    expect.assertions(8);

    let randomArray: number[] = [1, 2, 3];
    let combinationResult: number[][] = RouteOptimizer.getCombinations(randomArray);
    expect(combinationResult.length).toBe(factorial(randomArray.length));
    expect(combinationResult).toContainEqual([1, 2, 3]);
    expect(combinationResult).toContainEqual([1, 3, 2]);
    expect(combinationResult).toContainEqual([2, 1, 3]);
    expect(combinationResult).toContainEqual([2, 3, 1]);
    expect(combinationResult).toContainEqual([3, 1, 2]);
    expect(combinationResult).toContainEqual([3, 2, 1]);

    const arraySize: number = 5 + Math.floor(Math.random() * 5);
    randomArray = Array(arraySize).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    combinationResult = RouteOptimizer.getCombinations(randomArray);

    expect(combinationResult.length).toBe(factorial(randomArray.length));
    done();
});

test("optimize function", async function (done) {
    expect.assertions(4);

    const request: RouteOptimizer.IRoutingRequest = require("./sample.json");
    const result: RouteOptimizer.IOptimizedRoute = RouteOptimizer.optimize(request);

    expect(result).toBeTruthy();

    expect(result.totalTime).toBe(263);

    expect(result.schedule).toBeDefined();
    expect(result.schedule.length).toBe(request.tasks.length + 1);
    done();
});
