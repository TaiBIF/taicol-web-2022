import React, { useRef, useState } from 'react'
import IframeResizer from 'iframe-resizer-react'

const MatchPage: React.VFC = () => {
  const iframeRef = useRef(null)

/**
values:  'bodyOffset' | 'bodyScroll' | 'documentElementOffset' | 'documentElementScroll' |
         'max' | 'min' | 'grow' | 'lowestElement' | 'taggedElement'
          */
  return (
    <IframeResizer
        forwardRef={iframeRef}
        autoResize={false}
        src={`${process.env.NEXT_PUBLIC_IFRAME_URL}/name/match`}
        style={{ width: '1px', minWidth: '100%', height: '1500px', border: 'none' }}
      />

  )
}

export default MatchPage
