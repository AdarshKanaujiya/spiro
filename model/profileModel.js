import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  phone: { type: String, default: "" },         
  branch: { type: String, default: "" },
  age: { type: Number, default: null },
  education: { type: String, default: "" }, 
  github: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  // purchasedCourses: [
  //   {
  //     courseId: { type: String, required: true },
  //     name: String,
  //     image: String,
  //     purchasedAt: { type: Date, default: Date.now },
  //   }
  // ]
});



const profileModel = mongoose.models.Profile || mongoose.model("Profile", profileSchema)

export default profileModel;
