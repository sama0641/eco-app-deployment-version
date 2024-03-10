require("dotenv").config();
const jwt = require("jsonwebtoken");
const CustomError = require("../ErrorHandling/Error");

const verify = (req, res, next) => {
  let receivedToken;

  // Extract the cookie string from the headers
  const cookieHeader = req?.headers?.cookie;

  if (!cookieHeader) {
    throw new CustomError(402, "You are not authorized");
  }

  // Parse the cookie string to get an object of key-value pairs
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {});

  // Check if the cookie containing the token exists
  if (!cookies.access_token) {
    throw new CustomError(402, "You are not authorized");
  }

  // Extract the token from the cookie
  receivedToken = cookies.access_token;

  try {
    // Verify the token
    const decodedToken = jwt.verify(receivedToken, process.env.JWT_KEY);
    req.user = decodedToken;
    next();
  } catch (error) {
    // Handle token verification failure
    throw new CustomError(402, "Invalid token");
  }
};

module.exports = verify;
