import { z } from "zod";

export const jobcandidatesSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  company: z.string(),
  title: z.string(),
  addresses: z.array(
    z.object({
      type: z.string(),
      full: z.string(),
      street: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      zip: z.string(),
    })
  ),
  phones: z.array(
    z.object({
      value: z.string(),
      type: z.string(),
    })
  ),
  primaryEmail: z.string(),
  primaryPhone: z.string(),
  emails: z.array(
    z.object({
      value: z.string(),
      type: z.string(),
    })
  ),
  urls: z.array(
    z.object({
      value: z.string(),
      type: z.string(),
    })
  ),
  applicationIds: z.array(z.string()),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const tasksSchema = z.object({
  id: z.string(),
  subject: z.string(),
  content: z.string(),
  status: z.string(),
  type: z.string(),
  priority: z.string(),
  ownerId: z.string(),
  assigneeId: z.string(),
  followerIds: z.array(z.string()),
  parentTaskId: z.string(),
  projectId: z.string(),
  tags: z.array(z.string()),
  contactId: z.string(),
  leadId: z.string(),
  companyId: z.string(),
  dealId: z.string(),
  dueTime: z.string().datetime(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const productsSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  code: z.string(),
  type: z.string(),
  weight: z.number(),
  isActive: z.boolean(),
  price: z.number(),
  status: z.string(),
  options: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      values: z.array(z.string()),
    })
  ),
  variants: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      sku: z.string(),
      weight: z.number(),
    })
  ),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const leadsSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  primaryEmail: z.string(),
  emails: z.array(
    z.object({
      value: z.string(),
      type: z.string(),
    })
  ),
  primaryPhone: z.string(),
  phones: z.array(
    z.object({
      value: z.string(),
      type: z.string(),
    })
  ),
  primaryAddress: z.object({
    type: z.string(),
    full: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    zip: z.string(),
  }),
  addresses: z.array(
    z.object({
      type: z.string(),
      full: z.string(),
      street: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      zip: z.string(),
    })
  ),
  stage: z.string(),
  value: z.number(),
  companyName: z.string(),
  companyId: z.string(),
  ownerId: z.string(),
  jobTitle: z.string(),
  source: z.string(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
  lastActivityTime: z.string().datetime(),
});

export const dealsSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  companyId: z.string(),
  contactId: z.string(),
  campaignId: z.string(),
  source: z.string(),
  description: z.string(),
  stage: z.string(),
  stageId: z.string(),
  status: z.string(),
  type: z.string(),
  ownerId: z.string(),
  probability: z.number(),
  closeTime: z.string().datetime(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
  lastActivityTime: z.string().datetime(),
});

export const invoicesSchema = z.object({
  id: z.string(),
  number: z.string(),
  name: z.string(),
  memo: z.string(),
  status: z.string(),
  paymentMethod: z.string(),
  customerId: z.string(),
  currency: z.string(),
  payments: z.array(z.string()),
  lineItems: z.array(
    z.object({
      id: z.string(),
      itemName: z.string(),
      description: z.string(),
      code: z.string(),
      type: z.string(),
      status: z.string(),
      companyId: z.string(),
      ledgerAccountId: z.string(),
      quantity: z.number(),
      unitOfMeasure: z.string(),
      unitPrice: z.number(),
      purchasePrice: z.number(),
      salesPrice: z.number(),
      taxable: z.boolean(),
      taxAmount: z.number(),
      totalAmount: z.number(),
      inventoryDate: z.string().datetime(),
    })
  ),
  totalAmount: z.number(),
  totalTax: z.number(),
  exchangeRate: z.number(),
  totalDiscount: z.number(),
  subTotal: z.number(),
  balance: z.number(),
  ledgerAccountId: z.string(),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  paidOnDate: z.string().datetime(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const activitiesSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.string(),
  durationSeconds: z.number(),
  location: z.string(),
  isRecurrent: z.boolean(),
  participants: z.array(
    z.object({
      userId: z.string(),
      contactId: z.string(),
    })
  ),
  status: z.string(),
  contactId: z.string(),
  companyId: z.string(),
  dealId: z.string(),
  leadId: z.string(),
  ownerId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  dueTime: z.string().datetime(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const notesSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  status: z.string(),
  ownerId: z.string(),
  contactId: z.string(),
  leadId: z.string(),
  companyId: z.string(),
  dealId: z.string(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const ordersSchema = z.object({
  id: z.string(),
  name: z.string(),
  notes: z.string(),
  status: z.string(),
  customerId: z.string(),
  currency: z.string(),
  totalAmount: z.number(),
  paymentMethod: z.string(),
  paymentStatus: z.string(),
  fullFillmentStatus: z.string(),
  billingAddress: z.object({
    type: z.string(),
    full: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    zip: z.string(),
  }),
  shippingAddress: z.object({
    type: z.string(),
    full: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    zip: z.string(),
  }),
  lineItems: z.array(
    z.object({
      name: z.string(),
      productId: z.string(),
      sku: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      totalAmount: z.number(),
    })
  ),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const jobapplicationsSchema = z.object({
  id: z.string(),
  candidateId: z.string(),
  jobId: z.string(),
  appliedAt: z.string().datetime(),
  status: z.string(),
  currentStage: z.string(),
  source: z.string(),
  rejectedTime: z.string().datetime(),
  rejectionReason: z.string(),
  creditedTo: z.string(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const contactsSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  primaryEmail: z.string(),
  emails: z.array(
    z.object({
      value: z.string(),
      type: z.string(),
    })
  ),
  primaryPhone: z.string(),
  phones: z.array(
    z.object({
      value: z.string(),
      type: z.string(),
    })
  ),
  primaryAddress: z.object({
    type: z.string(),
    full: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    zip: z.string(),
  }),
  addresses: z.array(
    z.object({
      type: z.string(),
      full: z.string(),
      street: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      zip: z.string(),
    })
  ),
  stage: z.string(),
  companyName: z.string(),
  companyId: z.string(),
  ownerId: z.string(),
  jobTitle: z.string(),
  source: z.string(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
  lastActivityTime: z.string().datetime(),
});

export const usersSchema = z.object({
  id: z.string(),
  title: z.string(),
  fullName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  userName: z.string(),
  primaryEmail: z.string(),
  emails: z.array(
    z.object({
      value: z.string(),
      type: z.string(),
    })
  ),
  primaryPhone: z.string(),
  phones: z.array(
    z.object({
      value: z.string(),
      type: z.string(),
    })
  ),
  primaryAddress: z.object({
    type: z.string(),
    full: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    zip: z.string(),
  }),
  addresses: z.array(
    z.object({
      type: z.string(),
      full: z.string(),
      street: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      zip: z.string(),
    })
  ),
  companyName: z.string(),
  companyId: z.string(),
  imageUrl: z.string(),
  timezone: z.string(),
  isActive: z.boolean(),
  roleId: z.string(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const jobsSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  code: z.string(),
  status: z.string(),
  isConfidential: z.boolean(),
  hiringManagersIds: z.array(z.string()),
  recruitersIds: z.array(z.string()),
  departmentsIds: z.array(z.string()),
  officesIds: z.array(z.string()),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const companiesSchema = z.object({
  id: z.string(),
  name: z.string(),
  websiteUrl: z.string(),
  phones: z.array(
    z.object({
      value: z.string(),
      type: z.string(),
    })
  ),
  primaryPhone: z.string(),
  description: z.string(),
  currency: z.string(),
  industry: z.string(),
  ownerId: z.string(),
  primaryAddress: z.object({
    type: z.string(),
    full: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    zip: z.string(),
  }),
  addresses: z.array(
    z.object({
      type: z.string(),
      full: z.string(),
      street: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      zip: z.string(),
    })
  ),
  numberOfEmployees: z.number(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
  lastActivityTime: z.string().datetime(),
});

export const emailSchema = z.object({
  id: z.string(),
  subject: z.string(),
});

export const fileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  isFolder: z.boolean(),
});

export type AppObjectKey =
  | "job-candidates"
  | "tasks"
  | "products"
  | "leads"
  | "deals"
  | "invoices"
  | "activities"
  | "notes"
  | "orders"
  | "job-applications"
  | "contacts"
  | "users"
  | "jobs"
  | "companies"
  | "files"
  | "emails";
