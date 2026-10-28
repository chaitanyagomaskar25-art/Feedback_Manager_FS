import mongoose from "mongoose";
import { Feedback } from "../models/FeedbackModel.js";

const categories = ["Product", "Service", "Teaching", "Event", "Other"];
const statuses = ["New", "Under Review", "In Progress", "Resolved", "Rejected"];
const canManageAll = (user) => ["admin", "manager"].includes(user.role);
const canEdit = (feedback, user) =>
  canManageAll(user) || (feedback.userId && feedback.userId.equals(user._id));

const visibleFeedback = (feedback, user) => {
  const record = feedback.toObject ? feedback.toObject() : { ...feedback };
  if (record.anonymous) record.name = "Anonymous";
  if (record.userId && !canManageAll(user)) delete record.userId;
  return record;
};

const validateContent = (body, { creating = false, privileged = false } = {}) => {
  const errors = {};
  if (creating || Object.hasOwn(body, "comment")) {
    if (typeof body.comment !== "string" || !body.comment.trim()) errors.comment = "Add a comment.";
    else if (body.comment.trim().length > 2000) errors.comment = "Comments must be 2,000 characters or fewer.";
  }
  if (creating || Object.hasOwn(body, "rating")) {
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = "Choose a rating from 1 to 5.";
  }
  if (creating || Object.hasOwn(body, "category")) {
    if (!categories.includes(body.category)) errors.category = "Choose a valid feedback category.";
  }
  if (creating || Object.hasOwn(body, "name")) {
    if (body.anonymous !== true && (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 80)) {
      errors.name = "Name must be between 1 and 80 characters.";
    }
  }
  if (Object.hasOwn(body, "status") && (!privileged || !statuses.includes(body.status))) {
    errors.status = "Choose a valid feedback status.";
  }
  if (Object.hasOwn(body, "anonymous") && typeof body.anonymous !== "boolean") {
    errors.anonymous = "Anonymous must be true or false.";
  }
  return errors;
};

export const createFeedback = async (req, res, next) => {
  const body = req.body ?? {};
  const errors = validateContent(body, { creating: true });
  if (Object.keys(errors).length) return res.status(400).json({ message: "Please check your feedback.", errors });

  try {
    const anonymous = body.anonymous === true;
    const feedback = await Feedback.create({
      name: anonymous ? "Anonymous" : body.name.trim(),
      comment: body.comment.trim(),
      rating: Number(body.rating),
      category: body.category,
      anonymous,
      userId: req.user._id,
    });
    return res.status(201).json(visibleFeedback(feedback, req.user));
  } catch (error) {
    return next(error);
  }
};

export const getFeedback = async (req, res, next) => {
  try {
    const filters = {};
    if (!canManageAll(req.user)) filters.userId = req.user._id;

    if (req.query.category) {
      if (!categories.includes(req.query.category)) return res.status(400).json({ message: "Choose a valid category." });
      filters.category = req.query.category;
    }
    if (req.query.rating) {
      const rating = Number(req.query.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be between 1 and 5." });
      filters.rating = rating;
    }
    if (req.query.status) {
      if (!statuses.includes(req.query.status)) return res.status(400).json({ message: "Choose a valid status." });
      if (!canManageAll(req.user)) return res.status(403).json({ message: "Only feedback managers can filter by status." });
      filters.status = req.query.status;
    }
    if (req.query.from || req.query.to) {
      filters.createdAt = {};
      if (req.query.from) {
        const from = new Date(req.query.from);
        if (Number.isNaN(from.getTime())) return res.status(400).json({ message: "Start date is invalid." });
        filters.createdAt.$gte = from;
      }
      if (req.query.to) {
        const to = new Date(req.query.to);
        if (Number.isNaN(to.getTime())) return res.status(400).json({ message: "End date is invalid." });
        to.setHours(23, 59, 59, 999);
        filters.createdAt.$lte = to;
      }
    }
    if (req.query.search) {
      const search = String(req.query.search).trim().slice(0, 100);
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filters.$or = [
        { comment: { $regex: escaped, $options: "i" } },
        ...(canManageAll(req.user) ? [{ name: { $regex: escaped, $options: "i" } }] : []),
      ];
    }

    const feedback = await Feedback.find(filters).sort({ createdAt: -1 }).limit(500).lean();
    return res.json(feedback.map((item) => visibleFeedback(item, req.user)));
  } catch (error) {
    return next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const filters = canManageAll(req.user) ? {} : { userId: req.user._id };
    const [summary, recent] = await Promise.all([
      Feedback.aggregate([
        { $match: filters },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            averageRating: { $avg: "$rating" },
            positive: { $sum: { $cond: [{ $gte: ["$rating", 4] }, 1, 0] } },
            negative: { $sum: { $cond: [{ $lte: ["$rating", 2] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $in: [{ $ifNull: ["$status", "New"] }, ["New", "Under Review", "In Progress"]] }, 1, 0] } },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
          },
        },
      ]),
      Feedback.find(filters).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const stats = summary[0] ?? { total: 0, averageRating: 0, positive: 0, negative: 0, pending: 0, resolved: 0 };
    return res.json({
      ...stats,
      averageRating: Number((stats.averageRating || 0).toFixed(1)),
      recent: recent.map((item) => visibleFeedback(item, req.user)),
    });
  } catch (error) {
    return next(error);
  }
};

export const updateFeedback = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Feedback id is invalid." });

  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found." });
    if (!canEdit(feedback, req.user)) return res.status(403).json({ message: "You can only edit your own feedback." });

    const privileged = canManageAll(req.user);
    const body = req.body ?? {};
    if (Object.hasOwn(body, "status") && !privileged) {
      return res.status(403).json({ message: "Only feedback managers can change feedback status." });
    }
    const errors = validateContent(body, { privileged });
    if (Object.keys(errors).length) return res.status(400).json({ message: "Please check the updated feedback.", errors });

    for (const field of ["comment", "rating", "category"]) {
      if (Object.hasOwn(body, field)) {
        feedback[field] = field === "comment" ? body[field].trim() : field === "rating" ? Number(body[field]) : body[field];
      }
    }
    if (Object.hasOwn(body, "anonymous")) {
      feedback.anonymous = body.anonymous;
      feedback.name = body.anonymous ? "Anonymous" : (body.name?.trim() || req.user.name);
    } else if (Object.hasOwn(body, "name") && !feedback.anonymous) {
      feedback.name = body.name.trim();
    }
    if (privileged && Object.hasOwn(body, "status")) feedback.status = body.status;

    await feedback.save();
    return res.json(visibleFeedback(feedback, req.user));
  } catch (error) {
    return next(error);
  }
};

export const deleteFeedback = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Feedback id is invalid." });

  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found." });
    if (!canEdit(feedback, req.user)) return res.status(403).json({ message: "You can only delete your own feedback." });
    await feedback.deleteOne();
    return res.json({ message: "Feedback deleted successfully." });
  } catch (error) {
    return next(error);
  }
};
