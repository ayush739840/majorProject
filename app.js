// if(process.env.NODE_ENV != "production"){
//     require('dotenv').config();
// }
require('dotenv').config();

// console.log(process.env.SECRET);
const express =require("express");
const app= express();
// let port = 8080;
const port = process.env.PORT || 8080;
const mongoose = require('mongoose');
// const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";

const dbUrl =process.env.ATLASDB_URL;

const path= require("path");

const ejsMate= require("ejs-mate");

const ExpressError =require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');

const listingRouter= require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const flash =require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");
const dns =require("dns");
dns.setServers(['1.1.1.1', '8.8.8.8']);
main()
.then(()=>{
    console.log("connected to db")
})
.catch(err => console.log(err));

async function main() {
     await mongoose.connect(dbUrl);
    //  await mongoose.connect(MONGO_URL);

   //await mongoose.connect("mongodb+srv://delta-student:DsGhuujEBOYlw5s9@cluster0.tafwnjl.mongodb.net/wanderlust?retryWrites=true&w=majority")
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
};

app.set("view engine" , "ejs");
app.set("views" ,path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
const methodOverride =require("method-override");

app.use(methodOverride("_method"));
app.engine("ejs" ,ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
//   crypto: {
//     secret: process.env.SECRET,
//   },
  touchAfter: 24 * 3600,
  collectionName: "secure_sessions"
});

store.on("error" ,(error)=>{
    console.log(" ERROR in MONGO SESSION STORE",error);
})
const sessionOptions ={
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized:true,
    cookie: {
        expires : Date.now()+ 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
}



// const store=MongoStore.create({
//     mongoUrl:dbUrl,
//     crypto:{
//         secret:"mysupersecretcode",
//     }
// });

// app.get("/",(req,res)=>{
//     res.send("welcome");
// });
 
app.use(session(sessionOptions));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser= req.user;
    next();
})



app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/" ,userRouter);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// app.use((err,req,res,next)=>{
//     let {statusCode=500,message="something went wrong!"}=err;
//      res.status(statusCode).render("listings/error.ejs",{err});
// //     console.log("ASLI ERROR YAHAN HAI:", err);
// //     res.status(statusCode).send(message);
// })
app.use((err, req, res, next) => {
    // Agar headers pehle hi send ho chuke hain, toh Express ke default handler ko do
    if (res.headersSent) {
        return next(err); 
    }
    
    // ASLI ERROR CONSOLE MEIN PRINT KARO TAAKI HUME PATA CHALE GHALTI KAHAN HAI
    console.log(" THE REAL ERROR IS HERE:", err.message);
    
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { err });
});

app.listen(port,()=>{
    console.log(`app is listening to the port ${port}`);
});

// app.get("/testListing" , async (req,res)=>{
//     let sampleListing= new Listing({
//         title : "My New Villa",
//         description: "by the beach",
//         price: 1200,
//         location :"calangute , goa",
//         country: "india",

//     })
//    await sampleListing.save();
//    console.log("sample was saved");
//    res.send("successfull testing");
// })

// app.all("/(.*)", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found!"));
// });



//    res.render("listings/index.ejs");
    
// app.get("/demouser", async (req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//     try {
//         const registerUser = await User.register(fakeUser, "helloworld!");
//         res.send(registerUser);
//     } catch (err) {
//         res.send(err.message);
//     }
// });
