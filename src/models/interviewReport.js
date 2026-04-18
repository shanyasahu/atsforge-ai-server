const mongoose = require("mongoose");

/**
 * job description schema: String
 * resume text: String
 * self description: String
 *
 * --matchScore:Number
 *
 * --Technical questions:
 * [{
 * question:"",
 * intention:"",
 * answer:"",
 * }]
 *
 * --Behavioral questions:[{
 * question:"",
 * intention:"",
 * answer:"",
 *}]
 *
 * -Skill gaps:[{
 * skills:"",
 * severity:{
 * type:String,
 * enum=["low,"medium","high"]
 * }
 *
 * --preparation plan:[{
 *day:Number,
 focus:String,
 tasks:[String]
 * }]
 * }]
 */

const technicalQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Technical question is required"],
    },
    intention: {
      type: String,
      required: [true, "Intention in required"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
  },
  {
    _id: false,
  },
);

const behavioralQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Behavioral question is required"],
    },
    intention: {
      type: String,
      required: [true, "Intention in required"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
  },
  {
    _id: false,
  },
);

const skillGapsSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: [true, "Skill is required"],
    },
    saverity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: [true, "Severity in required"],
    },
  },
  {
    _id: false,
  },
);

const preprationPlanSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: [true, "Day is required"],
    },
    focus: {
      type: String,
      required: [true, "Focus in required"],
    },
    tasks: [
      {
        type: String,
        required: [true, "Task is required"],
      },
    ],
  },
  {
    _id: false,
  },
);

const interviewReportSchema = new mongoose.Schema(
  {
    jobDescription: {
      type: String,
      required: [true, "Job Description is required"],
    },
    resume: {
      type: String,
    },
    selfDescription: {
      type: String,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapsSchema],
    preprationPlans: [preprationPlanSchema],
  },
  {
    timestamps: true,
  },
);

const interviewReportModel = mongoose.model(
  "InterviewReport",
  interviewReportSchema,
);

module.exports = interviewReportModel;
