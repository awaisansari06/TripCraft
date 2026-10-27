"use client";

import Image from 'next/image';
import { useState } from 'react';
import { travelArtworkSrc, travelArtworkAlt } from '@/lib/travel-artwork';
import styles from './TravelArtwork.module.css';

/** Keep both grades in one coordinate system without hydration-dependent URLs. */
export default function TravelArtwork({ asset, alt, sizes, priority = false }: {
  asset: string;
  alt?: string;
  sizes: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState({ light: false, dark: false });
  return <div className={styles.root}>
    <Image src={failed.light ? '/image-fallback.svg' : travelArtworkSrc(asset)}
      alt={alt || travelArtworkAlt(asset)} fill sizes={sizes} priority={priority} className={styles.light}
      onError={() => setFailed(previous => ({ ...previous, light: true }))} />
    <Image src={failed.dark ? '/image-fallback.svg' : travelArtworkSrc(asset, 'dark')}
      alt="" aria-hidden="true" fill sizes={sizes} className={styles.dark}
      onError={() => setFailed(previous => ({ ...previous, dark: true }))} />
  </div>;
}
