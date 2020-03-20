import React from 'react';
import {Helmet} from 'react-helmet';

export default function SEO({title, description, siteName}) {
  return (
    <Helmet>
      <link rel="icon" href="favicon.ico" />
      {/* other SEO tags (OpenGraph, Twitter, etc.) */}
    </Helmet>
  );
}