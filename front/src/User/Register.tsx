import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useForm, SubmitHandler } from 'react-hook-form';
import { AppDispatch } from './features/login/store';
import { Profile } from '../components/interface/Profile';
import { fetchAsyncLogin, fetchAsyncRegister, fetchAsyncShowUserData } from './features/login/loginSlice';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Register: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<Profile>({});

  const password = useRef('');
  password.current = (watch('password', '') as string) || '';

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<Profile> = async (data) => {
    try {
      // 1) 登録
      await dispatch(fetchAsyncRegister(data)).unwrap();

      // 2) そのまま自動ログイン（必要最小限だけ渡す）
      await dispatch(
        fetchAsyncLogin({ email: data.email!, password: data.password! } as Profile)
      ).unwrap();

      // 3) ユーザー情報の取得 → 画面遷移
      await dispatch(fetchAsyncShowUserData()).unwrap();
      navigate('/'); // ここを '/login' にすれば「登録だけ → ログイン画面へ」にもできる
    } catch (e: any) {
      console.error(e);
      alert(e?.message || '登録に失敗しました');
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
        <Typography component="h1" variant="h5">登録</Typography>

        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 1, width: '100%' }}
        >
          <Typography variant="body2" sx={{ mt: 1 }}>名前</Typography>
          <TextField
            fullWidth
            margin="dense"
            {...register('username', { required: true })}
            error={!!errors.username}
            helperText={errors.username && '名前を入力してください'}
          />

          <Typography variant="body2" sx={{ mt: 2 }}>メールアドレス</Typography>
          <TextField
            fullWidth
            margin="dense"
            type="email"
            {...register('email', { required: true })}
            error={!!errors.email}
            helperText={errors.email && 'メールアドレスを入力してください'}
          />

          <Typography variant="body2" sx={{ mt: 2 }}>誕生日</Typography>
          <TextField
            fullWidth
            margin="dense"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register('birth', { required: true })}
            error={!!errors.birth}
            helperText={errors.birth && '誕生日を入力してください'}
          />

          <Typography variant="body2" sx={{ mt: 2 }}>パスワード</Typography>
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

          <Typography variant="body2" sx={{ mt: 2 }}>パスワード確認</Typography>
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            作成
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
