const ZONES = [
  "GULSHAN",
  "BANANI",
  "UTTARA",
  "MIRPUR",
  "DHANMONDI",
  "MOHAMMADPUR",
  "BASHUNDHARA",
  "MOTIJHEEL",
];

const BASE_FARE_PAISA = 5000;
const PER_ZONE_FARE_PAISA = 2000;
const POOL_DISCOUNT_PERCENT = 15;

function calcFare(from, to, seats = 1, pooled = false) {
  const fromIndex = ZONES.indexOf(from);
  const toIndex = ZONES.indexOf(to);

  if (fromIndex === -1 || toIndex === -1) {
    const error = new Error("unknown zone");
    error.statusCode = 400;
    throw error;
  }

  const zoneDistance = Math.max(
    Math.abs(fromIndex - toIndex),
    1
  );

  const solo =
    BASE_FARE_PAISA +
    zoneDistance * PER_ZONE_FARE_PAISA;

  const seatMultiplier = Math.max(seats, 1);

  const beforeDiscount = solo * seatMultiplier;

  const fare = pooled
    ? Math.round(
        beforeDiscount *
          (1 - POOL_DISCOUNT_PERCENT / 100)
      )
    : beforeDiscount;

  return {
    solo: beforeDiscount,
    fare,
    zoneDistance,
  };
}

export {
  ZONES,
  calcFare,
};