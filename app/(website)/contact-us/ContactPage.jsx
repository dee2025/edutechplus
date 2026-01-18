'use client';

import { useState } from 'react';
import {
    Mail,
    Users,
    Clock,
    Send,
} from 'lucide-react';



export default function ContactUsPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        message: '',
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setStatus('success');
            setForm({ name: '', email: '', message: '' });
        } catch (err) {
            setStatus(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] px-4 py-14">
            <div className="max-w-5xl mx-auto bg-[#111827] rounded-2xl p-8 md:p-12">
                <h1 className="text-4xl font-bold text-gray-100 mb-4">
                    Contact Our Team
                </h1>

                <p className="text-gray-400 max-w-2xl mb-12">
                    We publish insights on technology, startups, and modern business.
                    For partnerships, content ideas, advertising, or general queries,
                    feel free to reach out.
                </p>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Info Section */}
                    <div className="space-y-10 text-gray-300">
                        <div className="flex gap-4">
                            <Mail className="text-cyan-400 w-6 h-6 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-100">
                                    Email
                                </h3>
                                <p className="text-gray-400 mt-1">
                                    Business and support inquiries
                                </p>
                                <p className="text-cyan-400 mt-2">
                                    kapeedsingh2001@gmail.com
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Users className="text-cyan-400 w-6 h-6 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-100">
                                    Collaborations
                                </h3>
                                <p className="text-gray-400 mt-1">
                                    We work with startups, founders, developers,
                                    and tech brands to create high-quality,
                                    future-ready content.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Clock className="text-cyan-400 w-6 h-6 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-100">
                                    Response Time
                                </h3>
                                <p className="text-gray-400 mt-1">
                                    Expect a response within 24–48 hours.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">
                                Your Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full rounded-lg bg-[#020617] border border-gray-700 px-4 py-3 text-gray-100 focus:outline-none focus:border-cyan-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full rounded-lg bg-[#020617] border border-gray-700 px-4 py-3 text-gray-100 focus:outline-none focus:border-cyan-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">
                                Message
                            </label>
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                rows="5"
                                placeholder="Tell us about your idea or query..."
                                className="w-full rounded-lg bg-[#020617] border border-gray-700 px-4 py-3 text-gray-100 focus:outline-none focus:border-cyan-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3 rounded-lg transition disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>

                        {status === 'success' && (
                            <p className="text-green-400 text-sm">
                                Message sent successfully. We’ll get back to you shortly.
                            </p>
                        )}

                        {status && status !== 'success' && (
                            <p className="text-red-400 text-sm">
                                {status}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
