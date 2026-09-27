// import jwt from "jsonwebtoken";
// const SECRET = process.env.JWT_SECRET;

// export function verifyToken(token: string | null): any {
//     console.log("Verifying token:", token);
//     console.log("Using secret:", SECRET);

//     if (!token) {
//         throw new Error("Token is required");
//     }

//     if (!SECRET) {
//         throw new Error("JWT secret is not configured");
//     }

//     return jwt.verify(token, SECRET);
// }