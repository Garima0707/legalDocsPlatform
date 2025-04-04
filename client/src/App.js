import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

// Component imports
import HomePage from "./HomePage";
import Header from "./components/Header";
import RegisterModal from "./components/RegisterModal";
import CreateDocument from "./components/CreateDocument";
import EditDocument from "./components/EditDocument";
import DocumentList from "./components/DocumentList";
import GenerateInviteCodes from './components/GenerateInviteCodes';
import EditorPage from "./components/EditorPage";

// Error Boundary Component
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught in boundary:', error);
        console.error('Component stack:', errorInfo.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded">
                    <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
                    <pre className="text-sm text-red-600 whitespace-pre-wrap">
                        {this.state.error.toString()}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

// Protected Route Component
const ProtectedRoute = ({ component: Component, isAuthenticated, loginWithRedirect, ...props }) => {
    useEffect(() => {
        if (!isAuthenticated) {
            loginWithRedirect();
        }
    }, [isAuthenticated, loginWithRedirect]);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Component {...props} />;
};

// Main App Component
function App() {
    const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
    const [username, setUsername] = useState("");
    const [registerOpen, setRegisterOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user?.name) {
            setUsername(user.name);
        }
    }, [isAuthenticated, user]);

    const handleLogout = () => {
        logout({ returnTo: window.location.origin });
        localStorage.clear();
    };

    return (
        <ErrorBoundary>
            <Router>
                <div className="min-h-screen">
                    <Header
                        isLoggedIn={isAuthenticated}
                        username={username}
                        onLoginClick={loginWithRedirect}
                        onRegisterClick={() => setRegisterOpen(true)}
                        onLogout={handleLogout}
                    />
                    <main className="container mx-auto px-4">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route 
                                path="/createDocument" 
                                element={
                                    <ErrorBoundary>
                                        <ProtectedRoute 
                                            component={CreateDocument}
                                            isAuthenticated={isAuthenticated}
                                            loginWithRedirect={loginWithRedirect}
                                        />
                                    </ErrorBoundary>
                                } 
                            />
                            <Route 
                                path="/editDocument/:documentId" 
                                element={
                                    <ErrorBoundary>
                                        <ProtectedRoute 
                                            component={EditDocument}
                                            isAuthenticated={isAuthenticated}
                                            loginWithRedirect={loginWithRedirect}
                                        />
                                    </ErrorBoundary>
                                } 
                            />
                            <Route 
                                path="/EditorPage/:documentId" 
                                element={
                                    <ErrorBoundary>
                                        <ProtectedRoute 
                                            component={EditorPage}
                                            isAuthenticated={isAuthenticated}
                                            loginWithRedirect={loginWithRedirect}
                                        />
                                    </ErrorBoundary>
                                } 
                            />
                            <Route 
                                path="/documents" 
                                element={
                                    <ErrorBoundary>
                                        <ProtectedRoute 
                                            component={DocumentList}
                                            isAuthenticated={isAuthenticated}
                                            loginWithRedirect={loginWithRedirect}
                                        />
                                    </ErrorBoundary>
                                } 
                            />
                            <Route 
                                path="/documents/:documentId/invite" 
                                element={
                                    <ErrorBoundary>
                                        <ProtectedRoute 
                                            component={GenerateInviteCodes}
                                            isAuthenticated={isAuthenticated}
                                            loginWithRedirect={loginWithRedirect}
                                        />
                                    </ErrorBoundary>
                                } 
                            />
                        </Routes>
                    </main>
                    {registerOpen && (
                        <RegisterModal
                            isOpen={registerOpen}
                            onClose={() => setRegisterOpen(false)}
                        />
                    )}
                </div>
            </Router>
        </ErrorBoundary>
    );
}

export default App;