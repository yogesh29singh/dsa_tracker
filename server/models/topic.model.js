import mongoose, { Schema } from "mongoose";

const ProblemSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true
    },
    leetcodeLink: { type: String },
    youtubeLink: { type: String },
    articleLink: { type: String },
}, { _id: true });



const TopicSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: { type: String },
    problems: [ProblemSchema]
}, { timestamps: true });



export const Topic = mongoose.model("Topic", TopicSchema);