import React from 'react';
import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectIsLoginView } from '../User/features/login/loginSlice';

const Header: React.FC = () => {
  const isLoginView = useSelector(selectIsLoginView);
  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="center" style={{ height: '100%' }}>
        {isLoginView ? (
          <>
            <Box p={1} bgcolor="grey.300">
              <Link to="/">検索＆作成</Link>
            </Box>
            <Box p={1} bgcolor="grey.300">
              <Link to="/logout">ログアウト</Link>
            </Box>
            <Box p={1} bgcolor="grey.300">
              <Link to="/update_profile">プロフィールの変更</Link>
            </Box>
            <Box p={1} bgcolor="grey.300">
              <Link to="/update_passwd">パスワードの変更</Link>
            </Box>
          </>
        ) : (
          <>
          <Box p={1} bgcolor="grey.300">
            <Link to="/login">ログイン</Link>
          </Box>
          <Box p={1} bgcolor="grey.300">
          <Link to="/register">Register</Link>
        </Box>
        </>
        )}
      </Box>
    </>
  );
};

export default React.memo(Header);
