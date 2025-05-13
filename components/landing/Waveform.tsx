import React from 'react'
import styles from './Waveform.module.css'

interface WaveformProps {
  isActive: boolean
}

const Waveform: React.FC<WaveformProps> = ({ isActive }) => {
  return (
    <div className={`${styles.waveform} ${isActive ? styles.waveformActive : ''}`}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  )
}

export default Waveform
