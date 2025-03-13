import React from 'react';
import CommentsBox from '../CommentsBox/CommentsBox';

const SomeComponent = ({ productId }) => {
  return (
    <div>
      {/* Otros componentes */}
      <CommentsBox productId={productId} />
    </div>
  );
};

export default SomeComponent;