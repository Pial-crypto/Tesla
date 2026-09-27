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
async function cancelRide(passengerId, rideId) {
  const ride = await db.orm.public.Ride
    .where({ id: rideId })
    .first();

  if (!ride) {
    const error = new Error("Ride not found");
    error.statusCode = 404;
    throw error;
  }

  if (ride.passengerId !== passengerId) {
    const error = new Error("You can only cancel your own ride");
    error.statusCode = 403;
    throw error;
  }

  if (ride.status === "COMPLETED") {
    const error = new Error("Completed ride cannot be cancelled");
    error.statusCode = 409;
    throw error;
  }

  if (ride.status === "CANCELLED") {
    const error = new Error("Ride is already cancelled");
    error.statusCode = 409;
    throw error;
  }

  const updatedRide = await db.orm.public.Ride
    .where({ id: ride.id })
    .update({
      status: "CANCELLED",
      poolId: null,
    });

  await db.orm.public.RideEvent.create({
    rideId: ride.id,
    fromStatus: ride.status,
    toStatus: "CANCELLED",
    actorId: passengerId,
    note: "Cancelled by passenger",
  });

  return updatedRide;
}
async function getRideHistory(passengerId, rideId) {
  const ride = await db.orm.public.Ride
    .where({ id: rideId })
    .first();

  if (!ride) {
    const error = new Error("Ride not found");
    error.statusCode = 404;
    throw error;
  }

  if (ride.passengerId !== passengerId) {
    const error = new Error("You can only view your own ride history");
    error.statusCode = 403;
    throw error;
  }

  const events = await db.orm.public.RideEvent
    .where({ rideId: ride.id })
    .all();

  return events;
}
export {
  createRide,
  getPassengerRides,
  estimateFare,
  cancelRide,
  getRideHistory,
};