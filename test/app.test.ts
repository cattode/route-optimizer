import expect from "expect";
import {server} from "../src/app";
import Config from "../src/config";
import { HTTP_METHODS } from "../src/util";

// tslint:disable-next-line:no-console no-empty
console.log = function() {};

// Start application before running the test case
beforeAll((done) => {
    server.events.on("start", () => {
        done();
    });
});

// Stop application after running the test case
afterAll((done) => {
    server.events.on("stop", () => {
        done();
    });
    server.stop();
});

test("server connection OK", async function (done) {
    expect.assertions(1);
    const options = {
        method: HTTP_METHODS.GET,
        url: "/"
    };
    const data = await server.inject(options);
    expect(data.statusCode).toBe(302);
    done();
});

test(`/${Config.ROUTE_OPTIMIZER} GET`, async function (done) {
    expect.assertions(1);
    const options = {
        method: HTTP_METHODS.GET,
        url: `/${Config.ROUTE_OPTIMIZER}`
    };
    const data = await server.inject(options);
    expect(data.statusCode).toBe(405);
    done();
});

test(`/${Config.ROUTE_OPTIMIZER} POST`, async function (done) {
    expect.assertions(1);
    const options = {
        method: HTTP_METHODS.POST,
        url: `/${Config.ROUTE_OPTIMIZER}`
    };
    const data = await server.inject(options);
    expect(data.statusCode).toBe(400);
    done();
});
