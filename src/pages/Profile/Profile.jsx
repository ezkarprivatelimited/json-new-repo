import { motion } from "framer-motion";
import { useState } from "react";
import {
	FiAlertCircle,
	FiCheck,
	FiKey,
	FiLock,
	FiMail,
	FiPhone,
	FiSave,
	FiShield,
	FiUser,
	FiX,
} from "react-icons/fi";
import api from "../../api/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { useAuth } from "../../contexts/AuthContext";

const Profile = () => {
	const { user, refreshUser } = useAuth();
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	const [formData, setFormData] = useState({
		name: user?.name || "",
		phone: user?.phone || "",
		email: user?.email || "",
	});

	const [passwordData, setPasswordData] = useState({
		newPassword: "",
		confirmPassword: "",
	});

	const [passLoading, setPassLoading] = useState(false);
	const [passError, setPassError] = useState(null);
	const [passSuccess, setPassSuccess] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleCancel = () => {
		setFormData({
			name: user?.name || "",
			phone: user?.phone || "",
			email: user?.email || "",
		});
		setEditing(false);
		setError(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			// Update the user via the USER_STATUS endpoint (which handles updates)
			await api.put(API_ENDPOINTS.USER_STATUS(user._id), formData);

			await refreshUser(true); // Get fresh data
			setSuccess(true);
			setEditing(false);

			setTimeout(() => setSuccess(false), 3000);
		} catch (err) {
			console.error("Profile update error:", err);
			setError(err.response?.data?.message || "Failed to update profile");
		} finally {
			setLoading(false);
		}
	};

	const handlePasswordChange = (e) => {
		const { name, value } = e.target;
		setPasswordData((prev) => ({ ...prev, [name]: value }));
	};

	const handlePasswordSubmit = async (e) => {
		e.preventDefault();
		setPassLoading(true);
		setPassError(null);
		setPassSuccess(false);

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			setPassError("New passwords do not match");
			setPassLoading(false);
			return;
		}

		try {
			await api.put(API_ENDPOINTS.USER_STATUS(user._id), {
				password: passwordData.newPassword,
			});

			setPassSuccess(true);
			setPasswordData({
				newPassword: "",
				confirmPassword: "",
			});
			setTimeout(() => setPassSuccess(false), 3000);
		} catch (err) {
			console.error("Password update error:", err);
			setPassError(err.response?.data?.message || "Failed to change password");
		} finally {
			setPassLoading(false);
		}
	};

	if (!user) return null;

	return (
		<div className="w-full space-y-4 py-2 px-2 sm:px-4">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
				<div className="flex items-center gap-4">
					<div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-100 shrink-0">
						{user.name?.[0]?.toUpperCase() || <FiUser />}
					</div>
					<div>
						<h1 className="text-2xl font-black text-zinc-900 tracking-tight">
							{user.name || "User Profile"}
						</h1>
						<p className="text-zinc-500 font-bold text-xs">
							Manage your account and preferences
						</p>
					</div>
				</div>
				{!editing && (
					<button
						onClick={() => setEditing(true)}
						className="px-5 py-2 bg-white border border-zinc-200 text-zinc-600 font-black rounded-xl hover:bg-zinc-50 transition-all flex items-center gap-2 shadow-sm text-xs active:scale-95">
						Edit Profile
					</button>
				)}
			</div>

			{/* Success/Error Alerts */}
			{success && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 font-medium">
					<FiCheck className="text-emerald-500" />
					Profile updated successfully!
				</motion.div>
			)}

			{error && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3 font-medium">
					<FiAlertCircle className="text-rose-500" />
					{error}
				</motion.div>
			)}

			{/* Form Section */}
			<div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
				<div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
					<h2 className="font-black text-zinc-900 flex items-center gap-2 text-sm">
						<FiUser className="text-indigo-600" size={16} /> Personal Information
					</h2>
				</div>

				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Name */}
						<div className="space-y-2">
							<label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
								Full Name
							</label>
							<div className="relative">
								<FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									disabled={!editing}
									className={`w-full pl-11 pr-4 py-3 rounded-2xl border transition-all outline-none font-medium ${
										editing
											? "border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
											: "border-zinc-100 bg-zinc-50/50 text-zinc-600 cursor-not-allowed"
									}`}
								/>
							</div>
						</div>

						{/* Phone */}
						<div className="space-y-2">
							<label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
								Phone Number
							</label>
							<div className="relative">
								<FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
								<input
									type="tel"
									name="phone"
									value={formData.phone}
									onChange={handleChange}
									disabled={!editing}
									className={`w-full pl-11 pr-4 py-3 rounded-2xl border transition-all outline-none font-medium ${
										editing
											? "border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
											: "border-zinc-100 bg-zinc-50/50 text-zinc-600 cursor-not-allowed"
									}`}
								/>
							</div>
						</div>

						{/* Email */}
						<div className="space-y-2">
							<label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
								Email Address
							</label>
							<div className="relative">
								<FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									disabled={!editing}
									className={`w-full pl-11 pr-4 py-3 rounded-2xl border transition-all outline-none font-medium ${
										editing
											? "border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
											: "border-zinc-100 bg-zinc-50/50 text-zinc-600 cursor-not-allowed"
									}`}
								/>
							</div>
						</div>

						{/* Role - Read Only */}
						<div className="space-y-2">
							<label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
								Account Role
							</label>
							<div className="relative">
								<FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
								<input
									type="text"
									value={user.role?.toUpperCase() || ""}
									disabled
									className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 text-zinc-400 cursor-not-allowed font-bold"
								/>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					{editing && (
						<div className="flex items-center gap-2 pt-4 border-t border-zinc-100">
							<button
								type="submit"
								disabled={loading}
								className="px-6 py-2.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 disabled:opacity-50 text-xs active:scale-95">
								{loading ? (
									"Saving..."
								) : (
									<>
										<FiSave /> Save Changes
									</>
								)}
							</button>
							<button
								type="button"
								onClick={handleCancel}
								disabled={loading}
								className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-600 font-black rounded-xl hover:bg-zinc-50 transition-all flex items-center gap-2 text-xs active:scale-95">
								<FiX /> Cancel
							</button>
						</div>
					)}
				</form>
			</div>

			{/* Change Password Section */}
			<div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
				<div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
					<h2 className="font-black text-zinc-900 flex items-center gap-2 text-sm">
						<FiLock className="text-rose-600" size={16} /> Change Password
					</h2>
				</div>

				<form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
					{passSuccess && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 font-medium">
							<FiCheck className="text-emerald-500" />
							Password changed successfully!
						</motion.div>
					)}

					{passError && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3 font-medium">
							<FiAlertCircle className="text-rose-500" />
							{passError}
						</motion.div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* New Password */}
						<div className="space-y-2">
							<label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
								New Password
							</label>
							<div className="relative">
								<FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
								<input
									type="password"
									name="newPassword"
									value={passwordData.newPassword}
									onChange={handlePasswordChange}
									required
									className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-100 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
								/>
							</div>
						</div>

						{/* Confirm Password */}
						<div className="space-y-2">
							<label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
								Confirm New Password
							</label>
							<div className="relative">
								<FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
								<input
									type="password"
									name="confirmPassword"
									value={passwordData.confirmPassword}
									onChange={handlePasswordChange}
									required
									className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-100 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
								/>
							</div>
						</div>
					</div>

					<div className="flex pt-4">
						<button
							type="submit"
							disabled={passLoading}
							className="px-8 py-3 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 shadow-lg shadow-zinc-100 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95">
							{passLoading ? "Updating..." : "Update Password"}
						</button>
					</div>
				</form>
			</div>

			{/* Account Status Card */}
			<div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden relative group">
				<div className="relative z-10">
					<h3 className="text-sm font-black text-zinc-900 mb-4 tracking-tight uppercase">Subscription Details</h3>
					<div className="flex flex-wrap gap-3">
						<div className="bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
							<p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
								Status
							</p>
							<p className="font-black text-indigo-600 text-sm">
								{user.isActive ? "ACTIVE" : "PENDING"}
							</p>
						</div>
						<div className="bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
							<p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
								Valid Until
							</p>
							<p className="font-black text-zinc-900 text-sm">
								{user.subsValid
									? new Date(user.subsValid).toLocaleDateString()
									: "N/A"}
							</p>
						</div>
					</div>
				</div>
				<FiShield className="text-zinc-50 w-24 h-24 absolute -right-4 -bottom-4 transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
			</div>
		</div>
	);
};

export default Profile;
