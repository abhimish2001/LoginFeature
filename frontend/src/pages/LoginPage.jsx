import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { api } from '../api';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaData, setCaptchaData] = useState({ captchaId: '', captchaImage: '' });
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const captchaInputRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    loadCaptcha();
  }, []);

  const loadCaptcha = async () => {
    setCaptchaLoading(true);
    setCaptchaCode('');
    try {
      const data = await api.getCaptcha();
      if (data) {
        setCaptchaData(data);
      }
    } catch {
      setError('Unable to load security verification. Please refresh.');
    } finally {
      setCaptchaLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (!captchaCode.trim()) {
      setError('Please enter the security verification code.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(
        email.trim(),
        password,
        captchaData.captchaId,
        captchaCode.trim()
      );

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
        loadCaptcha();
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || 'Unable to connect to server. Please try again.');
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4 p-sm-5">
              <div className="text-center mb-4">
                <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  <i className="bi bi-shield-lock fs-2"></i>
                </div>
                <h3 className="fw-bold">Sign In</h3>
                <p className="text-muted small">Enter your email, password, and security code</p>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                  <div className="small">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Email Field */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-envelope text-secondary"></i>
                    </span>
                    <input
                      type="email"
                      id="email"
                      className="form-control border-start-0 ps-0"
                      placeholder="e.g. admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-semibold">
                    Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-key text-secondary"></i>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="form-control border-start-0 border-end-0 px-0"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary border-start-0 bg-light"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* CAPTCHA Field */}
                <div className="mb-4">
                  <label htmlFor="captchaCode" className="form-label fw-semibold d-flex justify-content-between align-items-center">
                    <span>Security Verification</span>
                    <span className="small text-muted fw-normal">Case-insensitive</span>
                  </label>

                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div
                      className="border rounded-2 bg-light p-1 d-flex align-items-center justify-content-center"
                      style={{ minWidth: '150px', height: '47px' }}
                    >
                      {captchaLoading ? (
                        <div className="spinner-border spinner-border-sm text-secondary" role="status">
                          <span className="visually-hidden">Loading captcha...</span>
                        </div>
                      ) : captchaData.captchaImage ? (
                        <img
                          src={captchaData.captchaImage}
                          alt="Security CAPTCHA"
                          style={{ height: '40px', width: '140px', objectFit: 'contain' }}
                        />
                      ) : (
                        <span className="text-muted small">Unavailable</span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm h-100 py-2 px-3"
                      onClick={loadCaptcha}
                      disabled={captchaLoading || loading}
                      title="Load new code"
                    >
                      <i className={`bi bi-arrow-clockwise ${captchaLoading ? 'spin' : ''}`}></i>
                    </button>
                  </div>

                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-shield-check text-secondary"></i>
                    </span>
                    <input
                      type="text"
                      id="captchaCode"
                      ref={captchaInputRef}
                      className="form-control border-start-0 ps-0 text-uppercase fw-semibold"
                      placeholder="Enter the code shown above"
                      value={captchaCode}
                      onChange={(e) => setCaptchaCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      disabled={loading}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold shadow-sm mb-3"
                  disabled={loading || captchaLoading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Verifying & Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
