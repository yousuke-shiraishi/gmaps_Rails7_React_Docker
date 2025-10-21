import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Container } from '@mui/material';
import { useNavigate, Navigate } from 'react-router-dom';
import { selectIsLoginView, logout, setFalseMode } from './features/login/loginSlice';
import type { AppDispatch } from './features/login/store';

const Logout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsLoginView);
  const navigate = useNavigate();

  const onLogout = async () => {
    await dispatch(logout());
    dispatch(setFalseMode());
    navigate('/');
  };

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 4 }}>
      <Button variant="contained" onClick={onLogout}>
        Logout
      </Button>
    </Container>
  );
};

export default Logout;
