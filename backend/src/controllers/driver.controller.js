import {
  getDriverRequests,
} from "../services/driver.service.js";

async function getRequests(req, res, next) {
  try {
    const rides = await getDriverRequests(req.user.id);

    res.json({
      success: true,
      rides,
    });
  } catch (error) {
    next(error);
  }
}

export {
  getRequests,
};