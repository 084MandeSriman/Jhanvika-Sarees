import React from 'react'
import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Jhanvika'
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : ''
const DEFAULT_DESCRIPTION = 'Jhanvika — a curated house of handwoven sarees. Banarasi, Kanjivaram, Chanderi & more, delivered with love.'

export default function Seo({ title, description, path = '', image, jsonLd, noindex = false }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Sarees Woven with Story`
  const desc = description || DEFAULT_DESCRIPTION
  const canonical = `${SITE_URL}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}

      {jsonLd && (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((block, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(block)}</script>
      ))}
    </Helmet>
  )
}
