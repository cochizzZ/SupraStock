import React from 'react'
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
      <div className="descriptionbox-navigator">
        <div className="descriptionbox-nav-box">Description</div>
        <div className="descriptionbox-nav-box fade">Reviews (122)</div>
      </div>
      <div className="descriptionbox-description">
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum quibusdam fugit praesentium reprehenderit, sequi animi, consectetur mollitia at vero architecto nostrum. Repudiandae atque sunt excepturi suscipit iure laboriosam sit quam?</p>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Facere quaerat libero sunt sint praesentium itaque incidunt unde temporibus mollitia? Iure facere voluptatibus non odio voluptas asperiores, sequi aut exercitationem tenetur.</p>
      </div>
    </div>
  )
}

export default DescriptionBox
