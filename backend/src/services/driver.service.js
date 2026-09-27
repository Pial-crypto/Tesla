import { db } from "../prisma/db.ts";
import { calcFare } from "../utils/fare.js";
async function getDriverRequests(driverId) {
  const vehicle = await db.orm.public.Vehicle
    .where({
      driverId,
    })
    .first();

  if (!vehicle) {
    const error = new Error("no vehicle for this driver");
    error.statusCode = 404;
    throw error;
  }

  const activePool = await db.orm.public.Pool
    .where({
      vehicleId: vehicle.id,
      status: "OPEN",
    })
    .first();

  if (activePool) {
    return db.orm.public.Ride
      .where({
        status: "REQUESTED",
        pickupZone: activePool.pickupZone,
      })
      .all();
  }

  return db.orm.public.Ride
    .where({
      status: "REQUESTED",
    })
    .all();
}
async function acceptRide(driverId, rideId) {
  const vehicle = await db.orm.public.Vehicle
    .where({
      driverId,
    })
    .first();

  if (!vehicle) {
    const error = new Error("no vehicle for this driver");
    error.statusCode = 404;
    throw error;
  }

  const ride = await db.orm.public.Ride
    .where({
      id: Number(rideId),
    })
    .first();

  if (!ride) {
    const error = new Error("ride not found");
    error.statusCode = 404;
    throw error;
  }

  if (ride.status !== "REQUESTED") {
    const error = new Error("ride is no longer available");
    error.statusCode = 409;
    throw error;
  }

  let pool = await db.orm.public.Pool
    .where({
      vehicleId: vehicle.id,
      status: "OPEN",
    })
    .first();


  if (pool && pool.pickupZone !== ride.pickupZone) {
    const error = new Error(
      `pool pickup is ${pool.pickupZone}; incompatible with ${ride.pickupZone}`
    );
    error.statusCode = 409;
    throw error;
  }

 
  if (!pool) {
    pool = await db.orm.public.Pool.create({
      vehicleId: vehicle.id,
      pickupZone: ride.pickupZone,
      status: "OPEN",
    });
  }


const poolRides = await db.orm.public.Ride
  .where({
    poolId: pool.id,
  })
  .all();

const activePoolRides = poolRides.filter((poolRide) =>
  ["MATCHED", "DRIVER_ARRIVED", "STARTED"].includes(
    poolRide.status
  )
);

const seatsUsed = activePoolRides.reduce(
  (total, poolRide) => total + poolRide.seats,
  0
);

  if (seatsUsed + ride.seats > vehicle.capacity) {
    const error = new Error(
      `only ${vehicle.capacity - seatsUsed} seat(s) left`
    );
    error.statusCode = 409;
    throw error;
  }
  
const allPoolRides = [
  ...activePoolRides,
  ride,
];

const isPooled = allPoolRides.length >= 2;

for (const poolRide of allPoolRides) {
  const fare = calcFare(
    poolRide.pickupZone,
    poolRide.destZone,
    poolRide.seats,
    isPooled
  );

  await db.orm.public.Ride
    .where({
      id: poolRide.id,
    })
    .update({
      farePaisa: fare.fare,
    });
}
const updatedRide = await db.orm.public.Ride
  .where({
    id: ride.id,
  })
  .update({
    status: "MATCHED",
    poolId: pool.id,
  });

await db.orm.public.RideEvent.create({
  rideId: ride.id,
  fromStatus: "REQUESTED",
  toStatus: "MATCHED",
  actorId: driverId,
  note: `pool ${pool.id}`,
});

return {
  poolId: pool.id,
  rideId: updatedRide.id,
  status: updatedRide.status,
  seatsUsed: seatsUsed + ride.seats,
  capacity: vehicle.capacity,
};
}
export {
  getDriverRequests,
  acceptRide
};