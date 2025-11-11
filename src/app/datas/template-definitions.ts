import { Template, TemplateCategory, TemplateType, TemplateDifficulty } from '@/types/template';

// Patient Intake Form Template
export const patientIntakeTemplate: Template = {
  id: 'patient-intake-adult',
  name: 'Patient Intake (Adult)',
  description: 'Comprehensive patient registration form for adult patients including personal information, medical history, and insurance details.',
  category: 'medical',
  type: 'patient-intake',
  difficulty: 'medium',
  fieldCount: 24,
  estimatedTime: '~6m',
  isCustom: false,
  isHipaaCompliant: true,
  tags: ['patient', 'registration', 'medical', 'adult'],
  version: '1.0.0',
  pages: [
    {
      id: 'page-1',
      name: 'Patient Information',
      items: [
        {
          id: 'heading-1',
          type: 'heading',
          label: 'Personal Information',
        },
        {
          id: 'first-name',
          type: 'text_input',
          label: 'First Name',
          required: true,
          placeholder: 'Enter first name',
          validation: [
            { type: 'required', message: 'First name is required' },
            { type: 'minLength', value: 2, message: 'First name must be at least 2 characters' }
          ]
        },
        {
          id: 'last-name',
          type: 'text_input',
          label: 'Last Name',
          required: true,
          placeholder: 'Enter last name',
          validation: [
            { type: 'required', message: 'Last name is required' },
            { type: 'minLength', value: 2, message: 'Last name must be at least 2 characters' }
          ]
        },
        {
          id: 'dob',
          type: 'date_picker',
          label: 'Date of Birth',
          required: true,
          validation: [
            { type: 'required', message: 'Date of birth is required' }
          ]
        },
        {
          id: 'gender',
          type: 'select',
          label: 'Sex',
          required: true,
          options: ['Male', 'Female', 'Other'],
          validation: [
            { type: 'required', message: 'Sex is required' }
          ]
        },
        {
          id: 'layout-1',
          type: 'horizontal_layout',
          isLayout: true,
          columns: [
            {
              id: 'col-1',
              fields: [
                {
                  id: 'phone',
                  type: 'text_input',
                  label: 'Phone Number',
                  required: true,
                  placeholder: '(555) 123-4567',
                  validation: [
                    { type: 'required', message: 'Phone number is required' },
                    { type: 'pattern', pattern: '^\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$', message: 'Please enter a valid phone number' }
                  ]
                }
              ]
            },
            {
              id: 'col-2',
              fields: [
                {
                  id: 'email',
                  type: 'email_input',
                  label: 'Email Address',
                  required: true,
                  placeholder: 'patient@example.com',
                  validation: [
                    { type: 'required', message: 'Email is required' },
                    { type: 'pattern', pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$', message: 'Please enter a valid email address' }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'address',
          type: 'textarea',
          label: 'Address',
          required: true,
          placeholder: 'Enter full address',
          validation: [
            { type: 'required', message: 'Address is required' }
          ]
        }
      ]
    }
  ]
};

// Medical History Form Template
export const medicalHistoryTemplate: Template = {
  id: 'medical-history',
  name: 'Medical History',
  description: 'Form for collecting patient medical history including conditions, medications, allergies, and family history.',
  category: 'medical',
  type: 'medical-history',
  difficulty: 'medium',
  fieldCount: 18,
  estimatedTime: '~5m',
  isCustom: false,
  isHipaaCompliant: true,
  tags: ['medical', 'history', 'conditions', 'medications'],
  version: '1.0.0',
  pages: [
    {
      id: 'page-1',
      name: 'Medical History',
      items: [
        {
          id: 'heading-1',
          type: 'heading',
          label: 'Current Medical Conditions',
        },
        {
          id: 'conditions',
          type: 'textarea',
          label: 'Current Medical Conditions',
          required: false,
          placeholder: 'List any current medical conditions',
        },
        {
          id: 'medications',
          type: 'textarea',
          label: 'Current Medications',
          required: false,
          placeholder: 'List all current medications including dosage',
        },
        {
          id: 'allergies',
          type: 'textarea',
          label: 'Allergies',
          required: true,
          placeholder: 'List any known allergies (medications, food, etc.)',
          validation: [
            { type: 'required', message: 'Please list any allergies or write "None"' }
          ]
        },
        {
          id: 'heading-2',
          type: 'heading',
          label: 'Family Medical History',
        },
        {
          id: 'family-conditions',
          type: 'checkbox',
          label: 'Family History of:',
          options: [
            'Heart Disease',
            'Diabetes',
            'High Blood Pressure',
            'Cancer',
            'Stroke',
            'None'
          ]
        }
      ]
    }
  ]
};

// Consent Form Template
export const consentFormTemplate: Template = {
  id: 'consent-form',
  name: 'Consent Form',
  description: 'General medical consent form for procedures and data sharing with HIPAA compliance.',
  category: 'medical',
  type: 'consent-form',
  difficulty: 'easy',
  fieldCount: 12,
  estimatedTime: '~3m',
  isCustom: false,
  isHipaaCompliant: true,
  tags: ['consent', 'hipaa', 'medical', 'legal'],
  version: '1.0.0',
  pages: [
    {
      id: 'page-1',
      name: 'Consent Form',
      items: [
        {
          id: 'heading-1',
          type: 'heading',
          label: 'Medical Treatment Consent',
        },
        {
          id: 'consent-text',
          type: 'rich_text',
          label: 'I hereby consent to medical treatment and procedures as recommended by my healthcare provider. I understand that I have the right to refuse treatment and that I may withdraw consent at any time.',
        },
        {
          id: 'treatment-consent',
          type: 'checkbox',
          label: 'Consent Statements',
          required: true,
          options: [
            'I consent to medical treatment',
            'I understand the risks and benefits',
            'I have had my questions answered',
            'I consent to the use and disclosure of my health information for treatment purposes'
          ],
          validation: [
            { type: 'required', message: 'All consent checkboxes must be checked' }
          ]
        },
        {
          id: 'emergency-contact',
          type: 'text_input',
          label: 'Emergency Contact Name',
          required: true,
          placeholder: 'Enter emergency contact name',
          validation: [
            { type: 'required', message: 'Emergency contact is required' }
          ]
        },
        {
          id: 'emergency-phone',
          type: 'text_input',
          label: 'Emergency Contact Phone',
          required: true,
          placeholder: '(555) 123-4567',
          validation: [
            { type: 'required', message: 'Emergency contact phone is required' },
            { type: 'pattern', pattern: '^\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$', message: 'Please enter a valid phone number' }
          ]
        }
      ]
    }
  ]
};

// General Contact Form Template
export const contactFormTemplate: Template = {
  id: 'contact-form',
  name: 'Contact Form',
  description: 'Standard contact form for general inquiries and feedback.',
  category: 'general',
  type: 'contact',
  difficulty: 'easy',
  fieldCount: 8,
  estimatedTime: '~2m',
  isCustom: false,
  isHipaaCompliant: false,
  tags: ['contact', 'general', 'inquiry'],
  version: '1.0.0',
  pages: [
    {
      id: 'page-1',
      name: 'Contact Information',
      items: [
        {
          id: 'name',
          type: 'text_input',
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your full name',
          validation: [
            { type: 'required', message: 'Name is required' }
          ]
        },
        {
          id: 'email',
          type: 'email_input',
          label: 'Email Address',
          required: true,
          placeholder: 'your@email.com',
          validation: [
            { type: 'required', message: 'Email is required' }
          ]
        },
        {
          id: 'subject',
          type: 'select',
          label: 'Subject',
          required: true,
          options: ['General Inquiry', 'Support', 'Feedback', 'Other'],
          validation: [
            { type: 'required', message: 'Subject is required' }
          ]
        },
        {
          id: 'message',
          type: 'textarea',
          label: 'Message',
          required: true,
          placeholder: 'Enter your message',
          validation: [
            { type: 'required', message: 'Message is required' }
          ]
        }
      ]
    }
  ]
};

// Appointment Scheduling Form Template
export const appointmentSchedulingTemplate: Template = {
  id: 'appointment-scheduling',
  name: 'Appointment Scheduling',
  description: 'Form for scheduling medical appointments with date/time selection and reason for visit.',
  category: 'medical',
  type: 'appointment-scheduling',
  difficulty: 'easy',
  fieldCount: 10,
  estimatedTime: '~3m',
  isCustom: false,
  isHipaaCompliant: true,
  tags: ['appointment', 'scheduling', 'medical'],
  version: '1.0.0',
  pages: [
    {
      id: 'page-1',
      name: 'Appointment Details',
      items: [
        {
          id: 'heading-1',
          type: 'heading',
          label: 'Schedule Appointment',
        },
        {
          id: 'patient-name',
          type: 'text_input',
          label: 'Patient Name',
          required: true,
          placeholder: 'Enter patient name',
          validation: [
            { type: 'required', message: 'Patient name is required' }
          ]
        },
        {
          id: 'appointment-date',
          type: 'date_picker',
          label: 'Preferred Date',
          required: true,
          validation: [
            { type: 'required', message: 'Preferred date is required' }
          ]
        },
        {
          id: 'appointment-time',
          type: 'select',
          label: 'Preferred Time',
          required: true,
          options: ['Morning (8AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-8PM)'],
          validation: [
            { type: 'required', message: 'Preferred time is required' }
          ]
        },
        {
          id: 'reason',
          type: 'select',
          label: 'Reason for Visit',
          required: true,
          options: ['Routine Check-up', 'Follow-up', 'New Issue', 'Urgent', 'Other'],
          validation: [
            { type: 'required', message: 'Reason for visit is required' }
          ]
        },
        {
          id: 'symptoms',
          type: 'textarea',
          label: 'Symptoms/Description',
          required: false,
          placeholder: 'Describe symptoms or reason for visit',
        }
      ]
    }
  ]
};

// Insurance Information Form Template
export const insuranceInfoTemplate: Template = {
  id: 'insurance-information',
  name: 'Insurance Information',
  description: 'Form for collecting patient insurance details and coverage information.',
  category: 'medical',
  type: 'insurance-information',
  difficulty: 'medium',
  fieldCount: 14,
  estimatedTime: '~4m',
  isCustom: false,
  isHipaaCompliant: true,
  tags: ['insurance', 'coverage', 'medical', 'billing'],
  version: '1.0.0',
  pages: [
    {
      id: 'page-1',
      name: 'Insurance Information',
      items: [
        {
          id: 'heading-1',
          type: 'heading',
          label: 'Primary Insurance',
        },
        {
          id: 'insurance-company',
          type: 'text_input',
          label: 'Insurance Company',
          required: true,
          placeholder: 'Enter insurance company name',
          validation: [
            { type: 'required', message: 'Insurance company is required' }
          ]
        },
        {
          id: 'policy-number',
          type: 'text_input',
          label: 'Policy Number',
          required: true,
          placeholder: 'ABC123456',
          validation: [
            { type: 'required', message: 'Policy number is required' },
            { type: 'pattern', pattern: '^[A-Z]{3}-\\d{6}$', message: 'Policy number format: ABC123456' }
          ]
        },
        {
          id: 'member-id',
          type: 'text_input',
          label: 'Member ID',
          required: true,
          placeholder: 'Enter member ID',
          validation: [
            { type: 'required', message: 'Member ID is required' }
          ]
        },
        {
          id: 'group-number',
          type: 'text_input',
          label: 'Group Number',
          required: false,
          placeholder: 'Enter group number (if applicable)',
        },
        {
          id: 'layout-1',
          type: 'horizontal_layout',
          isLayout: true,
          columns: [
            {
              id: 'col-1',
              fields: [
                {
                  id: 'effective-date',
                  type: 'date_picker',
                  label: 'Effective Date',
                  required: true,
                  validation: [
                    { type: 'required', message: 'Effective date is required' }
                  ]
                }
              ]
            },
            {
              id: 'col-2',
              fields: [
                {
                  id: 'phone',
                  type: 'text_input',
                  label: 'Insurance Phone',
                  required: false,
                  placeholder: '(555) 123-4567',
                  validation: [
                    { type: 'pattern', pattern: '^\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$', message: 'Please enter a valid phone number' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Patient Feedback Survey Template
export const patientFeedbackSurveyTemplate: Template = {
  id: 'patient-feedback-survey',
  name: 'Patient Feedback Survey',
  description: 'Comprehensive feedback form for patient experience and satisfaction surveys.',
  category: 'medical',
  type: 'questionnaire',
  difficulty: 'easy',
  fieldCount: 8,
  estimatedTime: '~3m',
  isCustom: false,
  isHipaaCompliant: true,
  tags: ['feedback', 'satisfaction', 'survey', 'patient'],
  version: '1.0.0',
  pages: [
    {
      id: 'page-1',
      name: 'Patient Feedback',
      items: [
        {
          id: 'heading-1',
          type: 'heading',
          label: 'Patient Experience Feedback',
        },
        {
          id: 'overall-satisfaction',
          type: 'select',
          label: 'Overall Satisfaction',
          required: true,
          options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
          validation: [
            { type: 'required', message: 'Please select your satisfaction level' }
          ]
        },
        {
          id: 'care-quality',
          type: 'radio_group',
          label: 'Quality of Care Received',
          required: true,
          options: ['Excellent', 'Good', 'Fair', 'Poor'],
          validation: [
            { type: 'required', message: 'Please rate the quality of care' }
          ]
        },
        {
          id: 'staff-courtesy',
          type: 'radio_group',
          label: 'Staff Courtesy and Professionalism',
          required: true,
          options: ['Excellent', 'Good', 'Fair', 'Poor'],
          validation: [
            { type: 'required', message: 'Please rate staff courtesy' }
          ]
        },
        {
          id: 'wait-time',
          type: 'select',
          label: 'Wait Time Satisfaction',
          required: true,
          options: ['Excellent', 'Good', 'Acceptable', 'Too Long'],
          validation: [
            { type: 'required', message: 'Please rate wait time' }
          ]
        },
        {
          id: 'comments',
          type: 'textarea',
          label: 'Additional Comments',
          required: false,
          placeholder: 'Please share any additional feedback or suggestions...',
        },
        {
          id: 'recommend',
          type: 'radio_group',
          label: 'Would you recommend our services?',
          required: true,
          options: ['Definitely', 'Probably', 'Not Sure', 'Probably Not', 'Definitely Not'],
          validation: [
            { type: 'required', message: 'Please answer this question' }
          ]
        }
      ]
    }
  ]
};

// Medical History Update Template
export const medicalHistoryUpdateTemplate: Template = {
  id: 'medical-history-update',
  name: 'Medical History Update',
  description: 'Form for updating patient medical history with new conditions and medications.',
  category: 'medical',
  type: 'medical-history',
  difficulty: 'medium',
  fieldCount: 15,
  estimatedTime: '~4m',
  isCustom: false,
  isHipaaCompliant: true,
  tags: ['medical', 'history', 'update', 'conditions'],
  version: '1.0.0',
  pages: [
    {
      id: 'page-1',
      name: 'Medical History Update',
      items: [
        {
          id: 'heading-1',
          type: 'heading',
          label: 'Update Medical Information',
        },
        {
          id: 'new-conditions',
          type: 'textarea',
          label: 'New Medical Conditions Since Last Visit',
          required: false,
          placeholder: 'List any new medical conditions diagnosed since your last visit...',
        },
        {
          id: 'medication-changes',
          type: 'textarea',
          label: 'Medication Changes',
          required: false,
          placeholder: 'List any new medications, discontinued medications, or dosage changes...',
        },
        {
          id: 'allergy-updates',
          type: 'textarea',
          label: 'New Allergies or Reactions',
          required: true,
          placeholder: 'List any new allergies or adverse reactions...',
          validation: [
            { type: 'required', message: 'Please list new allergies or write "None"' }
          ]
        },
        {
          id: 'surgery-history',
          type: 'textarea',
          label: 'Recent Surgeries or Procedures',
          required: false,
          placeholder: 'List any surgeries or procedures since last visit...',
        },
        {
          id: 'family-history-updates',
          type: 'textarea',
          label: 'Family History Updates',
          required: false,
          placeholder: 'Any significant changes in family medical history...',
        }
      ]
    }
  ]
};

// Pre-Visit Checklist Template
export const preVisitChecklistTemplate: Template = {
  id: 'pre-visit-checklist',
  name: 'Pre-Visit Checklist',
  description: 'Checklist for patients to complete before their appointment.',
  category: 'medical',
  type: 'questionnaire',
  difficulty: 'easy',
  fieldCount: 10,
  estimatedTime: '~2m',
  isCustom: false,
  isHipaaCompliant: true,
  tags: ['checklist', 'pre-visit', 'preparation', 'appointment'],
  version: '1.0.0',
  pages: [
    {
      id: 'page-1',
      name: 'Pre-Visit Preparation',
      items: [
        {
          id: 'heading-1',
          type: 'heading',
          label: 'Pre-Visit Checklist',
        },
        {
          id: 'medications-list',
          type: 'checkbox',
          label: 'Please confirm you have brought:',
          required: true,
          options: [
            'Medication list',
            'Insurance card',
            'Government-issued ID',
            'Recent test results',
            'Referral documents',
          ],
          validation: [
            { type: 'required', message: 'Confirm at least one item or select "None"' }
          ]
        },
        {
          id: 'fasting-confirmation',
          type: 'radio_group',
          label: 'Were you asked to fast?',
          required: true,
          options: ['Yes, and I fasted', 'Yes, but I did not fast', 'No fasting required'],
          validation: [
            { type: 'required', message: 'Please confirm fasting status' }
          ]
        },
        {
          id: 'recent-symptoms',
          type: 'textarea',
          label: 'Recent Symptoms or Concerns',
          required: false,
          placeholder: 'Describe any new symptoms or concerns for your provider...',
        }
      ]
    }
  ]
};

// Event Registration Template
export const eventRegistrationTemplate: Template = {
  id: 'event-registration',
  name: 'Event Registration',
  description: 'Multi-section registration form for healthcare events or webinars.',
  category: 'event-registration',
  type: 'event',
  difficulty: 'medium',
  fieldCount: 11,
  estimatedTime: '~4m',
  isCustom: false,
  isHipaaCompliant: false,
  tags: ['event', 'registration', 'webinar', 'attendance'],
  version: '1.0.0',
  pages: [
    {
      id: 'page-1',
      name: 'Participant Information',
      items: [
        {
          id: 'first-name',
          type: 'text_input',
          label: 'First Name',
          required: true,
          placeholder: 'Enter first name',
          validation: [
            { type: 'required', message: 'First name is required' }
          ]
        },
        {
          id: 'last-name',
          type: 'text_input',
          label: 'Last Name',
          required: true,
          placeholder: 'Enter last name',
          validation: [
            { type: 'required', message: 'Last name is required' }
          ]
        },
        {
          id: 'email',
          type: 'email_input',
          label: 'Work Email',
          required: true,
          placeholder: 'name@organization.com',
          validation: [
            { type: 'required', message: 'Email is required' }
          ]
        },
        {
          id: 'organization',
          type: 'text_input',
          label: 'Organization',
          required: false,
          placeholder: 'Clinic or hospital name',
        },
        {
          id: 'role',
          type: 'select',
          label: 'Role',
          required: true,
          options: ['Physician', 'Nurse', 'Administrator', 'Student', 'Other'],
          validation: [
            { type: 'required', message: 'Please select your role' }
          ]
        }
      ]
    },
    {
      id: 'page-2',
      name: 'Attendance Details',
      items: [
        {
          id: 'attendance-type',
          type: 'radio_group',
          label: 'Attendance Type',
          required: true,
          options: ['In-person', 'Virtual'],
          validation: [
            { type: 'required', message: 'Select an attendance type' }
          ]
        },
        {
          id: 'sessions',
          type: 'checkbox',
          label: 'Select Sessions',
          required: true,
          options: ['Opening Keynote', 'Clinical Innovations', 'Policy Update', 'Networking Workshop'],
          validation: [
            { type: 'required', message: 'Select at least one session' }
          ]
        },
        {
          id: 'accessibility-needs',
          type: 'textarea',
          label: 'Accessibility Requirements',
          required: false,
          placeholder: 'Let us know if you need accommodations...',
        }
      ]
    }
  ]
};

// Template Library
export const templateLibrary: Template[] = [
  patientIntakeTemplate,
  medicalHistoryTemplate,
  consentFormTemplate,
  contactFormTemplate,
  appointmentSchedulingTemplate,
  insuranceInfoTemplate,
  patientFeedbackSurveyTemplate,
  medicalHistoryUpdateTemplate,
  preVisitChecklistTemplate,
  eventRegistrationTemplate,
];

// Helper functions
export const getTemplatesByCategory = (category: TemplateCategory | 'all'): Template[] => {
  if (category === 'all') return templateLibrary;
  return templateLibrary.filter(template => template.category === category);
};

export const getTemplatesByType = (type: TemplateType | 'all'): Template[] => {
  if (type === 'all') return templateLibrary;
  return templateLibrary.filter(template => template.type === type);
};

export const getHipaaCompliantTemplates = (): Template[] => {
  return templateLibrary.filter(template => template.isHipaaCompliant);
};

export const searchTemplates = (query: string): Template[] => {
  const lowercaseQuery = query.toLowerCase();
  return templateLibrary.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getTemplateById = (id: string): Template | undefined => {
  return templateLibrary.find(template => template.id === id);
};
