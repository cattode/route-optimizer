import Joi from "@hapi/joi";
import * as geolib from "geolib";
import Config from "./config";

/** A routing request task */
/** {number} id - identifier of the task */
/** {number} lat - The latitude of the task */
/** {number} lng - The longitude of the task */
/** {number} duration - the task duration */
/** {number} speed - [Optional] The average driving speed to drive to this task in km/h */
interface IRoutingRequestTask {
    id: number;
    lat: number;
    lng: number;
    duration: number;
    speed?: number;
}

/** A routing request */
/** {string} departureTime - The departure time as a UNIX timestamp string */
/** {object} home - The home position */
/** {number} home.lat - The latitude of the home */
/** {number} home.lng - The longitude of the home */
/** {Array<IRoutingRequest>} tasks - The list of tasks */
/** {number} speed - [Optional] The average driving speed for the whole trip in km/h */
export interface IRoutingRequest {
    departureTime: string;
    home: {
        lat: number,
        lng: number
    };
    tasks: IRoutingRequestTask[];
    speed?: number;
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
            duration: Joi.number().positive().required(),
            speed: Joi.number().positive()
        }).required()
    ).required(),
    speed: Joi.number().positive()
}).required();

/** A scheduled task */
/** {number} id - identifier of the task */
/** {number} startsAt - UNIX timestamp of the starting time */
/** {number} endsAt - UNIX timestamp of the ending time */
/** {number} lat - The latitude of the task */
/** {number} lng - The longitude of the task */
interface IScheduledTask {
    id: number;
    startsAt: number;
    endsAt: number;
    lat: number;
    lng: number;
}

/** Interface for the optimized route */
/** {number} totalTime - The total time from leaving home to returning home */
/** {array<IScheduledTask>} schedule - The scheduled list of tasks */
export interface IOptimizedRoute {
    totalTime: number;
    schedule: IScheduledTask[];
}

/**
 * Gets the combinations of an array
 * @param {array} array - An array of elements
 * @return {array} All the permutations of the input array
 */
export function getCombinations<T>(array: T[]): T[][] {
    const combinationsList: T[][] = [];

    for (let i: number = 0; i < array.length; i = i + 1) {
        const rest: T[][] = getCombinations(array.slice(0, i).concat(array.slice(i + 1)));

        if (!rest.length) {
            combinationsList.push([array[i]]);
        } else {
            for (const restElement of rest) {
                combinationsList.push([array[i]].concat(restElement));
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
export function optimize(routingRequest: IRoutingRequest): IOptimizedRoute {
    const tasksCombinations = getCombinations(routingRequest.tasks);

    // Average speed between tasks
    const isSpeedForEachTaskAvailable: boolean = routingRequest.tasks.every((task) => task.speed);
    const globalAverageSpeed: number = (routingRequest.speed) ?
        routingRequest.speed as number :
        Config.AVERAGE_SPEED;

    const routeDurations = tasksCombinations
        .map((listOfTasks) => {
            const drivingSegmentDurations: number[] = listOfTasks
                .map((task, index, array) => {
                    const previousTask = (index === 0) ? routingRequest.home : array[index - 1];
                    const drivingDistanceInMeters: number = geolib.getDistance(previousTask, task);
                    const currentTaskSpeedInMetersPerMinute: number = ((isSpeedForEachTaskAvailable) ?
                        array[index].speed as number :
                        globalAverageSpeed) * 1000 / 60;

                    return drivingDistanceInMeters / currentTaskSpeedInMetersPerMinute;
                });

            return {
                route: listOfTasks,
                drivingDurations: drivingSegmentDurations,
                totalDrivingDuration: drivingSegmentDurations.reduce((sum, duration) => sum + duration)
            };
        });

    routeDurations.sort((route1, route2) => (route1.totalDrivingDuration > route2.totalDrivingDuration) ? 1 : -1);

    const shortestRoute = routeDurations[0];
    const schedule: IScheduledTask[] = [];

    let currentTaskTime: number = Number(routingRequest.departureTime);

    // Leaving home task
    schedule.push({
        id: 1,
        startsAt: currentTaskTime,
        endsAt: currentTaskTime,
        lat: routingRequest.home.lat,
        lng: routingRequest.home.lng
    });

    // scheduled tasks
    for (let i: number = 0; i < shortestRoute.route.length; i++) {
        const drivingDurationInSeconds: number = shortestRoute.drivingDurations[i] * 60;
        const taskDurationInSeconds: number = shortestRoute.route[i].duration * 60;

        schedule.push({
            id: 2 + i,
            startsAt: Math.round(currentTaskTime += drivingDurationInSeconds),
            endsAt: Math.round(currentTaskTime += taskDurationInSeconds),
            lat: routingRequest.home.lat,
            lng: routingRequest.home.lng
        });
    }

    const totalTimeInMinutes = Math.round((schedule[schedule.length - 1].endsAt - schedule[0].startsAt) / 60);

    const optimizedRoute: IOptimizedRoute = {
        totalTime: totalTimeInMinutes,
        schedule
    };

    return optimizedRoute;
}
