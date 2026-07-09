import * as React from 'react';
import type { FaqDataProps } from '../types'

const FaqItem: React.FC<FaqDataProps> = (props) => {
  const { title, description } = props
  const [open, setOpen] = React.useState<boolean>(false)

  return (
    <li>
      <div className={`question-box ${open ? 'now' : ''}`} onClick={() => setOpen(!open)}>
        <div className="left-item">
          <div className="mark-q">Q</div>
          <p>{title}</p>
        </div>
        <div className="arr">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="11" viewBox="0 0 20 11">
            <path id="Union_1" data-name="Union 1" d="M-10993.707,3037.707l-9-9a1,1,0,0,1,0-1.414,1,1,0,0,1,1.414,0l8.292,8.293,8.293-8.293a1,1,0,0,1,1.413,0,1,1,0,0,1,0,1.414l-9,9a.993.993,0,0,1-.707.293A.993.993,0,0,1-10993.707,3037.707Z" transform="translate(11003 -3027)" fill="#4c8da7"/>
          </svg>
        </div>
      </div>
      <div className="answer-box" style={{ display: open ? 'block' : 'none' }}>
        <div className="flex-box">
          <div className="mark-a">A</div>
          <p dangerouslySetInnerHTML={{ __html: description }}></p>
        </div>
      </div>
    </li>
  )
}

export default FaqItem
