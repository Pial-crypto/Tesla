import {
  getDriverRequests,
  acceptRide,
  getDriverPool,
  arriveAtPool,
  startPool,
  completePool,
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

async function getPool(req, res, next) {
  try {
    const pool = await getDriverPool(req.user.id);

    res.json({
      success: true,
      pool,
    });
  } catch (error) {
    next(error);
  }
}

async function arrivePool(req, res, next) {
  try {
    const result = await arriveAtPool(req.user.id);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
async function startDriverPool(req, res, next) {
  try {
    const result = await startPool(req.user.id);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

async function completeDriverPool(req, res, next) {
  try {
    const result = await completePool(req.user.id);

    res.json({
      success: true,
      ...result,
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
  acceptDriverRide,
  getPool,
  arrivePool,
  startDriverPool,
  completeDriverPool,
};