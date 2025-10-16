import mongoose, { Document, Schema } from "mongoose";

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;        
  listingId?: mongoose.Types.ObjectId;   
  roommateId?: mongoose.Types.ObjectId;   
  createdAt?: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: false,
    },
    roommateId: {
      type: Schema.Types.ObjectId,
      ref: "Roommate",
      required: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);


const Favorite = mongoose.model<IFavorite>("Favorite", favoriteSchema);

export default Favorite;
