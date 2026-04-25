import { motion } from "framer-motion";
import { useState } from "react";
import {
	FiBriefcase,
	FiChevronLeft,
	FiLock,
	FiMail,
	FiPhone,
	FiPlus,
	FiShield,
	FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { API_ENDPOINTS } from "../../api/endpoints";

const CreateUser = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		password: "",
		role: "trader",
		gstin: "",
		subsStart: new Date().toISOString().split("T")[0],
		subsDays: "30",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			const createRes = await api.post(API_ENDPOINTS.SIGNUP, {
				name: form.name,
				email: form.email,
				phone: form.phone,
				password: form.password,
				role: form.role,
				gstin: form.gstin,
			});

			const newUser = createRes.data.user || createRes.data.data;
			if (!newUser?._id) throw new Error("Failed to get new user ID");

			const subsValid = new Date(
				new Date(form.subsStart).getTime() +
					Number(form.subsDays) * 24 * 60 * 60 * 1000,
			).toISOString();

			await api.put(API_ENDPOINTS.USER_STATUS(newUser._id), {
				isActive: true,
				subsValid,
			});

			setSuccess(true);
			setForm({
				name: "",
				email: "",
				phone: "",
				password: "",
				role: "trader",
				gstin: "",
				subsStart: new Date().toISOString().split("T")[0],
				subsDays: "30",
			});

			setTimeout(() => {
				setSuccess(false);
				navigate("/manage-users");
			}, 2000);
		} catch (err) {
			console.error("Create user error:", err);
			setError(err.response?.data?.message || "Failed to create user");
		} finally {
			setLoading(false);
		}
	};

	const inputClasses =
		"w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm text-zinc-800 bg-white placeholder:text-zinc-400";
	const labelClasses = "text-xs font-semibold text-zinc-500 mb-1.5 block";

	return (
		<div className="w-full py-4 px-4 sm:px-6">
			{/* Clean Header */}
			<div className=" flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-100 pb-4">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
						<FiPlus size={20} />
					</div>
					<div>
						<h1 className="text-xl font-bold text-zinc-900 tracking-tight">
							Onboard User
						</h1>
						<p className="text-sm text-zinc-500 mt-0.5">
							Manual account creation & activation
						</p>
					</div>
				</div>
				<button
					onClick={() => navigate(-1)}
					className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-all flex items-center gap-2">
					<FiChevronLeft size={14} /> Back
				</button>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
					{/* Card 1: Identity & Security */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-5">
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
								<FiUser size={18} />
							</div>
							<div>
								<h2 className="text-base font-semibold text-zinc-900">
									Account Identity
								</h2>
								<p className="text-xs text-zinc-400">
									Personal and login credentials
								</p>
							</div>
						</div>

						{error && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-2 text-sm">
								<FiShield size={14} className="text-rose-400 shrink-0" />{" "}
								{error}
							</motion.div>
						)}

						<div className="space-y-3">
							<div>
								<label className={labelClasses}>Full Name</label>
								<div className="relative group">
									<FiUser
										className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors"
										size={15}
									/>
									<input
										type="text"
										name="name"
										required
										value={form.name}
										onChange={handleChange}
										className={inputClasses}
										placeholder="John Doe"
									/>
								</div>
							</div>
							<div>
								<label className={labelClasses}>Email Address</label>
								<div className="relative group">
									<FiMail
										className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors"
										size={15}
									/>
									<input
										type="email"
										name="email"
										required
										value={form.email}
										onChange={handleChange}
										className={inputClasses}
										placeholder="john@example.com"
									/>
								</div>
							</div>
							<div>
								<label className={labelClasses}>Mobile Number</label>
								<div className="relative group">
									<FiPhone
										className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors"
										size={15}
									/>
									<input
										type="tel"
										name="phone"
										required
										value={form.phone}
										onChange={handleChange}
										className={inputClasses}
										placeholder="9876543210"
									/>
								</div>
							</div>
							<div>
								<label className={labelClasses}>Initial Password</label>
								<div className="relative group">
									<FiLock
										className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors"
										size={15}
									/>
									<input
										type="password"
										name="password"
										required
										value={form.password}
										onChange={handleChange}
										className={inputClasses}
										placeholder="••••••••"
									/>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Card 2: Business & Access */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="space-y-4">
						<div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-5">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
									<FiShield size={18} />
								</div>
								<div>
									<h2 className="text-base font-semibold text-zinc-900">
										Access Control
									</h2>
									<p className="text-xs text-zinc-400">
										Business role and validation
									</p>
								</div>
							</div>

							<div className="space-y-4">
								<div>
									<label className={labelClasses}>Account Role</label>
									<div className="grid grid-cols-3 gap-2">
										{["trader", "manufacturer", "admin"].map((role) => (
											<button
												key={role}
												type="button"
												onClick={() => setForm((p) => ({ ...p, role }))}
												className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
													form.role === role
														? "bg-indigo-600 text-white border-indigo-600"
														: "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
												}`}>
												{role}
											</button>
										))}
									</div>
								</div>

								<div>
									<label className={labelClasses}>GSTIN Number</label>
									<div className="relative group">
										<FiBriefcase
											className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors"
											size={15}
										/>
										<input
											type="text"
											name="gstin"
											required
											value={form.gstin}
											onChange={handleChange}
											className={`${inputClasses} uppercase tracking-wider`}
											placeholder="22AAAAA0000A1Z5"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Subscription Card */}
						<div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
							<h3 className="text-sm font-semibold text-zinc-700 mb-4">
								Subscription Plan
							</h3>

							<div className="space-y-4">
								<div>
									<label className={labelClasses}>Duration</label>
									<div className="flex flex-wrap gap-2">
										{[7, 30, 90, 180, 365].map((d) => (
											<button
												key={d}
												type="button"
												onClick={() =>
													setForm((p) => ({ ...p, subsDays: d.toString() }))
												}
												className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
													form.subsDays === d.toString()
														? "bg-indigo-600 text-white"
														: "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
												}`}>
												{d} days
											</button>
										))}
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4 items-end">
									<div>
										<label className={labelClasses}>Custom Days</label>
										<input
											type="number"
											name="subsDays"
											value={form.subsDays}
											onChange={handleChange}
											className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-indigo-400"
										/>
									</div>
									<div className="text-right">
										<p className="text-xs text-zinc-400 mb-0.5">Valid until</p>
										<p className="text-base font-semibold text-zinc-900">
											{new Date(
												new Date(form.subsStart).getTime() +
													Number(form.subsDays) * 86400000,
											).toLocaleDateString("en-IN", {
												day: "numeric",
												month: "short",
												year: "numeric",
											})}
										</p>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Floating Action Bar */}
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					className="sticky bottom-4 left-0 right-0 flex items-end justify-end">
					<div className="flex items-center gap-3 w-full sm:w-auto">
						{success && (
							<span className="text-emerald-600 text-sm font-medium mr-3 hidden md:block">
								✓ User created successfully
							</span>
						)}
						<button
							type="submit"
							disabled={loading}
							className="flex-1 sm:flex-none px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
							{loading ? (
								"Creating..."
							) : (
								<>
									<FiPlus size={14} /> Create User
								</>
							)}
						</button>
					</div>
				</motion.div>
			</form>
		</div>
	);
};

export default CreateUser;
