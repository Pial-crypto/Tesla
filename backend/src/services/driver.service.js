// import { db } from "../prisma/db.ts";
import { calcFare } from "../utils/fare.js";
import { db, pgPool } from "../prisma/db.ts";
async function getDriverRequests(driverId) {
  const vehicle = await db.orm.public.Vehicle
    .where({ driverId })
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
    .where({ status: "REQUESTED" })
    .all();
}

async function acceptRide(driverId, rideId) {
  const client = await pgPool.connect();

  try {
    await client.query("BEGIN");


    const vehicleResult = await client.query(
      `
        SELECT "id", "capacity"
        FROM "Vehicle"
        WHERE "driverId" = $1
        FOR UPDATE
      `,
      [driverId]
    );

    const vehicle = vehicleResult.rows[0];

    if (!vehicle) {
      const error = new Error("no vehicle for this driver");
      error.statusCode = 404;
      throw error;
    }

    const rideResult = await client.query(
      `
        SELECT *
        FROM "Ride"
        WHERE "id" = $1
        FOR UPDATE
      `,
      [Number(rideId)]
    );

    const ride = rideResult.rows[0];

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

    // Find an OPEN pool for this Tesla.
    const poolResult = await client.query(
      `
        SELECT *
        FROM "Pool"
        WHERE "vehicleId" = $1
          AND "status" = 'OPEN'
        ORDER BY "id"
        LIMIT 1
        FOR UPDATE
      `,
      [vehicle.id]
    );

    let pool = poolResult.rows[0] ?? null;

   
    if (pool) {
      const existingRidesResult = await client.query(
        `
          SELECT *
          FROM "Ride"
          WHERE "poolId" = $1
        `,
        [pool.id]
      );

      const existingPoolRides = existingRidesResult.rows;

      const activeExistingRides = existingPoolRides.filter((poolRide) =>
        ["MATCHED", "DRIVER_ARRIVED", "STARTED"].includes(
          poolRide.status
        )
      );

      
      if (activeExistingRides.length === 0) {
        const updatedPoolResult = await client.query(
          `
            UPDATE "Pool"
            SET "pickupZone" = $1,
                "updatedAt" = NOW()
            WHERE "id" = $2
            RETURNING *
          `,
          [ride.pickupZone, pool.id]
        );

        pool = updatedPoolResult.rows[0];
      } else if (pool.pickupZone !== ride.pickupZone) {
        const error = new Error(
          `pool pickup is ${pool.pickupZone}; incompatible with ${ride.pickupZone}`
        );
        error.statusCode = 409;
        throw error;
      }
    }

    if (!pool) {
      const newPoolResult = await client.query(
        `
          INSERT INTO "Pool" (
            "vehicleId",
            "pickupZone",
            "status",
            "createdAt",
            "updatedAt"
          )
          VALUES ($1, $2, 'OPEN', NOW(), NOW())
          RETURNING *
        `,
        [vehicle.id, ride.pickupZone]
      );

      pool = newPoolResult.rows[0];
    }

   
    const poolRidesResult = await client.query(
      `
        SELECT *
        FROM "Ride"
        WHERE "poolId" = $1
        FOR UPDATE
      `,
      [pool.id]
    );

    const poolRides = poolRidesResult.rows;

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

    const allPoolRides = [...activePoolRides, ride];

    const isPooled = allPoolRides.length >= 2;

    
    for (const poolRide of allPoolRides) {
      const fare = calcFare(
        poolRide.pickupZone,
        poolRide.destZone,
        poolRide.seats,
        isPooled
      );

      await client.query(
        `
          UPDATE "Ride"
          SET "farePaisa" = $1,
              "updatedAt" = NOW()
          WHERE "id" = $2
        `,
        [fare.fare, poolRide.id]
      );
    }

  
    const updatedRideResult = await client.query(
      `
        UPDATE "Ride"
        SET "status" = 'MATCHED',
            "poolId" = $1,
            "updatedAt" = NOW()
        WHERE "id" = $2
          AND "status" = 'REQUESTED'
        RETURNING *
      `,
      [pool.id, ride.id]
    );

    const updatedRide = updatedRideResult.rows[0];

    if (!updatedRide) {
      const error = new Error("ride is no longer available");
      error.statusCode = 409;
      throw error;
    }

  
    await client.query(
      `
        INSERT INTO "RideEvent" (
          "rideId",
          "fromStatus",
          "toStatus",
          "actorId",
          "note",
          "at"
        )
        VALUES ($1, 'REQUESTED', 'MATCHED', $2, $3, NOW())
      `,
      [ride.id, driverId, `pool ${pool.id}`]
    );

    await client.query("COMMIT");

    return {
      poolId: pool.id,
      rideId: updatedRide.id,
      status: updatedRide.status,
      seatsUsed: seatsUsed + ride.seats,
      capacity: vehicle.capacity,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getDriverPool(driverId) {
  const vehicle = await db.orm.public.Vehicle
    .where({ driverId })
    .first();

  if (!vehicle) {
    const error = new Error("no vehicle for this driver");
    error.statusCode = 404;
    throw error;
  }

  const pools = await db.orm.public.Pool
    .where({ vehicleId: vehicle.id })
    .all();


  for (const pool of pools) {
    if (
      !["OPEN", "DRIVER_ARRIVED", "STARTED"].includes(pool.status)
    ) {
      continue;
    }

    const rides = await db.orm.public.Ride
      .where({ poolId: pool.id })
      .all();

    const activeRides = rides.filter((ride) =>
      ["MATCHED", "DRIVER_ARRIVED", "STARTED"].includes(
        ride.status
      )
    );

    if (activeRides.length > 0) {
      return {
        pool,
        rides,
      };
    }
  }

  return null;
}

async function arriveAtPool(driverId) {
  const vehicle = await db.orm.public.Vehicle
    .where({ driverId })
    .first();

  if (!vehicle) {
    const error = new Error("no vehicle for this driver");
    error.statusCode = 404;
    throw error;
  }

  const pools = await db.orm.public.Pool
    .where({ vehicleId: vehicle.id })
    .all();

  const pool = pools.find((item) => item.status === "OPEN");

  if (!pool) {
    const error = new Error("no open pool");
    error.statusCode = 404;
    throw error;
  }

  const rides = await db.orm.public.Ride
    .where({ poolId: pool.id })
    .all();

  const activeRides = rides.filter((ride) =>
    ["MATCHED", "DRIVER_ARRIVED", "STARTED"].includes(
      ride.status
    )
  );

  if (activeRides.length === 0) {
    const error = new Error("pool has no active rides");
    error.statusCode = 409;
    throw error;
  }

  await db.orm.public.Pool
    .where({ id: pool.id })
    .update({
      status: "DRIVER_ARRIVED",
    });

  for (const ride of activeRides) {
    await db.orm.public.Ride
      .where({ id: ride.id })
      .update({
        status: "DRIVER_ARRIVED",
      });

    await db.orm.public.RideEvent.create({
      rideId: ride.id,
      fromStatus: ride.status,
      toStatus: "DRIVER_ARRIVED",
      actorId: driverId,
      note: `pool ${pool.id}`,
    });
  }

  return {
    poolId: pool.id,
    status: "DRIVER_ARRIVED",
    rides: activeRides.map((ride) => ride.id),
  };
}

async function startPool(driverId) {
  const vehicle = await db.orm.public.Vehicle
    .where({ driverId })
    .first();

  if (!vehicle) {
    const error = new Error("no vehicle for this driver");
    error.statusCode = 404;
    throw error;
  }

  const pools = await db.orm.public.Pool
    .where({ vehicleId: vehicle.id })
    .all();

  const pool = pools.find(
    (item) => item.status === "DRIVER_ARRIVED"
  );

  if (!pool) {
    const error = new Error("no arrived pool");
    error.statusCode = 404;
    throw error;
  }

  const rides = await db.orm.public.Ride
    .where({ poolId: pool.id })
    .all();

  const activeRides = rides.filter(
    (ride) => ride.status === "DRIVER_ARRIVED"
  );

  if (activeRides.length === 0) {
    const error = new Error("pool has no arrived rides");
    error.statusCode = 409;
    throw error;
  }

  await db.orm.public.Pool
    .where({ id: pool.id })
    .update({
      status: "STARTED",
    });

  for (const ride of activeRides) {
    await db.orm.public.Ride
      .where({ id: ride.id })
      .update({
        status: "STARTED",
      });

    await db.orm.public.RideEvent.create({
      rideId: ride.id,
      fromStatus: "DRIVER_ARRIVED",
      toStatus: "STARTED",
      actorId: driverId,
      note: `pool ${pool.id}`,
    });
  }

  return {
    poolId: pool.id,
    status: "STARTED",
    rides: activeRides.map((ride) => ride.id),
  };
}

async function completePool(driverId) {
  const vehicle = await db.orm.public.Vehicle
    .where({ driverId })
    .first();

  if (!vehicle) {
    const error = new Error("no vehicle for this driver");
    error.statusCode = 404;
    throw error;
  }

  const pools = await db.orm.public.Pool
    .where({ vehicleId: vehicle.id })
    .all();

  const pool = pools.find(
    (item) => item.status === "STARTED"
  );

  if (!pool) {
    const error = new Error("no started pool");
    error.statusCode = 404;
    throw error;
  }

  const rides = await db.orm.public.Ride
    .where({ poolId: pool.id })
    .all();

  const activeRides = rides.filter(
    (ride) => ride.status === "STARTED"
  );

  if (activeRides.length === 0) {
    const error = new Error("pool has no started rides");
    error.statusCode = 409;
    throw error;
  }

  await db.orm.public.Pool
    .where({ id: pool.id })
    .update({
      status: "COMPLETED",
    });

  for (const ride of activeRides) {
    await db.orm.public.Ride
      .where({ id: ride.id })
      .update({
        status: "COMPLETED",
      });

    await db.orm.public.RideEvent.create({
      rideId: ride.id,
      fromStatus: "STARTED",
      toStatus: "COMPLETED",
      actorId: driverId,
      note: `pool ${pool.id}`,
    });
  }

  return {
    poolId: pool.id,
    status: "COMPLETED",
    rides: activeRides.map((ride) => ride.id),
  };
}

async function getDriverHistory(driverId) {
  const vehicle = await db.orm.public.Vehicle
    .where({ driverId })
    .first();

  if (!vehicle) {
    const error = new Error("no vehicle for this driver");
    error.statusCode = 404;
    throw error;
  }

  const pools = await db.orm.public.Pool
    .where({ vehicleId: vehicle.id })
    .all();

  const completedPools = pools.filter(
    (pool) => pool.status === "COMPLETED"
  );

  const history = [];

  for (const pool of completedPools) {
    const rides = await db.orm.public.Ride
      .where({ poolId: pool.id })
      .all();

    history.push({
      pool,
      rides,
    });
  }

  return history;
}

export {
  getDriverRequests,
  acceptRide,
  getDriverPool,
  arriveAtPool,
  startPool,
  completePool,
  getDriverHistory,
};