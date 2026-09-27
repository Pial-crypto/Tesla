import { db } from "../prisma/db.ts";

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

export {
  getDriverRequests,
};