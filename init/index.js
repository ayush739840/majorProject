const mongoose= require("mongoose");
const initData = require("./data.js");

const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("../models/listing.js");
main()
.then(()=>{
    console.log("connected to db")
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
};

const initDB= async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({
       ...obj,
        owner:"69c5424a51364568bc8c9171"
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialize");
}

initDB();