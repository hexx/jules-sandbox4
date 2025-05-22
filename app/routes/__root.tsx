import React from 'react';
import { Outlet } from '@tanstack/react-router';

export const Route = () => {
  return (
    <>
      <header>
        <h1>My App</h1>
      </header>
      <hr />
      <Outlet />
      <footer>
        <p>Footer content</p>
      </footer>
    </>
  );
};
