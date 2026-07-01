import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetUrl, setResetUrl] = useState('');

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResetUrl('');

        try {
            const { data } = await axios.post('/api/users/forgot-password', { email: email.trim().toLowerCase() });
            setResetUrl(`${window.location.origin}/reset-password/${data.resetToken}`);
            toast.success('Reset link created. Open it below to set a new password.');
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Unable to start password reset. Please check the email and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen flex flex-col items-center pt-10 px-4">
            <Link to="/" className="text-3xl font-bold text-black mb-8">
                Build<span className="text-amazon_yellow">Bazaar</span>
            </Link>

            <div className="w-full max-w-md border border-gray-300 rounded-md p-8 shadow-sm">
                <h1 className="text-3xl font-medium mb-3">Forgot password</h1>
                <p className="text-sm text-gray-600 mb-6">
                    Enter the email address for your BuildBazaar account. We’ll generate a reset link you can use immediately.
                </p>

                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Email address</label>
                        <input
                            type="email"
                            className="w-full p-2 border border-gray-400 rounded-sm focus:outline-none focus:border-amazon_yellow focus:ring-1 focus:ring-amazon_yellow"
                            placeholder="Enter your account email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-amazon_yellow text-black font-bold py-2 rounded-md transition-colors hover:bg-yellow-500 shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'Creating reset link...' : 'Send reset link'}
                    </button>
                </form>

                {resetUrl ? (
                    <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                        <p className="font-bold mb-2">Reset link ready</p>
                        <a href={resetUrl} className="break-all text-blue-700 underline">
                            {resetUrl}
                        </a>
                        <p className="mt-2 text-xs text-green-800">
                            Open this link in your browser to set a new password.
                        </p>
                    </div>
                ) : null}

                <div className="border-t border-gray-300 mt-6 pt-6 text-sm">
                    Remembered your password? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;