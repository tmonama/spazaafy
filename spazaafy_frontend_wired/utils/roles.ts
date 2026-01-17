export const DEPARTMENT_ROLES: Record<string, string[]> = {
    'EXECUTIVE': [
        'Managing Director / CEO', 'Deputy Managing Director', 'Executive Operations Director',
        'Board Secretary', 'Non-Executive Directors', 'Advisory Board Members'
    ],
    'TECH': [
        'Director of Technology / CTO', 'Head of R&D', 'Platform Stability Lead', 'Release Manager',
        'Lead Architect', 'Backend Engineer', 'Frontend Engineer', 'Mobile Developer', 
        'Data / Systems Engineer', 'AI / Analytics Engineer', 
        'Platform Stability Engineer', 'Bug & Incident Engineer', 'QA / Testing Engineer', 'Security Engineer',
        'DevOps Engineer', 'Mobile Deployment Engineer', 'Release Coordinator'
    ],
    'FINANCE': [
        'Director of Finance & Administration', 'Finance Manager', 
        'Finance Officer', 'Accounts Administrator', 'Records Keeper', 'Payroll Administrator',
        'Procurement Administrator', 'Investment & Funding Coordinator', 'Investor Relations Administrator'
    ],
    'LEGAL': [
        'Director of Legal & Compliance', 'Legal Manager', 
        'Legal Officer', 'Compliance Officer', 'Policy & Governance Officer', 'Risk & Ethics Officer',
        'Contract Administrator', 'Data Protection Officer', 'Legal Research Assistant'
    ],
    'SUPPORT': [
        'Director of Customer Support & Internal Administration', 'Support Operations Manager',
        'Customer Support Lead', 'Support Agent', 'Case & Escalations Officer', 'Internal Administrator',
        'Documentation Officer', 'Communications Quality Officer', 'CRM Administrator'
    ],
    'FIELD': [
        'Director of Field Operations', 'Regional Operations Manager',
        'Field Operations Coordinator', 'Field Verification Officer', 'Site Visit Supervisor',
        'Compliance Inspection Officer', 'Community Liaison Officer', 'Field Data Capture Officer', 'Quality Control Officer'
    ],
    'COMMUNITY': [
        'Director of Community Engagement', 'Community Programs Manager',
        'Engagement Officer', 'Outreach Coordinator', 'Partnerships Officer',
        'Community Research Officer', 'Events Coordinator', 'Youth Liaison Officer'
    ],
    'MEDIA': [
        'Director of Media & Communications', 'Media Operations Manager',
        'Content Producer', 'Videographer', 'Photographer', 'Graphic Designer', 'Copywriter', 'Editor',
        'Social Media Manager', 'Community Moderator', 'Content Scheduler', 'Analytics Officer',
        'Campaign Manager', 'PR Officer', 'Brand & Messaging Officer'
    ],
    'HR': [
        'Director of Training & Onboarding', 'HR Operations Manager',
        'Onboarding Coordinator', 'Training Program Officer', 'Learning & Development Officer',
        'Certification Trainer', 'HR Administrator', 'Performance Development Officer', 'Internship Coordinator'
    ],
    'FUTURE': [
        'Monitoring & Evaluation Officer', 'Impact Officer', 'Government Relations Manager',
        'Municipal Partnerships Manager', 'Strategy & Innovation Manager', 'Internal Audit Officer', 'Risk & Controls Manager'
    ]
};

export const DEPARTMENT_LABELS: Record<string, string> = {
    'EXECUTIVE': 'Executive & Leadership',
    'TECH': 'Technology & Development',
    'FINANCE': 'Finance & Administration',
    'LEGAL': 'Legal & Compliance',
    'SUPPORT': 'Customer Support & Internal Admin',
    'FIELD': 'Field Operations',
    'COMMUNITY': 'Community Engagement',
    'MEDIA': 'Media, Content & Communications',
    'HR': 'Training & Onboarding (HR)',
    'FUTURE': 'Optional / Future Roles'
};