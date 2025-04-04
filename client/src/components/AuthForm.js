import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import './AuthForm.css';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className={`auth-container ${isLogin ? 'login-mode' : 'signup-mode'}`}>
      <div className="form-container">
        {isLogin ? <Login /> : <Signup />}
      </div>

      <div className="overlay">
        <div className="overlay-content">
          <h2>{isLogin ? "Hello, Friend!" : "Welcome Back!"}</h2>
          <p>{isLogin ? "Don't have an account? Sign up here!" : "Already have an account? Log in here!"}</p>
          <button onClick={toggleForm}>
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
