import app from "./app";

export default { 
  port: process.env.PORT, 
  fetch: app.fetch, 
  listen: ()=>{
    console.log('Server is listening')
  }
} 