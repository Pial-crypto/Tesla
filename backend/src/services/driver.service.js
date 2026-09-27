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
async function getDriverPool(driverId) {
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

const pools = await db.orm.public.Pool
  .where({
    vehicleId: vehicle.id,
  })
  .all();

const pool = pools.find((item) =>
  ["OPEN", "DRIVER_ARRIVED", "STARTED"].includes(item.status)
);

  if (!pool) {
    return null;
  }

  const rides = await db.orm.public.Ride
    .where({
      poolId: pool.id,
    })
    .all();

  return {
    pool,
    rides,
  };
}

async function arriveAtPool(driverId) {
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

  const pools = await db.orm.public.Pool
    .where({
      vehicleId: vehicle.id,
    })
    .all();

  const pool = pools.find((item) => item.status === "OPEN");

  if (!pool) {
    const error = new Error("no open pool");
    error.statusCode = 404;
    throw error;
  }

  const rides = await db.orm.public.Ride
    .where({
      poolId: pool.id,
    })
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
    .where({
      id: pool.id,
    })
    .update({
      status: "DRIVER_ARRIVED",
    });

  for (const ride of activeRides) {
    await db.orm.public.Ride
      .where({
        id: ride.id,
      })
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
    .where({
      driverId,
    })
    .first();

  if (!vehicle) {
    const error = new Error("no vehicle for this driver");
    error.statusCode = 404;
    throw error;
  }

  const pools = await db.orm.public.Pool
    .where({
      vehicleId: vehicle.id,
    })
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
    .where({
      poolId: pool.id,
    })
    .all();

  const activeRides = rides.filter((ride) =>
    ["DRIVER_ARRIVED"].includes(ride.status)
  );

  if (activeRides.length === 0) {
    const error = new Error("pool has no arrived rides");
    error.statusCode = 409;
    throw error;
  }

  await db.orm.public.Pool
    .where({
      id: pool.id,
    })
    .update({
      status: "STARTED",
    });

  for (const ride of activeRides) {
    await db.orm.public.Ride
      .where({
        id: ride.id,
      })
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
    .where({
      driverId,
    })
    .first();

  if (!vehicle) {
    const error = new Error("no vehicle for this driver");
    error.statusCode = 404;
    throw error;
  }

  const pools = await db.orm.public.Pool
    .where({
      vehicleId: vehicle.id,
    })
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
    .where({
      poolId: pool.id,
    })
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
    .where({
      id: pool.id,
    })
    .update({
      status: "COMPLETED",
    });

  for (const ride of activeRides) {
    await db.orm.public.Ride
      .where({
        id: ride.id,
      })
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
    .where({
      driverId,
    })
    .first();

  if (!vehicle) {
    const error = new Error("no vehicle for this driver");
    error.statusCode = 404;
    throw error;
  }

  const pools = await db.orm.public.Pool
    .where({
      vehicleId: vehicle.id,
    })
    .all();

  const completedPools = pools.filter(
    (pool) => pool.status === "COMPLETED"
  );

  const history = [];

  for (const pool of completedPools) {
    const rides = await db.orm.public.Ride
      .where({
        poolId: pool.id,
      })
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
  getDriverHistory
};

