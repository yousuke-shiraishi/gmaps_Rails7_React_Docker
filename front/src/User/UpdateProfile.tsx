import React from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Profile } from '../components/interface/Profile';

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

import { selectProfile, fetchAsyncUpdate } from './features/login/loginSlice';
import type { AppDispatch } from './features/login/store'; // ★ store から型を輸入

const UpdateProfile: React.FC = () => {
  const profile = useSelector(selectProfile, shallowEqual);

  // ★ dispatch に AppDispatch を付ける（UnknownAction 問題を解消）
  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Profile>();

  const onSubmit: SubmitHandler<Profile> = async (data) => {
    await dispatch(fetchAsyncUpdate(data));
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      {/* 現在の登録データ */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle1">現在の登録データ</Typography>
        <Typography variant="body2">ユーザー名：{profile.username}</Typography>
        <Typography variant="body2">メール：{profile.email}</Typography>
        <Typography variant="body2">誕生日：{profile.birth}</Typography>
      </Box>

      {/* ヘッダ */}
      <Box
        sx={{
          mt: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          データを更新
        </Typography>
      </Box>

      {/* フォーム */}
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{ mt: 2 }}
      >
        <Typography variant="body2">ユーザー名</Typography>
        <TextField
          fullWidth
          margin="dense"
          type="text"
          {...register('username', { required: true })}
          error={!!errors.username}
          helperText={errors.username && '名前を入力してください'}
        />

        <Typography variant="body2" sx={{ mt: 2 }}>
          メールアドレス
        </Typography>
        <TextField
          fullWidth
          margin="dense"
          type="email"
          {...register('email', { required: true })}
          error={!!errors.email}
          helperText={errors.email && 'メールアドレスを入力してください'}
        />

        <Typography variant="body2" sx={{ mt: 2 }}>
          誕生日
        </Typography>
        <TextField
          fullWidth
          margin="dense"
          type="date"
          InputLabelProps={{ shrink: true }}
          {...register('birth', { required: true })}
          error={!!errors.birth}
          helperText={errors.birth && '誕生日を入力してください'}
        />

        <Button type="submit" variant="contained" sx={{ mt: 3 }}>
          更新
        </Button>
      </Box>
    </Container>
  );
};

export default UpdateProfile;
