import { z } from "zod";

const recordTypesConfig = {
  email: {
    schema: z.object({
      id: z.string(),
      threadId: z.string(),
      to: z.array(z.string()),
      cc: z.array(z.string()),
      bcc: z.array(z.string()),
      from: z.string(),
      replyTo: z.array(z.string()),
      subject: z.string(),
      body: z.string(),
      htmlBody: z.string(),
      attachments: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          name: z.string(),
          content: z.string(),
          url: z.string(),
        })
      ),
    }),

    allowDelete: true,
    allowUpdate: false,
    allowCreate: true,
  },
  user: {},
  file: {},
};

export default recordTypesConfig;

