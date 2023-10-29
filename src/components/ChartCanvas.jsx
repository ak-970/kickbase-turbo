import { useEffect, useRef } from 'react'

// Chart.js
import Chart from 'chart.js/auto'
import { getRelativePosition } from 'chart.js/helpers'


const ChartCanvas = ({ data, options = {} }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const chart = new Chart(ctx, { data, options })
  }, [])

  return <canvas ref={canvasRef}/>
}


export default ChartCanvas