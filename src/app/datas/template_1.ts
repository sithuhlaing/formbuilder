import { Template } from "@/types/template";

export const sample_template: Template = {
  id: "1",
  name: "Contact Information Form",
  description: "Basic contact form for collecting user information with name, email, and phone.",
  category: "general",
  type: "contact",
  difficulty: "easy",
  fieldCount: 4,
  estimatedTime: "~2m",
  isCustom: false,
  isHipaaCompliant: false,
  tags: ["contact", "basic", "information"],
  version: "1.0.0",
  pages: [
    {
      id: "page-1-uuid",
      name: "Page 1",
      items: [
        {
          id: 1732894,
          type: "text_input",
          label: "Full Name",
          required: true,
          placeholder: "Enter your full name...",
          validation: [
            { type: "required", message: "Full name is required" }
          ]
        },
        {
          id: 1732912,
          type: "horizontal_layout",
          isLayout: true,
          columns: [
            {
              id: "col-1-uuid",
              fields: [
                {
                  id: 1732900,
                  type: "email_input",
                  label: "Email Address",
                  required: true,
                  placeholder: "you@example.com",
                  validation: [
                    { type: "required", message: "Email address is required" },
                    { type: "pattern", pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", message: "Please enter a valid email address" }
                  ]
                },
              ],
            },
            {
              id: "col-2-uuid",
              fields: [
                {
                  id: 1732905,
                  type: "text_input",
                  label: "Phone Number",
                  required: false,
                  placeholder: "Enter phone number...",
                  validation: [
                    { type: "pattern", pattern: "^\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$", message: "Please enter a valid phone number" }
                  ]
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
