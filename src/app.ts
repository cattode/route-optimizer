import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import HapiRateLimit from "hapi-rate-limit";
import Config from "./config";
import * as RouteOptimizer from "./RouteOptimizer";
import {HTTP_METHODS} from "./util";

export const server = new Hapi.Server({
    host: Config.HOST,
    port: Config.PORT,
    router: {
        stripTrailingSlash: true,
    },
});

const init = async () => {

    server.route([
        /**
         * Index
         *
         * @route {GET} /
         */
        {
            method: HTTP_METHODS.GET,
            path: "/",
            handler: function (request, h) {
                return h.response().redirect(`/${Config.ROUTE_OPTIMIZER}`);
            }
        },

        /**
         * Route optimizer endpoint GET
         *
         * @route {GET} /routeOptimizer
         */
        {
            method: HTTP_METHODS.GET,
            path: `/${Config.ROUTE_OPTIMIZER}`,
            handler: function (request, h) {
                return h.response(
                    Boom.methodNotAllowed("This endpoint only works with a POST request.").output.payload
                );
            }
        },

        /**
         * Route optimizer endpoint POST
         *
         * @route {POST} /routeOptimizer
         */
        {
            method: HTTP_METHODS.POST,
            path: `/${Config.ROUTE_OPTIMIZER}`,
            handler: function (request, h) {
                if (request.payload === undefined) {
                    return h.response(Boom.badRequest("Invalid request payload input").output.payload);
                }

                let payload: RouteOptimizer.IRoutingRequest;
                try {
                    payload = JSON.parse(request.payload.toString() as string) as RouteOptimizer.IRoutingRequest;
                    const validationResult = RouteOptimizer.inputSchema.validate(payload);
                    if (validationResult.error !== null) {
                        return h.response(Boom.badRequest("Invalid request payload input").output.payload);
                    }
                } catch (e) {
                    return h.response(Boom.badRequest("Invalid request payload input").output.payload);
                }

                const optimizedRoute: RouteOptimizer.IOptimizedRoute | null = RouteOptimizer.optimize(payload);
                if (optimizedRoute === null) {
                    return h.response(Boom.internal().output.payload);
                }
                return h.response(optimizedRoute);
            },
            options: {
                payload: {
                    parse: false
                }
            }
        }
    ]);

    await server.register({
        plugin: HapiRateLimit,
        options: {
            enabled: true,
            userLimit: Config.RATE_LIMIT,
            headers: false
        }
    });

    await server.start();
    console.log("Server running on %s", `${server.info.uri}/${Config.ROUTE_OPTIMIZER}`);
};

process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

init();
