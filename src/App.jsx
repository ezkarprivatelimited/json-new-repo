import {
	Navigate,
	Outlet,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import AllFiles from "./pages/AllFiles/AllFiles.jsx";
import CreateUser from "./pages/CreateUser/CreateUser.jsx";
import FileDetails from "./pages/FileDetails/FileDetails.jsx";
import Login from "./pages/Login/Login.jsx";
import ManageUsers from "./pages/ManageUsers/ManageUsers.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Signup from "./pages/Signup/Signup.jsx";

const App = () => {
	return (
		<AuthProvider>
			<Toaster position="top-center" reverseOrder={false} />
			<Router>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />

					<Route
						element={
							<ProtectedRoute>
								<Layout>
									<Outlet />
								</Layout>
							</ProtectedRoute>
						}>
						<Route path="/" element={<AllFiles />} />
						<Route path="/files" element={<AllFiles />} />
						<Route path="/file/:fileId" element={<FileDetails />} />
						<Route path="/profile" element={<Profile />} />
						<Route
							path="/manage-users"
							element={
								<ProtectedRoute allowedRoles={["admin"]}>
									<ManageUsers />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/create-user"
							element={
								<ProtectedRoute allowedRoles={["admin"]}>
									<CreateUser />
								</ProtectedRoute>
							}
						/>
					</Route>

					{/* Catch all route */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Router>
		</AuthProvider>
	);
};

export default App;
