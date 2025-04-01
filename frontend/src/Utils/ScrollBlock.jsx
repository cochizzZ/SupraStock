import { useRef } from 'react';

const safeDocument = typeof document !== 'undefined' ? document : {};

export const blockScroll = () => {
  const html = safeDocument.documentElement;
  const { body } = safeDocument;

  if (!body || !body.style) return;

  const scrollBarWidth = window.innerWidth - html.clientWidth;
  const bodyPaddingRight =
    parseInt(window.getComputedStyle(body).getPropertyValue("padding-right")) || 0;

  html.style.position = 'relative';
  html.style.overflow = 'hidden';
  body.style.position = 'relative';
  body.style.overflow = 'hidden';
  body.style.paddingRight = `${bodyPaddingRight + scrollBarWidth}px`;
};

export const allowScroll = () => {
  const html = safeDocument.documentElement;
  const { body } = safeDocument;

  if (!body || !body.style) return;

  html.style.position = '';
  html.style.overflow = '';
  body.style.position = '';
  body.style.overflow = '';
  body.style.paddingRight = '';
};