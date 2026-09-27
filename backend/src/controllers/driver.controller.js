import {
    acceptRide,
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
async function acceptDriverRide(req, res, next) {
  try {
    const result = await acceptRide(
      req.user.id,
      req.params.id
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
export {
  getRequests,
  acceptDriverRide
};