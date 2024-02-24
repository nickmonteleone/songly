require("dotenv").config()

const SECRET_KEY:string = process.env.SECRET_KEY || "secret-dev";

const PORT:number = Number(process.env.PORT) || 3001;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri():string {
  return (process.env.NODE_ENV === "test")
      ? "postgresql:///songly_test"
      : process.env.DATABASE_URL || "postgresql:///songly";
}


export {
  SECRET_KEY,
  PORT,
  getDatabaseUri,
};