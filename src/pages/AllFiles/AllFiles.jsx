import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
	FaFileAlt,
	FaFileArchive,
	FaFileAudio,
	FaFileCode,
	FaFileExcel,
	FaFileImage,
	FaFilePdf,
	FaFileVideo,
	FaFileWord,
} from "react-icons/fa";
import {
	FiAlertCircle,
	FiChevronRight,
	FiFile,
	FiGrid,
	FiList,
	FiSearch,
	FiUploadCloud,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { API_ENDPOINTS } from "../../api/endpoints";
import { useAuth } from "../../contexts/AuthContext";

const EXT_CONFIG = {
	pdf: {
		icon: FaFilePdf,
		color: "text-rose-500",
		bg: "bg-rose-50",
		ring: "ring-rose-100",
	},
	json: {
		icon: FaFileCode,
		color: "text-amber-500",
		bg: "bg-amber-50",
		ring: "ring-amber-100",
	},
	doc: {
		icon: FaFileWord,
		color: "text-blue-500",
		bg: "bg-blue-50",
		ring: "ring-blue-100",
	},
	docx: {
		icon: FaFileWord,
		color: "text-blue-500",
		bg: "bg-blue-50",
		ring: "ring-blue-100",
	},
	xls: {
		icon: FaFileExcel,
		color: "text-emerald-500",
		bg: "bg-emerald-50",
		ring: "ring-emerald-100",
	},
	xlsx: {
		icon: FaFileExcel,
		color: "text-emerald-500",
		bg: "bg-emerald-50",
		ring: "ring-emerald-100",
	},
	jpg: {
		icon: FaFileImage,
		color: "text-purple-500",
		bg: "bg-purple-50",
		ring: "ring-purple-100",
	},
	png: {
		icon: FaFileImage,
		color: "text-purple-500",
		bg: "bg-purple-50",
		ring: "ring-purple-100",
	},
	mp4: {
		icon: FaFileVideo,
		color: "text-pink-500",
		bg: "bg-pink-50",
		ring: "ring-pink-100",
	},
	mp3: {
		icon: FaFileAudio,
		color: "text-indigo-500",
		bg: "bg-indigo-50",
		ring: "ring-indigo-100",
	},
	zip: {
		icon: FaFileArchive,
		color: "text-orange-500",
		bg: "bg-orange-50",
		ring: "ring-orange-100",
	},
};
const DEFAULT_CFG = {
	icon: FaFileAlt,
	color: "text-zinc-400",
	bg: "bg-zinc-50",
	ring: "ring-zinc-100",
};

const getExt = (name) => name.split(".").pop().toLowerCase();
const getCfg = (name) => EXT_CONFIG[getExt(name)] || DEFAULT_CFG;

const FileIcon = ({ name, size = "text-2xl" }) => {
	const cfg = getCfg(name);
	const Icon = cfg.icon;
	return (
		<div
			className={`${cfg.bg} ring-1 ${cfg.ring} p-3 rounded-2xl flex items-center justify-center`}>
			<Icon className={`${size} ${cfg.color}`} />
		</div>
	);
};

const formatSize = (bytes) => {
	if (!bytes) return "—";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (d) =>
	new Date(d).toLocaleDateString("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});

// ─── Main Component ───────────────────────────────────────────────────────────
const FileList = () => {
	const { user, refreshUser } = useAuth();
	const isAdmin = user?.role === "admin";
	const navigate = useNavigate();

	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [viewMode, setViewMode] = useState("grid");
	const [sortBy, setSortBy] = useState("name");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState(null);

	const fetchFiles = async () => {
		// Files are already synced via user state in AuthContext
		// We only need this if we want to manually trigger a refresh
		setLoading(false);
	};

	useEffect(() => {
		if (user?.files) {
			setFiles(
				user.files.map((f) => ({
					id: f._id,
					name: f.originalname || f.filename,
					realName: f.filename,
					size: f.size,
					modified: f.createdAt,
					type: getExt(f.originalname || f.filename),
				})),
			);
		}
		setLoading(false);
	}, [user]);

	useEffect(() => {
		fetchFiles();
	}, []);

	const handleFileUpload = async (e) => {
		const selectedFile = e.target.files?.[0];
		if (!selectedFile) return;
		if (!selectedFile.name.toLowerCase().endsWith(".json")) {
			setUploadError("Only JSON files are allowed");
			return;
		}
		const formData = new FormData();
		formData.append("file", selectedFile);
		try {
			setUploading(true);
			setUploadError(null);
			const res = await api.post(API_ENDPOINTS.FILE_UPLOAD, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			const newFileId = res.data.fileId || res.data.data._id;
			navigate(`/file/${encodeURIComponent(newFileId)}`);
		} catch {
			setUploadError("Upload failed. Please try again.");
		} finally {
			setUploading(false);
		}
	};

	const categories = useMemo(
		() => ["all", ...new Set(files.map((f) => f.type))],
		[files],
	);

	const filteredFiles = useMemo(() => {
		let r = [...files];
		if (searchTerm)
			r = r.filter((f) =>
				f.name.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		if (selectedCategory !== "all")
			r = r.filter((f) => f.type === selectedCategory);
		r.sort((a, b) => {
			if (sortBy === "name") return a.name.localeCompare(b.name);
			if (sortBy === "type") return a.type.localeCompare(b.type);
			if (sortBy === "size") return b.size - a.size;
			return 0;
		});
		return r;
	}, [files, searchTerm, selectedCategory, sortBy]);

	// ── Loading ──
	if (loading)
		return (
			<div className="flex flex-col items-center justify-center py-32">
				<div className="w-10 h-10 border-2 border-zinc-200 border-t-indigo-600 rounded-full animate-spin" />
				<p className="mt-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
					Loading files
				</p>
			</div>
		);

	// ── Error ──
	if (error)
		return (
			<div className="flex flex-col items-center justify-center py-32 gap-3">
				<FiAlertCircle className="text-red-400 text-4xl" />
				<p className="text-zinc-600 font-medium">{error}</p>
			</div>
		);

	return (
		<div className=" mx-auto px-4 sm:px-4 lg:px-4 py-4 space-y-4">
			{/* ── Main Explorer ── */}
			<div className="">
				{/* Toolbar */}
				<div className=" border-b border-zinc-100 space-y-4">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
						<div>
							<h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
								{isAdmin ? "Enterprise File Hub" : "My Workspace"}
							</h1>
						</div>

						<div className="flex items-center gap-3">
							<label
								className={`cursor-pointer ${uploading ? "pointer-events-none" : ""}`}>
								<input
									type="file"
									accept=".json"
									onChange={handleFileUpload}
									className="hidden"
								/>
								<div
									className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-white shadow-xl transition-all active:scale-95
									${uploading ? "bg-zinc-300" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"}`}>
									<FiUploadCloud size={16} />
									{uploading ? "Uploading..." : "Upload JSON"}
								</div>
							</label>

							<div className="flex bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100">
								<button
									onClick={() => setViewMode("grid")}
									className={`p-2.5 rounded-xl transition-all ${
										viewMode === "grid"
											? "bg-white text-indigo-600 shadow-sm"
											: "text-zinc-400 hover:text-zinc-600"
									}`}>
									<FiGrid size={18} />
								</button>
								<button
									onClick={() => setViewMode("list")}
									className={`p-2.5 rounded-xl transition-all ${
										viewMode === "list"
											? "bg-white text-indigo-600 shadow-sm"
											: "text-zinc-400 hover:text-zinc-600"
									}`}>
									<FiList size={18} />
								</button>
							</div>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-4">
						<label className="relative flex-1">
							<FiSearch
								className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
								size={18}
							/>
							<input
								type="text"
								placeholder="Search files by name..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-12 pr-6 py-3.5 bg-zinc-50 border  rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 transition-all"
							/>
						</label>

						<div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
							{categories.map((cat) => (
								<button
									key={cat}
									onClick={() => setSelectedCategory(cat)}
									className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
										selectedCategory === cat
											? "bg-zinc-900 text-white shadow-xl shadow-zinc-200"
											: "bg-zinc-50 text-zinc-400 border border-transparent hover:bg-zinc-100"
									}`}>
									{cat}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* ── Content ── */}
				<div className="p-4 bg-zinc-50/30">
					{/* Upload error */}
					<AnimatePresence>
						{uploadError && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0 }}
								className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold">
								<FiAlertCircle size={18} /> {uploadError}
							</motion.div>
						)}
					</AnimatePresence>

					{loading ? (
						<div className="flex flex-col items-center justify-center py-20 gap-4">
							<div className="w-12 h-12 border-4 border-zinc-100 border-t-indigo-600 rounded-full animate-spin" />
							<p className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">
								Fetching Files...
							</p>
						</div>
					) : filteredFiles.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-32 text-center">
							<div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-300 mb-6">
								<FiFile size={32} />
							</div>
							<h3 className="text-lg font-bold text-zinc-900">
								No files found
							</h3>
							<p className="text-sm font-medium text-zinc-400 mt-1 uppercase tracking-wider">
								Try a different search or upload a new JSON
							</p>
						</div>
					) : viewMode === "grid" ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
							{filteredFiles.map((file, idx) => (
								<motion.div
									layout
									key={file.id}
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: idx * 0.03 }}
									onClick={() => navigate(`/file/${file.id}`)}
									className="group bg-white p-5 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden">
									{/* Subtle background icon */}
									<div className="absolute -right-4 -bottom-4 text-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity">
										<FiFile size={100} />
									</div>

									<div className="relative z-10 flex flex-col items-start h-full">
										<FileIcon name={file.name} />

										<h3 className="font-semibold text-zinc-900 mt-6 mb-2 truncate group-hover:text-indigo-600 transition-colors w-full">
											{file.name}
										</h3>

										<div className="flex items-center justify-between mt-auto pt-6 w-full">
											<div className="space-y-1">
												<p className="text-[10px] font-semibold text-zinc-300 uppercase tracking-widest">
													Size
												</p>
												<p className="text-[10px] font-medium text-zinc-500">
													{formatSize(file.size)}
												</p>
											</div>
											<div className="space-y-1 text-right">
												<p className="text-[10px] font-semibold text-zinc-300 uppercase tracking-widest">
													Modified
												</p>
												<p className="text-[10px] font-medium text-zinc-500">
													{formatDate(file.modified)}
												</p>
											</div>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					) : (
						<div className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden">
							<div className="overflow-x-auto">
								<table className="w-full text-left">
									<thead className="bg-zinc-50/50 border-b border-zinc-100">
										<tr>
											<th className="px-8 py-5 text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.2em]">
												File Name
											</th>
											<th className="px-8 py-5 text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.2em]">
												Size
											</th>
											<th className="px-8 py-5 text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.2em]">
												Last Modified
											</th>
											<th className="px-8 py-5 text-center text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.2em]">
												Action
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-zinc-50">
										{filteredFiles.map((file) => (
											<tr
												key={file.id}
												onClick={() => navigate(`/file/${file.id}`)}
												className="hover:bg-zinc-50/80 transition-colors cursor-pointer group">
												<td className="px-8 py-4">
													<div className="flex items-center gap-4">
														<FileIcon name={file.name} size="text-lg" />
														<span className="text-sm font-semibold text-zinc-700 group-hover:text-indigo-600 transition-colors">
															{file.name}
														</span>
													</div>
												</td>
												<td className="px-8 py-4 text-[10px] font-medium text-zinc-500 uppercase">
													{formatSize(file.size)}
												</td>
												<td className="px-8 py-4 text-[10px] font-medium text-zinc-500 uppercase">
													{formatDate(file.modified)}
												</td>
												<td className="px-8 py-4 text-center">
													<FiChevronRight
														className="inline-block text-zinc-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-0.5"
														size={18}
													/>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default FileList;
