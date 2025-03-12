import React from 'react'
import './Hero.css'
import hand_icon from '../Assets/hand_icon.png'
import hero_image from '../Assets/hero_image.png'



const Hero = () => {
  return (
    <div className='hero'>
      <div className="hero-left">

        <div>
            <div className="hero-hand-icon">
                <p>Nuevos</p>
                <img src={hand_icon} alt="" />
            </div>
            <p>lanzamientos</p>
            <p>para todos</p>
        </div>
      </div>
      <div className="hero-right">
        <img src={hero_image} alt="" />
      </div>
    </div>
  )
}

export default Hero
