import mongoose from "mongoose";


const communitySchema = new mongoose.Schema(
    {
      name: { type: String, required: true }, // Community name
      description: { type: String, default: "" }, // Description of the community
      profilePic: { type: String, default: "" }, // Community profile picture
      admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // List of community admins
      groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }], // Groups inside the community
      members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Community members
    },
    { timestamps: true }
  );
  
  export const Community = mongoose.model("Community", communitySchema);
  