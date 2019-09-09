# Route-optimizer API

 A simple API that computes an optimized itinerary.


### Installing

Make sure Node.JS is installed

Clone the repo

```
git clone https://github.com/cattode/route-optimizer.git
```

Install dependencies

```
npm install
```

Start the server

```
npm start
```

### Usage

By default, the API runs on `http://localhost:3000/`.

You can test the API with the JSON test sample.
```
curl -X POST -H "Content-Type: application/json" -d @"./test/sample.json" http://localhost:3000/routeOptimizer
```

## Running the tests

```
npm test
```

### API documentation

Compute an optimized route

**Path:**  `/routeOptimizer`

**Method:** `POST`

**Payload:**

   `{string} departureTime` - The departure time as a UNIX timestamp string
   `{object} home` - The home position
   `{number} home.lat` - The latitude of the home
   `{number} home.lng` - The longitude of the home
   `{array} tasks` - The list of tasks
   `{number} tasks.id` - The identifier of the task
   `{number} tasks.lat` - The latitude of the task
   `{number} tasks.lng` - The longitude of the task
   `{number} tasks.duration` - The list of tasks
   `{number} tasks.speed` - [Optional] The average driving speed to drive to this task in km/h
   `{number} speed` - [Optional] The average driving speed for the whole trip in km/h


**Success Response:**

- **Code:** 200 Created

  **Sample Content:** 
```JSON
{ 
   "totalTime":263,
   "schedule":[ 
      { 
         "id":1,
         "startsAt":1508756400,
         "endsAt":1508756400,
         "lat":48.83310530000001,
         "lng":2.333563799999979
      },
      { 
         "id":2,
         "startsAt":1508756619,
         "endsAt":1508762019,
         "lat":48.83310530000001,
         "lng":2.333563799999979
      },
      { 
         "id":3,
         "startsAt":1508762308,
         "endsAt":1508765008,
         "lat":48.83310530000001,
         "lng":2.333563799999979
      },
      { 
         "id":4,
         "startsAt":1508765403,
         "endsAt":1508769003,
         "lat":48.83310530000001,
         "lng":2.333563799999979
      },
      { 
         "id":5,
         "startsAt":1508770382,
         "endsAt":1508772182,
         "lat":48.83310530000001,
         "lng":2.333563799999979
      }
   ]
}
```

**Error Response:** 

- **Code:** 400 Bad Request - Invalid request payload input

- **Code:** 500 Internal Server Error





## License

This project is **unlicensed**.