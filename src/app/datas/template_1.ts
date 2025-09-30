export const sample_template = {
  "id": "1",
  "name": "Contact Information Form",
  "pages": [
    {
      "id": "page-1-uuid",
      "name": "Page 1",
      "items": [
        {
          "id": 1732894,
          "type": "text",
          "label": "Full Name",
          "required": true,
          "placeholder": "Enter your full name..."
        },
        {
          "id": 1732912,
          "type": "horizontal_layout",
          "isLayout": true,
          "columns": [
            {
              "id": "col-1-uuid",
              "fields": [
                {
                  "id": 1732900,
                  "type": "email",
                  "label": "Email Address",
                  "required": true,
                  "placeholder": "you@example.com"
                }
              ]
            },
            {
              "id": "col-2-uuid",
              "fields": [
                {
                  "id": 1732905,
                  "type": "number",
                  "label": "Phone Number",
                  "required": false,
                  "placeholder": "Enter phone number..."
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};