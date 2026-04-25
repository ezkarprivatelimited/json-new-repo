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

const inputBase =
	"w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-zinc-800 outline-none transition-all";
const inputActive =
	"border-zinc-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 bg-white";
const inputDisabled =
	"border-zinc-100 bg-zinc-50 text-zinc-500 cursor-not-allowed";

const labelClass = "text-xs font-semibold text-zinc-500 mb-1.5 block";

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
			await api.put(API_ENDPOINTS.USER_STATUS(user._id), formData);
			await refreshUser(true);
			setSuccess(true);
			setEditing(false);
			setTimeout(() => setSuccess(false), 3000);
		} catch (err) {
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
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			setPassError("Passwords do not match");
			return;
		}
		setPassLoading(true);
		setPassError(null);
		setPassSuccess(false);
		try {
			await api.put(API_ENDPOINTS.USER_STATUS(user._id), {
				password: passwordData.newPassword,
			});
			setPassSuccess(true);
			setPasswordData({ newPassword: "", confirmPassword: "" });
			setTimeout(() => setPassSuccess(false), 3000);
		} catch (err) {
			setPassError(err.response?.data?.message || "Failed to change password");
		} finally {
			setPassLoading(false);
		}
	};

	if (!user) return null;

	const subsExpired = user.subsValid && new Date(user.subsValid) < new Date();

	return (
		<div className="space-y-4 ">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
				<div className="flex items-center gap-4">
					<div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-100 shrink-0">
						{user.name?.[0]?.toUpperCase() || <FiUser />}
					</div>
					<div>
						<h1 className="text-lg font-bold text-zinc-900">
							{user.name || "User Profile"}
						</h1>
						<p className="text-sm text-zinc-500 mt-0.5">
							Manage your account and preferences
						</p>
					</div>
				</div>
				{!editing && (
					<button
						onClick={() => setEditing(true)}
						className="px-4 py-2 bg-white border border-zinc-200 text-sm font-medium text-zinc-600 rounded-xl hover:bg-zinc-50 transition-all">
						Edit Profile
					</button>
				)}
			</div>

			{/* Alerts */}
			{success && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-2 text-sm">
					<FiCheck size={15} /> Profile updated successfully
				</motion.div>
			)}
			{error && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-2 text-sm">
					<FiAlertCircle size={15} /> {error}
				</motion.div>
			)}

			{/* Personal Info */}
			<div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
				<div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
					<FiUser className="text-indigo-500" size={15} />
					<h2 className="text-sm font-semibold text-zinc-800">
						Personal Information
					</h2>
				</div>
				<form onSubmit={handleSubmit} className="p-5 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[
							{
								label: "Full Name",
								name: "name",
								type: "text",
								icon: <FiUser size={15} />,
							},
							{
								label: "Phone Number",
								name: "phone",
								type: "tel",
								icon: <FiPhone size={15} />,
							},
							{
								label: "Email Address",
								name: "email",
								type: "email",
								icon: <FiMail size={15} />,
							},
						].map(({ label, name, type, icon }) => (
							<div key={name}>
								<label className={labelClass}>{label}</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
										{icon}
									</span>
									<input
										type={type}
										name={name}
										value={formData[name]}
										onChange={handleChange}
										disabled={!editing}
										className={`${inputBase} ${editing ? inputActive : inputDisabled}`}
									/>
								</div>
							</div>
						))}
						<div>
							<label className={labelClass}>Account Role</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
									<FiShield size={15} />
								</span>
								<input
									type="text"
									value={user.role || ""}
									disabled
									className={`${inputBase} ${inputDisabled} capitalize`}
								/>
							</div>
						</div>
					</div>

					{editing && (
						<div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
							<button
								type="submit"
								disabled={loading}
								className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50">
								<FiSave size={14} /> {loading ? "Saving…" : "Save Changes"}
							</button>
							<button
								type="button"
								onClick={handleCancel}
								disabled={loading}
								className="px-5 py-2 bg-white border border-zinc-200 text-sm font-medium text-zinc-600 rounded-xl hover:bg-zinc-50 transition-all flex items-center gap-2">
								<FiX size={14} /> Cancel
							</button>
						</div>
					)}
				</form>
			</div>

			{/* Change Password */}
			<div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
				<div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
					<FiLock className="text-rose-500" size={15} />
					<h2 className="text-sm font-semibold text-zinc-800">
						Change Password
					</h2>
				</div>
				<form onSubmit={handlePasswordSubmit} className="p-5 space-y-4">
					{passSuccess && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-2 text-sm">
							<FiCheck size={15} /> Password changed successfully
						</motion.div>
					)}
					{passError && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-2 text-sm">
							<FiAlertCircle size={15} /> {passError}
						</motion.div>
					)}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[
							{ label: "New Password", name: "newPassword" },
							{ label: "Confirm Password", name: "confirmPassword" },
						].map(({ label, name }) => (
							<div key={name}>
								<label className={labelClass}>{label}</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
										<FiKey size={15} />
									</span>
									<input
										type="password"
										name={name}
										value={passwordData[name]}
										onChange={handlePasswordChange}
										required
										className={`${inputBase} ${inputActive}`}
										placeholder="••••••••"
									/>
								</div>
							</div>
						))}
					</div>
					<div className="pt-2">
						<button
							type="submit"
							disabled={passLoading}
							className="px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:opacity-50">
							{passLoading ? "Updating…" : "Update Password"}
						</button>
					</div>
				</form>
			</div>

			{/* Subscription */}
			<div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
				<h3 className="text-sm font-semibold text-zinc-800 mb-4">
					Subscription Details
				</h3>
				<div className="flex flex-wrap gap-3">
					<div className="bg-zinc-50 px-4 py-3 rounded-xl border border-zinc-100">
						<p className="text-xs text-zinc-400 mb-1">Status</p>
						<p
							className={`text-sm font-semibold ${user.isActive ? "text-emerald-600" : "text-zinc-400"}`}>
							{user.isActive ? "Active" : "Inactive"}
						</p>
					</div>
					<div
						className={`px-4 py-3 rounded-xl border ${subsExpired ? "bg-red-50 border-red-100" : "bg-zinc-50 border-zinc-100"}`}>
						<p className="text-xs text-zinc-400 mb-1">Valid Until</p>
						<p
							className={`text-sm font-semibold ${subsExpired ? "text-red-600" : "text-zinc-800"}`}>
							{user.subsValid
								? new Date(user.subsValid).toLocaleDateString("en-IN", {
										day: "numeric",
										month: "short",
										year: "numeric",
									})
								: "—"}
							{subsExpired && (
								<span className="ml-2 text-xs text-red-400">Expired</span>
							)}
						</p>
					</div>
					<div className="bg-zinc-50 px-4 py-3 rounded-xl border border-zinc-100">
						<p className="text-xs text-zinc-400 mb-1">Role</p>
						<p className="text-sm font-semibold text-zinc-800 capitalize">
							{user.role || "—"}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
