import mongoose from 'mongoose'

let cached = global.mongoose || {conn: null, promise: null}

export default async function connectDB(){
  if(cached.conn) return cached.conn
  if(!cached.promise){
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => {
      console.log("Connected to DB")
      return mongoose;
    })
  }
  try {
    cached.conn = await cached.promise
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
  }
  return cached.conn;
}