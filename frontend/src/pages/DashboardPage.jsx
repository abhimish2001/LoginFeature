import React from 'react';
import { useAuth } from '../App';

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          {/* Welcome Banner */}
          <div className="p-4 mb-4 bg-primary text-white rounded-4 shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <h4 className="fw-bold mb-1">
                Welcome, {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}!
              </h4>
              <p className="mb-0 small opacity-75">You are signed in to your account.</p>
            </div>
            <button onClick={logout} className="btn btn-outline-light btn-sm px-3 py-2 d-flex align-items-center gap-1">
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>

          {/* User Details Card */}
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-person-badge-fill text-primary"></i> Account Details
              </h5>
            </div>
            <div className="card-body px-4 pb-4">
              <ul className="list-group list-group-flush">
                <li className="list-group-item px-0 d-flex justify-content-between align-items-center">
                  <span className="text-muted">Email</span>
                  <span className="fw-semibold">{user?.email}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between align-items-center">
                  <span className="text-muted">First Name</span>
                  <span className="fw-semibold">{user?.firstName || '—'}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between align-items-center">
                  <span className="text-muted">Last Name</span>
                  <span className="fw-semibold">{user?.lastName || '—'}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between align-items-center">
                  <span className="text-muted">Role</span>
                  <span className="badge bg-info text-dark">{user?.role || 'User'}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between align-items-center">
                  <span className="text-muted">Status</span>
                  <span className="badge bg-success">
                    <i className="bi bi-check-circle-fill me-1"></i> Active
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
