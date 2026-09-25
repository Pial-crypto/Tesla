import * as authService from "../services/auth.service.js";
import { signToken } from "../utils/auth.js";
import { signUpValidator } from "../validators/auth.validator.js";

async function signup(req, res) {
    console.log("request in sighnup")
  const { name, email, password, role = "PASSENGER" } = req.body;
  console.log("Signup request body:", req.body);
signUpValidator(name, email, password, role);


  const user = await authService.signup({
    name,
    email,
    password,
    role,
  });
  const token = signToken(user);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await authService.login({
    email,
    password,
  });

const token = signToken(user);

res.json({
  success: true,
  token,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});
}



export { signup, login };