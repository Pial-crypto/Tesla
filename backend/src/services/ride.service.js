import { db } from "../prisma/db.ts";

import {
  validateRideRequest,
  validateFareEstimate,
} from "../validators/ride.validator.js";

import { calcFare } from "../utils/fare.js";

async function createRide(userId, body) {
  const {
    pickup,
    destination,
    seats,
    paymentMethod,
  } = validateRideRequest(body);

  const activeRide = await db.orm.public.Ride
    .where({
      passengerId: userId,
    })
    .where({
      status: {
        in: [
          "REQUESTED",
          "MATCHED",
          "DRIVER_ARRIVED",
          "STARTED",
        ],
      },
    })
    .first();

  if (activeRide) {
    const error = new Error("you already have an active ride");
    error.statusCode = 409;
    throw error;
  }

  const fare = calcFare(
    pickup,
    destination,
    seats,
    false,
  );

  const ride = await db.orm.public.Ride.create({
    passengerId: userId,
    pickupZone: pickup,
    destZone: destination,
    seats,
    fareSoloPaisa: fare.solo,
    farePaisa: fare.fare,
    paymentMethod,
    status: "REQUESTED",
  });

  await db.orm.public.RideEvent.create({
    rideId: ride.id,
    toStatus: "REQUESTED",
    actorId: userId,
  });

  return ride;
}

async function getPassengerRides(userId) {
  console.log("Here is user id", userId);

  const rides = await db.orm.public.Ride
    .where({
      passengerId: userId,
    })
    .all();

  console.log("Passenger rides:", rides);

  return rides;
}

async function estimateFare(query) {
  const {
    from,
    to,
    seats,
  } = validateFareEstimate(query);

  const solo = calcFare(
    from,
    to,
    seats,
    false,
  );

  const pooled = calcFare(
    from,
    to,
    seats,
    true,
  );

  return {
    solo: solo.fare,
    ifPooled: pooled.fare,
  };
}

export {
  createRide,
  getPassengerRides,
  estimateFare,
};