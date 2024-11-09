import { Router } from "express";

export const spaceRouter = Router();



spaceRouter.post("/",(req,res)=>{

})


spaceRouter.delete("/:spaceId",(req,res)=>{
    
})

spaceRouter.get("/all",(req,res)=>{

})



// Arena endpoints 

// Get a space --> GET /api/v1/space/:spaceId 
spaceRouter.get("/:spaceId",(req,res)=>{

})

// Add an element --> POST /api/v1/space/element
spaceRouter.post("/element",(req,res)=>{

})

// Delete an element --> DELETE /api/v1/space/element
spaceRouter.delete("/element",(req,res)=>{

})
