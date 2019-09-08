import Joi from "@hapi/joi";

/** Interface for the routing request */
/** {string} departureTime - The departure time as a UNIX timestamp string */
/** {object} home - The home position */
/** {number} home.lat - The latitude of the home */
/** {number} home.lng - The longitude of the home */
/** {array} tasks - The list of tasks */
/** {number} tasksItem.id - identifier of the task */
/** {number} tasksItem.lat - The latitude of the task */
/** {number} tasksItem.lng - The longitude of the task */
/** {number} tasksItem.duration - the task duration */
export interface IRoutingRequest {
    departureTime: string;
    home: {
        lat: number,
        lng: number
    };
    tasks: Array<{
        id: number,
        lat: number,
        lng: number,
        duration: number
    }>;
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
 * Calculates an optimized route
 * @param {IRoutingRequest} routingRequest - The object containing all the information needed for a routing request
 * @return {IOptimizedRoute} The optimized route.
 */
export function optimize(routingRequest: IRoutingRequest): IOptimizedRoute | null {
    // TODO
    return null;
}
