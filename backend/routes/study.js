const express=require("express");
const router=express.Router();
const axios=require("axios");


router.post("/", async(req,res)=>{

 const { topic } = req.body;

 const prompt = `
 Explain the computer science topic "${topic}" for a CSE student.

 Give:
 1. simple explanation
 2. key concepts
 3. example code (if relevant)
 4. 3 practice questions easy, medium, hard each
 `;

 try {

 const response = await axios.post(
   "https://api.groq.com/openai/v1/chat/completions",
   {
     model: "llama-3.1-8b-instant",
     messages: [{ role: "user", content: prompt }]
   },
   {
     headers: {
       Authorization: `Bearer ${process.env.GROQ_API_KEY}`
     }
   }
 );

 res.json(response.data);

 } catch (error) {
   res.status(500).json({ error: "AI request failed" });
 }

});

module.exports = router;