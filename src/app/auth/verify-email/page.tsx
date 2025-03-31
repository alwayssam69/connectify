'use client'

import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <div className="mt-4 text-center text-gray-600">
            <p className="mb-4">
              We've sent you an email with a link to verify your account.
            </p>
            <p className="mb-4">
              Please check your inbox and click the link to complete your registration.
            </p>
            <p>
              If you don't see the email, check your spam folder.
            </p>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 