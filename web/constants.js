export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

console.log({ALCHEMY_API_KEY, port: process.env.PORT})

if(!ALCHEMY_API_KEY){
  throw new Error("ALCHEMY_API_KEY not provided")
}