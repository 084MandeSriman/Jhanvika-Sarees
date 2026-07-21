import React from 'react'
import SareeArt from './SareeArt.jsx'
import { resolveImageUrl } from '../api/config.js'

export default function ProductVisual({ product, className = '', imageIndex = 0 }) {
  const images = product?.images || []
  const image = images[imageIndex] || images[0]

  if (image?.url) {
    return <img src={resolveImageUrl(image.url)} alt={image.altText || product.name} className={className} />
  }

  const palette = product?.paletteJson || product?.palette || {}
  return <SareeArt palette={palette} className={className} />
}
