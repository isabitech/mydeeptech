import z from "zod";

/* ──────────────────────────────
 * Shared field primitives
 * ────────────────────────────── */

const IdField = z.string().min(1, "Domain ID is required");
const NameField = (msg: string) => z.string().min(1, msg);
const OptionalDescription = z.string().optional();

const Timestamps = {
  createdAt: z.string(),
  updatedAt: z.string(),
};

const MongoMeta = {
  __v: z.number().optional(),
  deleted_at: z.string().nullable(),
};

/* ──────────────────────────────
 * Base input schemas
 * ────────────────────────────── */

const CreateDomainCategorySchema = z.object({
  name: NameField("Domain name is required"),
  description: OptionalDescription,
});



const CreateSubDomainCategorySchema = z.object({
  name: NameField("Sub-domain name is required"),
  domain_category: NameField("Domain category is required"),
  description: OptionalDescription,
});

const CreateDomainSchema = z.object({
  name: NameField("Domain name is required"),
  domain_category: NameField("Domain category is required"),
  domain_sub_category: NameField("Domain sub-category is required"),
  description: OptionalDescription,
});

const DomainEntitySchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  domain_category: z.string(),
  domain_sub_category: z.string(),
  ...Timestamps,
  ...MongoMeta
}).strip()

const DomainCategoryRefSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
}).strip();

/* Domain (child) */
const DomainChildSchema = z.object({
    _id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    domain_category: DomainCategoryRefSchema,
    domain_sub_category: z.object({
      _id: z.string(),
      name: z.string(),
      slug: z.string(),
    }).strip(),
    ...MongoMeta,
    ...Timestamps,
  }).strip();

const CreateDomainSchemaResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({ domain: DomainEntitySchema }),
  })

const GetDomainsResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({
      domain: z.array(DomainChildSchema),
    }),
  }).strip();

/* ──────────────────────────────
 * Reference & entity schemas
 * ────────────────────────────── */

/* Full Domain Category */
const DomainCategorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  ...MongoMeta,
  ...Timestamps,
});


/* ──────────────────────────────
 * Response schemas
 * ────────────────────────────── */

const CreateDomainCategoryResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({ category: DomainCategorySchema }),
  }).strip();

const GetDomainCategoriesResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({ categories: z.array(DomainCategorySchema) }),
  }).strip();

/* Domain Sub-Category */
const DomainSubCategorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  domain_category: DomainCategoryRefSchema,
  ...MongoMeta,
  ...Timestamps,
});

const CreateDomainSubCategoryResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({ domainSubCategory: DomainSubCategorySchema }),
  })

const GetDomainSubCategoriesResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({
      domainSubCategories: z.array(DomainSubCategorySchema),
    }),
  }).strip();

/* ──────────────────────────────
 * Update / Delete
 * ────────────────────────────── */

const UpdateDomainSchema = z.object({
  id: IdField,
  name: NameField("Domain name is required"),
  description: OptionalDescription,
});

const DeleteDomainSchema = UpdateDomainSchema.pick({ id: true });

/* ──────────────────────────────
 * Inferred Types
 * ────────────────────────────── */

type CreateDomainCategorySchema = z.infer<typeof CreateDomainCategorySchema>;
type UpdateDomainSchema = z.infer<typeof UpdateDomainSchema>;
type DeleteDomainSchema = z.infer<typeof DeleteDomainSchema>;
type DomainCategorySchema = z.infer<typeof DomainCategorySchema>;
type CreateDomainCategoryResponseSchema = z.infer<typeof CreateDomainCategoryResponseSchema>;
type GetDomainCategoriesResponseSchema = z.infer<typeof GetDomainCategoriesResponseSchema>;
type CreateSubDomainCategorySchema = z.infer<typeof CreateSubDomainCategorySchema>;
type CreateDomainSubCategoryResponseSchema = z.infer<typeof CreateDomainSubCategoryResponseSchema>;
type GetDomainSubCategoriesResponseSchema = z.infer<typeof GetDomainSubCategoriesResponseSchema>;
type CreateDomainSchema = z.infer<typeof CreateDomainSchema>;
type CreateDomainSchemaResponse = z.infer<typeof CreateDomainSchemaResponse>;
type GetDomainsResponseSchema = z.infer<typeof GetDomainsResponseSchema>;

/* ──────────────────────────────
 * Exports
 * ────────────────────────────── */

export {
  CreateDomainCategorySchema,
  UpdateDomainSchema,
  DeleteDomainSchema,
  DomainCategorySchema,
  CreateDomainCategoryResponseSchema,
  GetDomainCategoriesResponseSchema,
  CreateSubDomainCategorySchema,
  CreateDomainSubCategoryResponseSchema,
  GetDomainSubCategoriesResponseSchema,
  CreateDomainSchema,
  CreateDomainSchemaResponse,
  GetDomainsResponseSchema,
};