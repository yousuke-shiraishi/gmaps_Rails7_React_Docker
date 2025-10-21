import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <>
    <h1>Not Found!</h1>
    <Link to="/">Top Page</Link>
  </>
);

export default NotFoundPage;
