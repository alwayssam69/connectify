'use client'

import { motion } from 'framer-motion'

const sections = [
  {
    title: 'Terms of Use',
    content: `By accessing and using Networker, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.`,
  },
  {
    title: 'User Accounts',
    content: `You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.`,
  },
  {
    title: 'User Conduct',
    content: `You agree to use Networker in a manner consistent with all applicable laws and regulations. You will not engage in any behavior that is harmful, fraudulent, deceptive, threatening, harassing, defamatory, obscene, or otherwise objectionable.`,
  },
  {
    title: 'Privacy',
    content: `Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using Networker, you agree to our Privacy Policy.`,
  },
  {
    title: 'Intellectual Property',
    content: `All content and materials available on Networker, including but not limited to text, graphics, logos, button icons, images, audio clips, data compilations, and software, are the property of Networker or its content suppliers and protected by copyright laws.`,
  },
  {
    title: 'Limitation of Liability',
    content: `Networker and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.`,
  },
  {
    title: 'Changes to Terms',
    content: `We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the platform. Your continued use of Networker after such modifications constitutes your acceptance of the updated terms.`,
  },
  {
    title: 'Termination',
    content: `We may terminate or suspend your account and access to Networker immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms of Service.`,
  },
]

export default function TermsPage() {
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
              Terms of Service
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
              <p className="text-base leading-7 text-gray-600">
                {section.content}
              </p>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (sections.length + 1) }}
            className="border-t border-gray-200 pt-16"
          >
            <p className="text-base leading-7 text-gray-600">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a
                href="mailto:legal@networker.com"
                className="font-semibold text-primary-600 hover:text-primary-500"
              >
                legal@networker.com
              </a>
              .
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 