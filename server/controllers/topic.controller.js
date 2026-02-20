import { Topic } from "../models/topic.model.js";
import { UserProgress } from "../models/progress.model.js";
import { User } from "../models/user.model.js";


// Add Topic
export const addTopic = async (req, res) => {
    try {
        const { title, description="" } = req.body;
       
        if(!title || !description){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const topic = await Topic.create({ title, description });

        res.status(201).json({
            success: true,
            message: "Topic added successfully",
            data: topic
        });
    }
    catch (err) {
        console.log("Error in Register : ", err);
        return res.status(500).json({
            success: false,
            message: "Internal server Error",
        })
    }
};


// Delete Topic
export const deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTopic = await Topic.findByIdAndDelete(id);

        if (!deletedTopic) {
        return res.status(404).json({
            success: false,
            message: "Topic not found",
        });
        }

        await UserProgress.deleteMany({ topic: id });

        return res.status(200).json({
            success: true,
            message: "Topic and all its problems deleted successfully",
        });
    }
    catch (err) {
        console.log("Error in deleteTopic : ", err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Add Problem
export const addProblem = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { title, difficulty, leetcodeLink, youtubeLink, articleLink } = req.body;

        if(!title || !difficulty){
            return res.status(400).json({
                success: false,
                message: "Title and difficulty are required"
            });
        }

        const topic = await Topic.findById(topicId);
        
        if(!topic){
            return res.status(404).json({
                success: false,
                message: "Topic not found"
            });
        }

        topic.problems.push({ title, difficulty, leetcodeLink, youtubeLink, articleLink });
        await topic.save();

        res.status(201).json({
            success: true,
            message: "Problem added successfully",
            data: topic
        });
    } catch (err) {
        console.log("Error in addProblem : ", err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Delete Problem
export const deleteProblem = async (req, res) => {
    try {
        const { topicId, problemId } = req.params;

        const topic = await Topic.findById(topicId);
        
        if(!topic){
            return res.status(404).json({
                success: false,
                message: "Topic not found"
            });
        }

        const problem = topic.problems.id(problemId);
       
        if(!problem){
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        topic.problems.pull(problemId);
        await topic.save();

        res.status(200).json({
            success: true,
            message: "Problem deleted successfully"
        });
    } catch (err) {
        console.log("Error in deleteProblem : ", err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



// Check Toggle
export const toggleProblem = async (req, res) => {
    const userId = req.user.id;
    const { topicId, problemId } = req.body;

    let progress = await UserProgress.findOne({ user: userId, problem: problemId });
    if (!progress) {
        progress = await UserProgress.create({
        user: userId,
        topic: topicId,
        problem: problemId,
        completed: true,
        completedAt: new Date()
        });
    }
    else {
        progress.completed = !progress.completed;
        progress.completedAt = progress.completed ? new Date() : null;
        await progress.save();
    }

    res.status(200).json(progress);
};


// Both Common Dashboard
export const getDashboardData = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const isAdmin = currentUser.role === "admin";
    const userId = currentUser._id || currentUser.id;

    let topicsQuery = Topic.find();

    if (!isAdmin) {
      topicsQuery = topicsQuery.select(
        "title description problems._id problems.title problems.difficulty " +
        "problems.leetcodeLink problems.youtubeLink problems.articleLink"
      );
    }

    const topics = await topicsQuery.lean();

    // Student view 
    if (!isAdmin) {
      const user = await User.findById(userId)
        .select("fullName username email role")
        .lean();

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const progressDocs = await UserProgress.find({ user: userId }).lean();

      const progressMap = {};
      progressDocs.forEach((p) => {
        const tid = p.topic.toString();
        const pid = p.problem.toString();
        if (!progressMap[tid]) progressMap[tid] = {};
        progressMap[tid][pid] = {
          completed: p.completed,
          completedAt: p.completedAt,
        };
      });

      const topicsWithProgress = topics.map((topic) => {
        const topicIdStr = topic._id.toString();
        const userTopicProgress = progressMap[topicIdStr] || {};

        const problemsWithStatus = topic.problems.map((prob) => {
          const probIdStr = prob._id.toString();
          const prog = userTopicProgress[probIdStr] || { completed: false };

          return {
            _id: prob._id,
            title: prob.title,
            difficulty: prob.difficulty,
            leetcodeLink: prob.leetcodeLink,
            youtubeLink: prob.youtubeLink,
            articleLink: prob.articleLink,
            completed: prog.completed,
            completedAt: prog.completedAt || null,
          };
        });

        return {
          _id: topic._id,
          title: topic.title,
          description: topic.description,
          totalProblems: topic.problems.length,
          completedCount: problemsWithStatus.filter((p) => p.completed).length,
          problems: problemsWithStatus,
        };
      });

      const totalCompleted = topicsWithProgress.reduce((sum, t) => sum + t.completedCount, 0);

      return res.status(200).json({
        success: true,
        isAdmin: false,
        user: {
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        topics: topicsWithProgress,
        totalCompleted,
      });
    }

   
    // Admin view
    const topicsForAdmin = topics.map((topic) => ({
      _id: topic._id,
      title: topic.title,
      description: topic.description,
      totalProblems: topic.problems.length,
      problems: topic.problems.map((prob) => ({
        _id: prob._id,
        title: prob.title,
        difficulty: prob.difficulty,
        leetcodeLink: prob.leetcodeLink,
        youtubeLink: prob.youtubeLink,
        articleLink: prob.articleLink,
      })),
    }));

    return res.status(200).json({
      success: true,
      isAdmin: true,
      topics: topicsForAdmin,
      totalTopics: topicsForAdmin.length,
      totalProblems: topicsForAdmin.reduce((sum, t) => sum + t.totalProblems, 0),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
};