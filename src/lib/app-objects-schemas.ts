import { z } from "zod";


export const dealstagesSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.string(),
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

export const campaignmembersSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  primaryEmail: z.string(),
  campaignId: z.string(),
  contactId: z.string(),
  leadId: z.string(),
  source: z.string(),
  status: z.string(),
  companyId: z.string(),
  jobTitle: z.string(),
  hasOptedOutOfEmail: z.boolean(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const customersSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  companyName: z.string(),
  companyId: z.string(),
  status: z.unknown(),
  currency: z.string(),
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
  emails: z.array(
    z.object({
      value: z.string(),
      type: z.string(),
    })
  ),
  websiteUrl: z.string(),
  notes: z.string(),
  tax_number: z.string(),
  orderIds: z.array(z.string()),
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

export const filesSchema = z.object({
  id: z.string(),
  mimeType: z.string(),
  name: z.string(),
  description: z.string(),
  previewUri: z.string(),
  size: z.unknown(),
  path: z.string(),
  folderId: z.string(),
  ownerId: z.string(),
  driveId: z.string(),
  downloadUri: z.string(),
  uri: z.string(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const dealproductsSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  price: z.number(),
  dealId: z.string(),
  productId: z.string(),
  isActive: z.boolean(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
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

export const billsSchema = z.object({
  id: z.string(),
  number: z.string(),
  name: z.string(),
  memo: z.string(),
  status: z.string(),
  paymentMethod: z.string(),
  supplierId: z.string(),
  currency: z.string(),
  payments: z.array(z.string()),
  lineItems: z.array(
    z.object({
      id: z.string(),
      itemName: z.string(),
      description: z.string(),
      code: z.string(),
      type: z.string(),
      companyId: z.string(),
      ledgerAccountId: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      unitOfMeasure: z.string(),
      purchasePrice: z.number(),
      salesPrice: z.number(),
      taxable: z.boolean(),
      taxAmount: z.number(),
      totalAmount: z.number(),
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

export const driveitemsSchema = z.object({
  id: z.string(),
  itemType: z.string(),
  name: z.string(),
  mimeType: z.string(),
  description: z.string(),
  previewUri: z.string(),
  size: z.unknown(),
  path: z.string(),
  folderId: z.string(),
  ownerId: z.string(),
  driveId: z.string(),
  downloadUri: z.string(),
  uri: z.string(),
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

export const drivesSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  ownerId: z.string(),
  uri: z.string(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
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

export const projectsSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.string(),
  parentId: z.string(),
  ownerId: z.string(),
  startTime: z.string().datetime(),
  dueTime: z.string().datetime(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const contactlistsSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  source: z.string(),
  type: z.string(),
  ownerId: z.string(),
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

export const campaignsSchema = z.object({
  id: z.string(),
  name: z.string(),
  cost: z.number(),
  description: z.string(),
  source: z.string(),
  stage: z.string(),
  type: z.string(),
  ownerId: z.string(),
  sentCount: z.number(),
  replyCount: z.number(),
  openCount: z.number(),
  clickCount: z.number(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
  lastActivityTime: z.string().datetime(),
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

export const eeocsSchema = z.object({
  id: z.string(),
  candidateId: z.string(),
  race: z.string(),
  gender: z.string(),
  veteranStatus: z.string(),
  disabilityStatus: z.string(),
  submittedTime: z.string().datetime(),
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

export const suppliersSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  companyName: z.string(),
  companyId: z.string(),
  status: z.string(),
  currency: z.string(),
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
  emails: z.array(
    z.object({
      value: z.string(),
      type: z.string(),
    })
  ),
  websiteUrl: z.string(),
  notes: z.string(),
  taxNumber: z.string(),
  orderIds: z.array(z.string()),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const payrollsSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  companyId: z.string(),
  runState: z.string(),
  runType: z.string(),
  isProcessed: z.boolean(),
  processedTime: z.string().datetime(),
  checkTime: z.string().datetime(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const meetingsSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  durationSeconds: z.number(),
  location: z.string(),
  isRecurrent: z.boolean(),
  participants: z.array(
    z.object({
      userId: z.string(),
      contactId: z.string(),
      leadId: z.string(),
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
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const employeesSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  userName: z.string(),
  preferredName: z.string(),
  personalEmail: z.string(),
  workEmail: z.string(),
  mobileNumber: z.string(),
  homeAddress: z.object({
    type: z.string(),
    full: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    zip: z.string(),
  }),
  workAddress: z.object({
    type: z.string(),
    full: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    zip: z.string(),
  }),
  employmentStatus: z.string(),
  companyId: z.string(),
  departmentId: z.string(),
  startDate: z.string().datetime(),
  terminationDate: z.string().datetime(),
  gender: z.string(),
  ethnicity: z.string(),
  birthday: z.string().datetime(),
  photoUrl: z.string(),
  timezone: z.string(),
  title: z.string(),
  employments: z.array(z.unknown()),
  compensations: z.array(
    z.object({
      id: z.string(),
      jobId: z.string(),
      rate: z.number(),
      paymentUnit: z.string(),
      currency: z.string(),
      paymentFrequency: z.string(),
      flsaStatus: z.string(),
      effectiveDate: z.string().datetime(),
    })
  ),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const creditnotesSchema = z.object({
  id: z.string(),
  number: z.string(),
  memo: z.string(),
  status: z.string(),
  customerId: z.string(),
  currency: z.string(),
  exchangeRate: z.number(),
  payments: z.array(z.string()),
  lineItems: z.array(
    z.object({
      id: z.string(),
      itemName: z.string(),
      description: z.string(),
      quantity: z.number(),
      totalLineAmount: z.number(),
      companyId: z.string(),
      ledgerAccountId: z.string(),
      unitPrice: z.number(),
      taxRate: z.string(),
    })
  ),
  allocations: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      amount: z.number(),
    })
  ),
  totalAmount: z.number(),
  totalTax: z.number(),
  totalDiscount: z.number(),
  subTotal: z.number(),
  balance: z.number(),
  ledgerAccountId: z.string(),
  issueDate: z.string().datetime(),
  paidOnDate: z.string().datetime(),
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

export const journalentriesSchema = z.object({
  id: z.string(),
  number: z.string(),
  title: z.string(),
  memo: z.string(),
  currency: z.string(),
  companyId: z.string(),
  lineItems: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      type: z.string(),
      amount: z.number(),
      ledgerAccountId: z.string(),
      companyId: z.string(),
      contactId: z.string(),
      exchangeRate: z.number(),
    })
  ),
  taxType: z.string(),
  taxCode: z.string(),
  ledgerAccountId: z.string(),
  payments: z.array(z.string()),
  transactionDate: z.string().datetime(),
  createdTime: z.string().datetime(),
  updatedTime: z.string().datetime(),
});

export const jobinterviewsSchema = z.object({
  id: z.string(),
  candidateId: z.string(),
  organizerId: z.string(),
  interviewerIds: z.array(z.string()),
  stage: z.string(),
  status: z.string(),
  location: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
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

export const paymentsSchema = z.object({
  id: z.string(),
  status: z.string(),
  type: z.string(),
  notes: z.string(),
  currency: z.string(),
  exchangeRate: z.string(),
  totalAmount: z.number(),
  supplierId: z.string(),
  customerId: z.string(),
  ledgerAccountId: z.string(),
  paymentMethod: z.string(),
  transactionDate: z.string().datetime(),
  isReconciled: z.boolean(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const foldersSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  size: z.unknown(),
  path: z.string(),
  parentFolderId: z.string(),
  ownerId: z.string(),
  driveId: z.string(),
  downloadUri: z.string(),
  uri: z.string(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

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

export const documentsSchema = z.object({
  id: z.string(),
  uri: z.string(),
  title: z.string(),
  parentDocumentId: z.string(),
  canHaveChildren: z.boolean(),
  isDownloadable: z.boolean(),
  text: z.string(),
  ownerId: z.string(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const emailsSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  to: z.array(z.string()),
  cc: z.array(z.string()),
  bcc: z.array(z.string()),
  from: z.string(),
  replyTo: z.string(),
  subject: z.string(),
  body: z.string(),
  html_body: z.string(),
  status: z.string(),
  ownerId: z.string(),
  contactId: z.string(),
  leadId: z.string(),
  companyId: z.string(),
  dealId: z.string(),
  attachments: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      name: z.string(),
      url: z.string(),
      content: z.string(),
    })
  ),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const joboffersSchema = z.object({
  id: z.string(),
  jobApplicationId: z.string(),
  status: z.string(),
  sentTime: z.string().datetime(),
  closedTime: z.string().datetime(),
  startDate: z.string(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const messagesSchema = z.object({
  id: z.string(),
  subject: z.string(),
  channelId: z.string(),
  threadId: z.string(),
  text: z.string(),
  ownerId: z.string(),
  status: z.string(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export const taxratesSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string(),
  effectiveTaxRate: z.number(),
  totalTaxRate: z.number(),
  type: z.string(),
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

export const ledgeraccountsSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string(),
  classification: z.string(),
  type: z.string(),
  status: z.string(),
  currentBalance: z.number(),
  currency: z.string(),
  taxRateId: z.string(),
  companyId: z.string(),
  createdTime: z.string().datetime(),
  createdBy: z.string(),
  updatedTime: z.string().datetime(),
  updatedBy: z.string(),
});

export type AppObjectKey =
  | "deal-stages"
  | "contacts"
  | "campaign-members"
  | "customers"
  | "activities"
  | "files"
  | "deal-products"
  | "users"
  | "bills"
  | "drive-items"
  | "orders"
  | "job-applications"
  | "drives"
  | "deals"
  | "projects"
  | "contact-lists"
  | "leads"
  | "campaigns"
  | "tasks"
  | "eeocs"
  | "products"
  | "suppliers"
  | "payrolls"
  | "meetings"
  | "employees"
  | "credit-notes"
  | "jobs"
  | "journal-entries"
  | "job-interviews"
  | "notes"
  | "invoices"
  | "payments"
  | "folders"
  | "job-candidates"
  | "documents"
  | "emails"
  | "job-offers"
  | "messages"
  | "tax-rates"
  | "companies"
  | "ledger-accounts";
