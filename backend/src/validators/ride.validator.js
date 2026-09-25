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

function validateRideRequest(body) {
  const {
    pickup,
    destination,
    seats = 1,
    paymentMethod = "CASH",
  } = body;

  if (!ZONES.includes(pickup) || !ZONES.includes(destination)) {
    const error = new Error("valid pickup and destination are required");
    error.statusCode = 400;
    throw error;
  }

  if (
    !Number.isInteger(seats) ||
    seats < 1 ||
    seats > 3
  ) {
    const error = new Error("seats must be between 1 and 3");
    error.statusCode = 400;
    throw error;
  }

  if (!["CASH", "TESLAPAY"].includes(paymentMethod)) {
    const error = new Error("payment must be CASH or TESLAPAY");
    error.statusCode = 400;
    throw error;
  }

  return {
    pickup,
    destination,
    seats,
    paymentMethod,
  };
}

function validateFareEstimate(query) {
  const {
    from,
    to,
    seats = "1",
  } = query;

  const parsedSeats = Number(seats);

  if (!ZONES.includes(from) || !ZONES.includes(to)) {
    const error = new Error("unknown zone");
    error.statusCode = 400;
    throw error;
  }

  if (
    !Number.isInteger(parsedSeats) ||
    parsedSeats < 1 ||
    parsedSeats > 3
  ) {
    const error = new Error("seats must be between 1 and 3");
    error.statusCode = 400;
    throw error;
  }

  return {
    from,
    to,
    seats: parsedSeats,
  };
}

export {
  ZONES,
  validateRideRequest,
  validateFareEstimate,
};