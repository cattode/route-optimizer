import Joi from "@hapi/joi";
import * as geolib from "geolib";

/** {number} id - identifier of the task */
/** {number} lat - The latitude of the task */
/** {number} lng - The longitude of the task */
/** {number} duration - the task duration */
interface IRoutingRequestTask {
    id: number;
    lat: number;
    lng: number;
    duration: number;
}

/** Interface for the routing request */
/** {string} departureTime - The departure time as a UNIX timestamp string */
/** {object} home - The home position */
/** {number} home.lat - The latitude of the home */
/** {number} home.lng - The longitude of the home */
/** {Array<IRoutingRequest>} tasks - The list of tasks */
export interface IRoutingRequest {
    departureTime: string;
    home: {
        lat: number,
        lng: number
    };
    tasks: IRoutingRequestTask[];
}

/** Joi schema that validates a correct routing request payload */
export const inputSchema: Joi.Schema = Joi.object({
    departureTime: Joi.date().timestamp("unix").required(),
    home: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
    }).required(),
    tasks: Joi.array().items(
        Joi.object({
            id: Joi.number().integer().min(1).required(),
            lat: Joi.number().required(),
            lng: Joi.number().required(),
            duration: Joi.number().positive().required()
        }).required()
    ).required()
}).required();

/** Interface for the optimized route */
/** {number} totalTime - The total time from leaving home to returning home */
/** {array} schedule - The scheduled list of tasks */
/** {number} scheduleItem.id - identifier of the task */
/** {number} scheduleItem.startsAt - UNIX timestamp of the starting time */
/** {number} schedule.endsAt - UNIX timestamp of the ending time */
/** {number} schedule.lat - The latitude of the task */
/** {number} schedule.lng - The longitude of the task */
export interface IOptimizedRoute {
    totalTime: number;
    schedule: Array<{
        id: number,
        startsAt: number,
        endsAt: number,
        lat: number,
        lng: number
    }>;
}

/**
 * Gets the combinations of an array
 * @param {array} array - An array of elements
 * @return {array} All the permutations of the input array
 */
function getCombinations<T>(array: T[]): T[][] {
    const combinationsList = [];

    for (let i: number = 0; i < array.length; i = i + 1) {
        const rest = getCombinations(array.slice(0, i).concat(array.slice(i + 1)));

        if (!rest.length) {
            combinationsList.push([array[i]]);
        } else {
            for (let j: number = 0; j < rest.length; j = j + 1) {
                combinationsList.push([array[i]].concat(rest[j]));
            }
        }
    }
    return combinationsList;
}

/**
 * Computes an optimized route
 * @param {IRoutingRequest} routingRequest - The object containing all the information needed for a routing request
 * @return {IOptimizedRoute} The optimized route.
 */
export function optimize(routingRequest: IRoutingRequest): IOptimizedRoute | null {
    const tasksCombinations = getCombinations(routingRequest.tasks);

    const routeLengths = tasksCombinations
        .map((listOfTasks) => {
            const lengthsBetweenTasks: number[] = listOfTasks
                .map((task) => ({ latitude: task.lat, longitude: task.lng}))
                .map((task, index, array) => {
                    const previousTask = (index === 0) ?
                        { latitude: routingRequest.home.lat, longitude: routingRequest.home.lng } :
                        array[index - 1];
                    return geolib.getDistance(previousTask, task);
                });
            return {
                route: listOfTasks,
                lengths: lengthsBetweenTasks,
                totalLength: lengthsBetweenTasks.reduce((sum, length) => sum + length)
            };
        });

    routeLengths.sort((route1, route2) => (route1.totalLength > route2.totalLength) ? 1 : -1);

    const shortestRoute: {route: IRoutingRequestTask[], length: number} = routeLengths[0];

    const optimizedRoute: IOptimizedRoute = {
        totalTime: null, // TODO
        schedule: null // TODO
    }; 

    return optimizedRoute;
}
