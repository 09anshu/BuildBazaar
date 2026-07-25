import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await axios.put(`/api/users/reset-password/${token}`, { password });
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Reset link is invalid or expired.');
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
                <h1 className="text-3xl font-medium mb-3">Reset password</h1>
                <p className="text-sm text-gray-600 mb-6">
                    Create a new password for your BuildBazaar account.
                </p>

                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">New password</label>
                        <input
                            type="password"
                            className="w-full p-2 border border-gray-400 rounded-sm focus:outline-none focus:border-amazon_yellow focus:ring-1 focus:ring-amazon_yellow"
                            placeholder="Enter a new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Confirm new password</label>
                        <input
                            type="password"
                            className="w-full p-2 border border-gray-400 rounded-sm focus:outline-none focus:border-amazon_yellow focus:ring-1 focus:ring-amazon_yellow"
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-amazon_yellow text-black font-bold py-2 rounded-md transition-colors hover:bg-yellow-500 shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'Updating password...' : 'Update password'}
                    </button>
                </form>

                <div className="border-t border-gray-300 mt-6 pt-6 text-sm">
                    Back to <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;