import { z } from "zod";

// enums
const CategoryEnum = z.enum([
  "mask_collection",
  "text_annotation",
  "audio_annotation",
  "video_annotation",
  "age_progression",
]);

const LabelEnum = z.enum(["Front", "Right", "Left", "Bottom"]);

const CurrencyEnum = z.enum(["USD", "NGN", "EUR", "GBP"]);

// image requirement schema
const ImageRequirementSchema = z.object({
  _id: z.string(),
  label: LabelEnum,
  requiredCount: z.number().int().min(1),
});

const CreatedBySchema = z.object({
  _id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  id: z.string(),
});

const BaseTaskSchema = z.object({
  _id: z.string(),
  taskTitle: z.string().min(4),
  category: CategoryEnum,

  createdBy: CreatedBySchema,
  description: z.string(),
  payRate: z.number().positive(),
  currency: CurrencyEnum,

  instructions: z.string(),
  quality_guidelines: z.string(),

  dueDate: z.string(),

  totalImagesRequired: z.number().int().min(1),
  maxParticipants: z.number().int(),
  isActive: z.boolean(),

  imageRequirements: z.array(ImageRequirementSchema).length(4),

  createdAt: z.string(),
  updatedAt: z.string(),
});

// main task data schema
const TaskSchema = z.object({
  _id: z.string(),
  taskTitle: z.string().min(4),
  category: CategoryEnum,
  createdBy: CreatedBySchema,
  payRate: z.number().positive(),
  currency: CurrencyEnum,

  instructions: z.string().min(1), // optional in backend but present in response
  quality_guidelines: z.string().min(1),

  dueDate: z.string(),

  totalImagesRequired: z.number().int().min(1),
  isActive: z.boolean(),

  imageRequirements: z.array(ImageRequirementSchema).length(4),

  createdAt: z.string(),
  updatedAt: z.string(),
});

const PaginationSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

const TaskWithUserSchema = BaseTaskSchema.extend({
     createdBy: CreatedBySchema,
});

const TaskWithCreatedIdBySchema = BaseTaskSchema.extend({
  createdBy: z.string(),
});

// full API response schema
const CreateTaskResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: TaskWithCreatedIdBySchema,
});


const GetTasksResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(TaskWithUserSchema),
  pagination: PaginationSchema,
});

const TaskWithCreatedIdBySchemaPartials = TaskWithCreatedIdBySchema.partial({
  createdBy: true,
});

type TaskSchema = z.infer<typeof TaskSchema>;
type BaseTaskSchema = z.infer<typeof BaseTaskSchema>;
type CreateTaskResponseSchema = z.infer<typeof CreateTaskResponseSchema>;
type GetTasksResponseSchema = z.infer<typeof GetTasksResponseSchema>;
type TaskWithCreatedIdBySchemaPartials = z.infer<typeof TaskWithCreatedIdBySchemaPartials>;



export { CreateTaskResponseSchema, TaskSchema, GetTasksResponseSchema, TaskWithCreatedIdBySchemaPartials, BaseTaskSchema };