const Listing=require("../models/listing");

module.exports.index= async (req,res)=>{
    
   const allListing= await Listing.find({});
   res.render("listings/index.ejs",{allListing});
    
}

module.exports.renderNewForm = (req,res)=>{
    // console.log("create new listing");
    console.log(req.user);
 
    res.render("listings/new.ejs");
    
}

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing =await Listing.findById(id)
    .populate({path:"reviews",
        populate:{
        path:"author",
        },
    })
    .populate("owner");
    if(!listing){
       req.flash("error" ,"listing you requested does not exist!"); 
       return res.redirect("/listings");
    }
   
    
         res.render("listings/show.ejs" ,{listing});
    
     

}

module.exports.createListing = async (req,res,next)=>{
        let url = req.file.path;
        let filename =req.file.filename;
        
        // let {title,description,price,location,country,image}=req.body;
        let list = req.body.listing;
        let newListing =new Listing(list);
        newListing.image ={url,filename}
        newListing.owner=req.user._id;
        await newListing.save();
        req.flash("success" , "new listings Created!");
        res.redirect("/listings");
   
}

module.exports.renderEditForm = async (req,res)=>{
    let {id}= req.params;
    const listing =await Listing.findById(id);
    if(!listing){
       req.flash("error" ,"listing you requested does not exist!"); 
        return res.redirect("/listings");
    }
        let originalImageUrl = listing.image.url;
        originalImageUrl=originalImageUrl.replace("/upload" ,"/upload/h_300,w_250/")
         return res.render("listings/edit.ejs" ,{originalImageUrl,listing});
 
}

module.exports.updateListing =async (req,res)=>{
    
   
        let {id} = req.params;
        let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
        if( typeof req.file !== "undefined"){              
            let url = req.file.path;
            let filename =req.file.filename;
            listing.image={url,filename};
            await listing.save();
        }
        req.flash("success" , " listing Updated");
        res.redirect(`/listings/${id}`);
  
}

module.exports.destroyListing =  async (req,res)=>{
    let {id}=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success" , " listing deleted");
    console.log("Deletion successful",deletedListing);
    res.redirect("/listings");
}

