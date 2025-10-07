const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    // Reference to the user who created the post
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Title (Reddit-style posts always have a title)
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    // Type of post: "text", "link", or "media"
    postType: {
      type: String,
      enum: ["text", "link", "media"],
      default: "text",
    },

    // Text content (if it's a text post)
    content: {
      type: String,
      default: "",
    },

    // If it’s a link post
    linkUrl: {
      type: String,
      default: "",
    },

    // Image or video URLs
    mediaIDs: [
      {
        type: String,
      },
    ],

    // Flair or tag (like “Discussion”, “Meme”, “News”)
    flair: {
      type: String,
      default: "",
      trim: true,
    },

    // Vote counts — can also be moved to separate microservice later
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },

    // Comment count (cached for faster fetching)
    commentCount: {
      type: Number,
      default: 0,
    },

    // Track post visibility
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Virtual for score (Reddit-style)
postSchema.virtual("score").get(function () {
  return this.upvotes - this.downvotes;
});

//if we don't want a different search service then 
postSchema.index({content :  'text'})
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
