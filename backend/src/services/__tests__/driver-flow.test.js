import { describe, expect, it, beforeEach } from "vitest";
import { db } from "../../prisma/db.ts";
import {
  acceptRide,
  arriveAtPool,
  startPool,
  completePool,
} from "../driver.service.js";

describe("driver flow integration", () => {
  let passenger;
  let driver;

  beforeEach(async () => {
    passenger = await db.orm.public.User
      .where({ email: "nusrat@oitesla.test" })
      .first();

    driver = await db.orm.public.User
      .where({ email: "jashim@oitesla.test" })
      .first();

    expect(passenger).toBeTruthy();
    expect(driver).toBeTruthy();


    const vehicle = await db.orm.public.Vehicle
      .where({ driverId: driver.id })
      .first();

    const existingPools = await db.orm.public.Pool
      .where({ vehicleId: vehicle.id })
      .all();

    for (const pool of existingPools) {
      if (["OPEN", "DRIVER_ARRIVED", "STARTED"].includes(pool.status)) {
        await db.orm.public.Pool
          .where({ id: pool.id })
          .update({ status: "COMPLETED" });
      }
    }
  });

  it("accepts a requested ride and moves it to MATCHED", async () => {
    const ride = await db.orm.public.Ride.create({
      passengerId: passenger.id,
      pickupZone: "Banani",
      destZone: "Mohakhali",
      seats: 1,
      status: "REQUESTED",
      fareSoloPaisa: 9000,
      farePaisa: 9000,
      paymentMethod: "CASH",
    });

    const result = await acceptRide(driver.id, ride.id);

    expect(result.status).toBe("MATCHED");
    expect(result.rideId).toBe(ride.id);
    expect(result.poolId).toBeTruthy();

    const updatedRide = await db.orm.public.Ride
      .where({ id: ride.id })
      .first();

    expect(updatedRide.status).toBe("MATCHED");
    expect(updatedRide.poolId).toBe(result.poolId);
  });

  it("completes the full driver pool lifecycle", async () => {
    const ride = await db.orm.public.Ride.create({
      passengerId: passenger.id,
      pickupZone: "Banani",
      destZone: "Mohakhali",
      seats: 1,
      status: "REQUESTED",
      fareSoloPaisa: 9000,
      farePaisa: 9000,
      paymentMethod: "CASH",
    });

    const accepted = await acceptRide(driver.id, ride.id);
    expect(accepted.status).toBe("MATCHED");

    const arrived = await arriveAtPool(driver.id);
    expect(arrived.status).toBe("DRIVER_ARRIVED");
    expect(arrived.rides).toContain(ride.id);

    const started = await startPool(driver.id);
    expect(started.status).toBe("STARTED");
    expect(started.rides).toContain(ride.id);

    const completed = await completePool(driver.id);
    expect(completed.status).toBe("COMPLETED");
    expect(completed.rides).toContain(ride.id);

    const finalRide = await db.orm.public.Ride
      .where({ id: ride.id })
      .first();

    expect(finalRide.status).toBe("COMPLETED");
  });

  it("rejects starting a pool before driver arrival", async () => {
    await expect(
      startPool(driver.id)
    ).rejects.toThrow("no arrived pool");
  });

  it("rejects a ride when pool capacity would be exceeded", async () => {
    const firstRide = await db.orm.public.Ride.create({
      passengerId: passenger.id,
      pickupZone: "Gulshan 1",
      destZone: "Banani",
      seats: 2,
      status: "REQUESTED",
      fareSoloPaisa: 11000,
      farePaisa: 11000,
      paymentMethod: "CASH",
    });


    

    await acceptRide(driver.id, firstRide.id);

    const secondRide = await db.orm.public.Ride.create({
      passengerId: passenger.id,
      pickupZone: "Gulshan 1",
      destZone: "Banani",
      seats: 2,
      status: "REQUESTED",
      fareSoloPaisa: 11000,
      farePaisa: 11000,
      paymentMethod: "CASH",
    });

    await expect(
      acceptRide(driver.id, secondRide.id)
    ).rejects.toThrow(/seat\(s\) left/);
  });

  it("prevents concurrent accepts from exceeding capacity", async () => {
  const firstPassenger = passenger;

  const secondPassenger = await db.orm.public.User
    .where({ email: "rafiq@oitesla.test" })
    .first();

  const firstRide = await db.orm.public.Ride.create({
    passengerId: firstPassenger.id,
    pickupZone: "Mirpur",
    destZone: "Uttara",
    seats: 2,
    status: "REQUESTED",
    fareSoloPaisa: 11000,
    farePaisa: 11000,
    paymentMethod: "CASH",
  });

  const secondRide = await db.orm.public.Ride.create({
    passengerId: secondPassenger.id,
    pickupZone: "Mirpur",
    destZone: "Uttara",
    seats: 2,
    status: "REQUESTED",
    fareSoloPaisa: 11000,
    farePaisa: 11000,
    paymentMethod: "CASH",
  });

  const results = await Promise.allSettled([
    acceptRide(driver.id, firstRide.id),
    acceptRide(driver.id, secondRide.id),
  ]);

  const successful = results.filter(
    (result) => result.status === "fulfilled"
  );

  const failed = results.filter(
    (result) => result.status === "rejected"
  );

  expect(successful).toHaveLength(1);
  expect(failed).toHaveLength(1);

  const rides = await db.orm.public.Ride
    .where({ poolId: successful[0].value.poolId })
    .all();

  const activeSeats = rides
    .filter((ride) =>
      ["MATCHED", "DRIVER_ARRIVED", "STARTED"].includes(ride.status)
    )
    .reduce((total, ride) => total + ride.seats, 0);

  expect(activeSeats).toBeLessThanOrEqual(3);
});
});