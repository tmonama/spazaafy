import React from 'react';
import Header from '../components/Header';
import Card from '../components/Card';

const DeleteAccountPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Delete your Spazaafy account
          </h1>

          <Card title="How to request account deletion">
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">
              You can delete your account using two different methods. The first method is by clicking the "Delete account" button in "Account".
              The second method to delete your Spazaafy account and associated data,
              is to request deletion at any time using the steps below.
            </p>

            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-slate-900/60">
              <p className="text-sm text-gray-800 dark:text-gray-100 mb-2">
                Please send an email to{' '}
                <strong>support@spazaafy.co.za</strong> from the same email address
                that you used to create your Spazaafy account and include:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-800 dark:text-gray-100 space-y-1">
                <li>Your full name</li>
                <li>The email address linked to your Spazaafy account</li>
                <li>Whether you are a consumer or a spaza shop owner</li>
              </ul>
            </div>
          </Card>

          <Card title="What happens when your account is deleted">
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">
              When we process your deletion request:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-200 space-y-1 mb-3">
              <li>Your Spazaafy account will be permanently deleted or anonymised.</li>
              <li>
                Access to the app using that account will be removed and you will no
                longer be able to sign in with those details.
              </li>
              <li>
                Associated profile and shop data will be removed, except where we are
                required to retain limited information for legal or regulatory reasons.
              </li>
            </ul>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              We aim to complete account deletion within 7 business days of receiving
              your request. If we are required by law to retain certain records, we
              will store only the minimum necessary information and only for as long as
              required.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DeleteAccountPage;
