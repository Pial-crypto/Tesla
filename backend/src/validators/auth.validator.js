export const signUpValidator=(name, email, password, role)=>{
  if (
    !name ||
    !/^\S+@\S+$/.test(email || "") ||
    (password || "").length < 8 ||
    role !== "PASSENGER"
  ) {
    const error = new Error(
      "name, valid email, 8+ char password required (passenger signup only)"
    );

    error.statusCode = 400;
    throw error;
  }
}