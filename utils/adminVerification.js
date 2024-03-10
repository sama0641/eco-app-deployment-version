require("dotenv").config();
const jwt = require("jsonwebtoken");
const CustomError = require("../ErrorHandling/Error");

const adminVerification = (req, res, next) => {
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
    const decodedToken = jwt.verify(receivedToken, process.env.JWT_KEY);

    // Destructure username and role from the decoded token
    const { username, role } = decodedToken;

    // Check if the username is 'AdminLia' and the role is 'admin'
    if (username === "AdminLia" && role === "admin") {
      req.user = { ...decodedToken, username, role };
      next();
    } else {
      throw new CustomError(
        403,
        "You are not authorized to access this resource"
      );
    }
  } catch (error) {
    throw new CustomError(401, "Invalid token");
  }
};

module.exports = adminVerification;
