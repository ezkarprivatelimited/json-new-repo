import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
	FiCheck,
	FiLoader,
	FiLock,
	FiMail,
	FiPhone,
	FiPlusCircle,
	FiRefreshCw,
	FiSearch,
	FiShield,
	FiUser,
	FiX,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { API_ENDPOINTS } from "../../api/endpoints";

const ROLE_COLORS = {
	admin: "bg-purple-100 text-purple-700",
	manufacturer: "bg-blue-100 text-blue-700",
	trader: "bg-amber-100 text-amber-700",
};

const getStatusStyle = (isActive) =>
	isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
const getStatusLabel = (isActive) => (isActive ? "Active" : "Inactive");

const labelCls = "text-xs font-semibold text-zinc-500 mb-1.5 block";

const ManageUsers = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [actionLoading, setActionLoading] = useState({});
	const [selectedUser, setSelectedUser] = useState(null);
	const [subModal, setSubModal] = useState(null);
	const hasFetched = useRef(false);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await api.get(API_ENDPOINTS.USERS);
			setUsers(res.data.users || res.data.data || res.data);
		} catch {
			setError("Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handleApprove = async (userId, subsStart, subsDays) => {
		setActionLoading((prev) => ({ ...prev, [userId]: "approving" }));
		try {
			const subsValid = new Date(
				new Date(subsStart).getTime() + Number(subsDays) * 86400000,
			).toISOString();
			const res = await api.put(API_ENDPOINTS.USER_STATUS(userId), {
				isActive: true,
				subsValid,
			});
			const updated = res.data.user;
			setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
			if (selectedUser?._id === userId) setSelectedUser(updated);
		} catch {
			alert("Failed to activate user");
		} finally {
			setActionLoading((prev) => ({ ...prev, [userId]: null }));
			setSubModal(null);
		}
	};

	const handleReject = async (userId) => {
		setActionLoading((prev) => ({ ...prev, [userId]: "rejecting" }));
		try {
			const res = await api.put(API_ENDPOINTS.USER_STATUS(userId), {
				isActive: false,
			});
			const updated = res.data.user;
			setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
			if (selectedUser?._id === userId) setSelectedUser(updated);
		} catch {
			alert("Failed to deactivate user");
		} finally {
			setActionLoading((prev) => ({ ...prev, [userId]: null }));
		}
	};

	const handleResetPassword = async (userId, newPassword) => {
		setActionLoading((prev) => ({ ...prev, [userId]: "resetting" }));
		try {
			await api.put(API_ENDPOINTS.USER_STATUS(userId), {
				password: newPassword,
			});
			return true;
		} catch {
			return false;
		} finally {
			setActionLoading((prev) => ({ ...prev, [userId]: null }));
		}
	};

	const filtered = users.filter((u) => {
		const matchSearch =
			u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			u.email?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchStatus =
			filterStatus === "all" ||
			(filterStatus === "active" && u.isActive) ||
			(filterStatus === "inactive" && !u.isActive);
		return matchSearch && matchStatus;
	});

	const inactiveCount = users.filter((u) => !u.isActive).length;

	return (
		<>
			<div className="space-y-5">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
							Manage Users
						</h1>
						<p className="text-sm text-zinc-500 mt-0.5">
							{users.length} total users
							{inactiveCount > 0 && (
								<span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">
									{inactiveCount} inactive
								</span>
							)}
						</p>
					</div>
					<div className="flex gap-2">
						<Link
							to="/create-user"
							className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
							<FiPlusCircle size={14} /> Create User
						</Link>
						<button
							onClick={fetchUsers}
							className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
							<FiRefreshCw size={14} /> Refresh
						</button>
					</div>
				</div>

				{/* Filters */}
				<div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-3">
					<div className="relative flex-1">
						<FiSearch
							className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
							size={14}
						/>
						<input
							type="text"
							placeholder="Search by name or email..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-9 pr-4 py-2 bg-zinc-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
						/>
					</div>
					<div className="flex gap-1.5">
						{["all", "active", "inactive"].map((s) => (
							<button
								key={s}
								onClick={() => setFilterStatus(s)}
								className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
									filterStatus === s
										? "bg-indigo-600 text-white"
										: "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
								}`}>
								{s}
							</button>
						))}
					</div>
				</div>

				{/* Content */}
				{loading ? (
					<div className="flex flex-col items-center justify-center py-20">
						<div className="w-8 h-8 border-2 border-zinc-200 border-t-indigo-600 rounded-full animate-spin" />
						<p className="mt-4 text-xs text-zinc-400 uppercase tracking-widest">
							Loading
						</p>
					</div>
				) : error ? (
					<div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center text-red-600 text-sm">
						{error}
					</div>
				) : filtered.length === 0 ? (
					<div className="bg-white py-16 rounded-2xl border-2 border-dashed border-zinc-100 text-center">
						<FiUser className="mx-auto text-zinc-300 mb-3" size={32} />
						<p className="text-zinc-400 text-sm">No users found</p>
					</div>
				) : (
					<div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
						{/* Desktop table */}
						<div className="hidden md:block overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="bg-zinc-50 border-b border-zinc-200">
									<tr>
										{[
											"User",
											"Phone",
											"Role",
											"Status",
											"Joined",
											"Sub. Valid",
											"Actions",
										].map((h) => (
											<th
												key={h}
												className={`px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide ${h === "Actions" ? "text-center" : ""}`}>
												{h}
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-zinc-100">
									{filtered.map((u) => (
										<tr
											key={u._id}
											onClick={() => setSelectedUser(u)}
											className="hover:bg-zinc-50 transition-colors cursor-pointer">
											<td className="px-5 py-3.5">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm shrink-0">
														{(u.name || u.email || "?")[0].toUpperCase()}
													</div>
													<div>
														<p className="font-medium text-zinc-900">
															{u.name || "—"}
														</p>
														<p className="text-xs text-zinc-400">{u.email}</p>
													</div>
												</div>
											</td>
											<td className="px-5 py-3.5 text-zinc-600">
												{u.phone || "—"}
											</td>
											<td className="px-5 py-3.5">
												<span
													className={`px-2 py-0.5 rounded-md text-xs font-medium ${ROLE_COLORS[u.role] || "bg-zinc-100 text-zinc-600"}`}>
													{u.role || "—"}
												</span>
											</td>
											<td className="px-5 py-3.5">
												<span
													className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusStyle(u.isActive)}`}>
													{getStatusLabel(u.isActive)}
												</span>
											</td>
											<td className="px-5 py-3.5 text-zinc-500 text-xs">
												{u.createdAt
													? new Date(u.createdAt).toLocaleDateString("en-IN", {
															day: "numeric",
															month: "short",
															year: "numeric",
														})
													: "—"}
											</td>
											<td className="px-5 py-3.5">
												{u.subsValid ? (
													<span
														className={`text-xs font-medium ${new Date(u.subsValid) < new Date() ? "text-red-500" : "text-emerald-600"}`}>
														{new Date(u.subsValid).toLocaleDateString("en-IN", {
															day: "numeric",
															month: "short",
															year: "numeric",
														})}
													</span>
												) : (
													<span className="text-xs text-zinc-400">—</span>
												)}
											</td>
											<td
												className="px-5 py-3.5"
												onClick={(e) => e.stopPropagation()}>
												{u.role !== "admin" && (
													<ActionButtons
														user={u}
														loading={actionLoading[u._id]}
														onApprove={() => setSubModal(u._id)}
														onReject={() => handleReject(u._id)}
													/>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile cards */}
						<div className="md:hidden divide-y divide-zinc-100">
							{filtered.map((u) => (
								<div
									key={u._id}
									onClick={() => setSelectedUser(u)}
									className="p-4 space-y-3 cursor-pointer hover:bg-zinc-50 transition-colors">
									<div className="flex items-center gap-3">
										<div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold shrink-0">
											{(u.name || u.email || "?")[0].toUpperCase()}
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-zinc-900 truncate">
												{u.name || "—"}
											</p>
											<p className="text-xs text-zinc-500 truncate">
												{u.email}
											</p>
										</div>
										<span
											className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(u.isActive)}`}>
											{getStatusLabel(u.isActive)}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span
											className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] || "bg-zinc-100 text-zinc-600"}`}>
											{u.role || "—"}
										</span>
										<ActionButtons
											user={u}
											loading={actionLoading[u._id]}
											onApprove={() => setSubModal(u._id)}
											onReject={() => handleReject(u._id)}
										/>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* User Detail Modal */}
			<AnimatePresence>
				{selectedUser && (
					<UserModal
						user={selectedUser}
						onClose={() => setSelectedUser(null)}
						onApprove={(id) => setSubModal(id)}
						onReject={(id) => handleReject(id)}
						onResetPassword={handleResetPassword}
						actionLoading={actionLoading[selectedUser._id]}
					/>
				)}
			</AnimatePresence>

			{/* Subscription Modal */}
			<AnimatePresence>
				{subModal && (
					<SubscriptionModal
						onConfirm={(subsStart, subsDays) =>
							handleApprove(subModal, subsStart, subsDays)
						}
						onCancel={() => setSubModal(null)}
						loading={!!actionLoading[subModal]}
					/>
				)}
			</AnimatePresence>
		</>
	);
};

const ActionButtons = ({ user, loading, onApprove, onReject }) => {
	if (loading)
		return (
			<div className="flex justify-center">
				<FiLoader className="animate-spin text-zinc-400" size={15} />
			</div>
		);
	if (user.isActive)
		return (
			<div className="flex justify-center">
				<button
					onClick={onReject}
					className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors">
					<FiX size={11} /> Deactivate
				</button>
			</div>
		);
	return (
		<div className="flex justify-center">
			<button
				onClick={onApprove}
				className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors">
				<FiCheck size={11} /> Activate
			</button>
		</div>
	);
};

const SubscriptionModal = ({ onConfirm, onCancel, loading }) => {
	const today = new Date().toISOString().split("T")[0];
	const [subsStart, setSubsStart] = useState(today);
	const [subsDays, setSubsDays] = useState(30);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			onClick={onCancel}
			className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 12 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 12 }}
				transition={{ duration: 0.18 }}
				onClick={(e) => e.stopPropagation()}
				className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
				<div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
					<h2 className="text-base font-semibold text-zinc-900">
						Set Subscription
					</h2>
					<button
						onClick={onCancel}
						className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors">
						<FiX size={16} />
					</button>
				</div>
				<div className="px-5 py-4 space-y-4">
					<div>
						<label className={labelCls}>Start Date</label>
						<input
							type="date"
							value={subsStart}
							onChange={(e) => setSubsStart(e.target.value)}
							className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
						/>
					</div>
					<div>
						<label className={labelCls}>Duration</label>
						<div className="flex gap-2 flex-wrap mb-2">
							{[7, 30, 90, 180, 365].map((d) => (
								<button
									key={d}
									type="button"
									onClick={() => setSubsDays(d)}
									className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${subsDays === d ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
									{d}d
								</button>
							))}
						</div>
						<input
							type="number"
							min={1}
							value={subsDays}
							onChange={(e) => setSubsDays(Number(e.target.value))}
							className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
							placeholder="Custom days"
						/>
					</div>
					{subsStart && subsDays > 0 && (
						<div className="p-3 bg-indigo-50 rounded-xl text-sm text-indigo-700">
							Valid until:{" "}
							<span className="font-semibold">
								{new Date(
									new Date(subsStart).getTime() + subsDays * 86400000,
								).toLocaleDateString("en-IN", {
									day: "numeric",
									month: "long",
									year: "numeric",
								})}
							</span>
						</div>
					)}
				</div>
				<div className="px-5 pb-5 flex gap-3">
					<button
						onClick={onCancel}
						className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-sm font-medium transition-colors">
						Cancel
					</button>
					<button
						onClick={() => onConfirm(subsStart, subsDays)}
						disabled={loading || !subsStart || subsDays < 1}
						className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
						{loading ? (
							<FiLoader className="animate-spin" size={15} />
						) : (
							<>
								<FiCheck size={13} /> Activate
							</>
						)}
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default ManageUsers;

const UserModal = ({
	user,
	onClose,
	onApprove,
	onReject,
	onResetPassword,
	actionLoading,
}) => {
	const [showReset, setShowReset] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [resetLoading, setResetLoading] = useState(false);
	const [resetMsg, setResetMsg] = useState(null);

	const handleReset = async () => {
		if (!newPassword) return;
		setResetLoading(true);
		const ok = await onResetPassword(user._id, newPassword);
		setResetMsg(
			ok ? "Password reset successfully" : "Failed to reset password",
		);
		if (ok) {
			setNewPassword("");
			setShowReset(false);
		}
		setResetLoading(false);
		setTimeout(() => setResetMsg(null), 3000);
	};

	const info = [
		{ label: "Email", icon: <FiMail size={14} />, value: user.email },
		{ label: "Phone", icon: <FiPhone size={14} />, value: user.phone || "—" },
		{
			label: "GST No.",
			icon: <FiShield size={14} />,
			value: user.gstNumber || user.gstin || "—",
		},
		{
			label: "Joined",
			icon: <FiUser size={14} />,
			value: user.createdAt
				? new Date(user.createdAt).toLocaleDateString("en-IN", {
						day: "numeric",
						month: "long",
						year: "numeric",
					})
				: "—",
		},
		{
			label: "Sub. Valid Until",
			icon: <FiShield size={14} />,
			value: user.subsValid
				? new Date(user.subsValid).toLocaleDateString("en-IN", {
						day: "numeric",
						month: "long",
						year: "numeric",
					})
				: "—",
			expired: user.subsValid && new Date(user.subsValid) < new Date(),
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			onClick={onClose}
			className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 16 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: 16 }}
				transition={{ duration: 0.2 }}
				onClick={(e) => e.stopPropagation()}
				className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
					<h2 className="text-base font-semibold text-zinc-900">
						User Details
					</h2>
					<button
						onClick={onClose}
						className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors">
						<FiX size={16} />
					</button>
				</div>

				{/* Avatar */}
				<div className="px-5 pt-5 pb-4 flex items-center gap-4">
					<div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-lg shrink-0">
						{(user.name || user.email || "?")[0].toUpperCase()}
					</div>
					<div>
						<p className="font-semibold text-zinc-900">{user.name || "—"}</p>
						<div className="flex items-center gap-2 mt-1">
							<span
								className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] || "bg-zinc-100 text-zinc-600"}`}>
								{user.role || "—"}
							</span>
							<span
								className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(user.isActive)}`}>
								{getStatusLabel(user.isActive)}
							</span>
						</div>
					</div>
				</div>

				{/* Info rows */}
				<div className="px-5 pb-4 space-y-2">
					{info.map(({ label, icon, value, expired }) => (
						<div
							key={label}
							className={`flex items-center gap-3 p-3 rounded-xl ${expired ? "bg-red-50" : "bg-zinc-50"}`}>
							<span
								className={`shrink-0 ${expired ? "text-red-400" : "text-zinc-400"}`}>
								{icon}
							</span>
							<div className="min-w-0">
								<p className="text-xs text-zinc-400 mb-0.5">{label}</p>
								<p
									className={`text-sm font-medium truncate ${expired ? "text-red-600" : "text-zinc-800"}`}>
									{value}
									{expired && (
										<span className="ml-2 text-xs text-red-400">Expired</span>
									)}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Files */}
				{user.files?.length > 0 && (
					<div className="px-5 pb-4">
						<div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
							<FiShield size={14} className="text-indigo-400 shrink-0" />
							<div>
								<p className="text-xs text-indigo-400 mb-0.5">Files</p>
								<p className="text-sm font-medium text-indigo-700">
									{user.files.length} file{user.files.length !== 1 ? "s" : ""}{" "}
									uploaded
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Reset password */}
				{user.role !== "admin" && (
					<div className="px-5 pb-4 border-t border-zinc-100 pt-4">
						{resetMsg && (
							<p className="text-xs text-emerald-600 mb-2">{resetMsg}</p>
						)}
						{!showReset ? (
							<button
								onClick={() => setShowReset(true)}
								className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-xl text-sm font-medium transition-colors">
								<FiLock size={13} /> Reset Password
							</button>
						) : (
							<div className="flex gap-2">
								<input
									type="text"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder="New password"
									className="flex-1 px-3 py-2 border border-zinc-200 rounded-xl text-sm outline-none focus:border-indigo-400"
								/>
								<button
									onClick={handleReset}
									disabled={resetLoading || !newPassword}
									className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium disabled:opacity-50">
									{resetLoading ? "…" : "Set"}
								</button>
								<button
									onClick={() => setShowReset(false)}
									className="p-2 text-zinc-400 hover:text-zinc-600">
									<FiX size={15} />
								</button>
							</div>
						)}
					</div>
				)}

				{/* Activate / Deactivate */}
				{user.role !== "admin" && (
					<div className="px-5 pb-5 flex gap-3">
						{actionLoading ? (
							<div className="flex-1 flex justify-center py-2">
								<FiLoader className="animate-spin text-zinc-400" size={18} />
							</div>
						) : user.isActive ? (
							<button
								onClick={() => onReject(user._id)}
								className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors">
								<FiX size={13} /> Deactivate
							</button>
						) : (
							<button
								onClick={() => onApprove(user._id)}
								className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors">
								<FiCheck size={13} /> Activate
							</button>
						)}
					</div>
				)}
			</motion.div>
		</motion.div>
	);
};
