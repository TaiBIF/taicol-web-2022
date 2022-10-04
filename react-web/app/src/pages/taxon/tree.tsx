import React, { useRef, useState } from 'react'
import IframeResizer from 'iframe-resizer-react'

const TaxonTree: React.VFC = () => {
  const iframeRef = useRef(null)

  return (
    <IframeResizer
        forwardRef={iframeRef}
        autoResize={false}
        src={`${process.env.NEXT_PUBLIC_IFRAME_URL}/taxon/tree`}
        style={{ width: '1px', minWidth: '100%', height: '1700px', border: 'none' }}
      />

  )
}

export default TaxonTree
