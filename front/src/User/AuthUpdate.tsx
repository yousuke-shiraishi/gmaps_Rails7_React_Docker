import React, { useRef } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './features/login/store';
import { UpdatePW } from '../components/interface/UpdatePW';
import { fetchAsyncPassWdUpdate } from './features/login/loginSlice';

const UpdatePassWord: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<UpdatePW>();

  const password = useRef('');
  password.current = watch('password', '');

  const onSubmit: SubmitHandler<UpdatePW> = async (data) => {
    await dispatch(fetchAsyncPassWdUpdate(data) as any);
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%', maxWidth: 480, mt: 1 }}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>
        パスワード更新
      </Typography>

      <Typography variant="body2">新しいパスワード</Typography>
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

      <Typography variant="body2" sx={{ mt: 2 }}>
        パスワード確認
      </Typography>
      <TextField
        fullWidth
        margin="dense"
        type="password"
        {...register('password_confirmation', {
          validate: (value) =>
            value === password.current || '確認用のパスワードが一致しません',
        })}
        error={!!errors.password_confirmation}
        helperText={errors.password_confirmation?.message}
      />

      <Button variant="contained" type="submit" sx={{ mt: 3 }}>
        更新
      </Button>
    </Box>
  );
};

export default UpdatePassWord;
