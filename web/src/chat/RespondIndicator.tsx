import React from "react"

import './responding.css'

const Header = ({ responding }) => {
  return (
    <>
      {
        responding &&
        <div className="responding-container">
          <div className="dot-flashing dot-flashing-text"></div>
        </div>
      }
    </>
  )
}

export default React.memo(Header)
