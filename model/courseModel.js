import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    name: { type: String, required:true },
    image: { type: String, required:true },
    description: { type: String, required:true }, //on hover
    content: { type: String, required:true }, //on hover
    category: { type: String, required:true },  //for recommendation
    price: { type: Number, required:true },
    rating: { type: Number, default:0 },
    bestSeller: { type: Boolean, default:false },
    instructor: { type: String, required:true },
    date: { type: Date, default: Date.now },
    duration: { type: String, required:true }, //on hover

})

const courseModel = mongoose.models.course || mongoose.model("course", courseSchema)

export default courseModel