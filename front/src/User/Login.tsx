import React from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import type { AppDispatch } from './features/login/store';
import { fetchAsyncLogin, fetchAsyncShowUserData } from './features/login/loginSlice';
import type { LoginParams } from '../components/interface/LoginParams';

import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginParams>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginParams) => {
    const res = await dispatch(fetchAsyncLogin(data));
    if (fetchAsyncLogin.fulfilled.match(res)) {
      await dispatch(fetchAsyncShowUserData());
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          ログイン
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
          <Typography variant="body2">メールアドレス</Typography>
          <TextField
            fullWidth
            margin="dense"
            type="email"
            {...register('email', { required: true })}
            error={!!errors.email}
            helperText={errors.email && 'メールアドレスを入力してください'}
          />

          <Typography variant="body2" sx={{ mt: 2 }}>
            パスワード
          </Typography>
          <TextField
            fullWidth
            margin="dense"
            type="password"
            {...register('password', {
              required: 'パスワードを指定する必要があります',
              minLength: { value: 8, message: 'パスワードは少なくとも８文字以上です' },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, mb: 2 }} disabled={isSubmitting}>
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
