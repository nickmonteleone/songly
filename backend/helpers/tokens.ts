
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

interface IUser {
  username: string;
  isAdmin?: boolean;
}

/** return signed JWT
 * with {username, isAdmin} payload from user data.
 */

function createToken(user:IUser):string {
  console.assert(user.isAdmin !== undefined,
      "createToken passed user without isAdmin property");

  let payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, SECRET_KEY);
}

export { createToken };
