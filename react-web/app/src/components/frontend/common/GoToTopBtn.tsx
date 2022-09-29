import React from 'react';
const GoToTopBtn: React.VFC = () => {
  const handleClick = ():void => {
    window.scrollTo(0, 0);
  }

  return (
    <div className="go-topbtn" onClick={handleClick}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16.828" height="9.828" viewBox="0 0 16.828 9.828">
            <g id="Group_7699" data-name="Group 7699" transform="translate(1561.442 559.678) rotate(180)">
                <line id="Line_177" data-name="Line 177" x2="7" y2="7" transform="translate(1546.028 551.264)" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="2"></line>
                <line id="Line_178" data-name="Line 178" x1="7" y2="7" transform="translate(1553.028 551.264)" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="2"></line>
            </g>
        </svg>
    </div>
  )
}

export default GoToTopBtn
