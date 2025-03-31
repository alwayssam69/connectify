'use client'

import { motion } from 'framer-motion'

const sections = [
  {
    title: 'Introduction',
    content: `At Networker, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully.`,
  },
  {
    title: 'Information We Collect',
    content: `We collect information that you provide directly to us, including:
    • Personal information (name, email address, professional background)
    • Profile information (photo, skills, experience)
    • Communications and interactions with other users
    • Usage data and analytics`,
  },
  {
    title: 'How We Use Your Information',
    content: `We use the information we collect to:
    • Provide and maintain our services
    • Match you with relevant professional connections
    • Improve and personalize your experience
    • Communicate with you about updates and features
    • Ensure platform security and prevent abuse`,
  },
  {
    title: 'Information Sharing',
    content: `We may share your information with:
    • Other users as part of the platform's networking features
    • Service providers who assist in our operations
    • Law enforcement when required by law
    We never sell your personal information to third parties.`,
  },
  {
    title: 'Data Security',
    content: `We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: 'Your Rights',
    content: `You have the right to:
    • Access your personal information
    • Correct inaccurate information
    • Request deletion of your information
    • Opt-out of marketing communications
    • Export your data`,
  },
  {
    title: 'Cookies and Tracking',
    content: `We use cookies and similar tracking technologies to improve your experience, understand platform usage, and personalize content. You can control cookie settings through your browser preferences.`,
  },
  {
    title: 'Children\'s Privacy',
    content: `Our platform is not intended for individuals under 18 years of age. We do not knowingly collect or maintain information from children under 18.`,
  },
  {
    title: 'Changes to Privacy Policy',
    content: `We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-base font-semibold leading-7 text-primary-600">
              Legal
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Privacy Policy
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Last updated: March 31, 2024
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-16 max-w-2xl space-y-16 sm:mt-20"
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold leading-8 text-gray-900">
                {section.title}
              </h3>
              <div className="text-base leading-7 text-gray-600 whitespace-pre-line">
                {section.content}
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (sections.length + 1) }}
            className="border-t border-gray-200 pt-16"
          >
            <p className="text-base leading-7 text-gray-600">
              For any privacy-related questions or concerns, please contact our Data Protection Officer at{' '}
              <a
                href="mailto:privacy@networker.com"
                className="font-semibold text-primary-600 hover:text-primary-500"
              >
                privacy@networker.com
              </a>
              .
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 