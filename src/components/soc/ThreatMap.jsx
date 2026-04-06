import { useEffect, useRef, useState, memo } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import { motion } from 'motion/react'

const ThreatMap = memo(() => {
  const svgRef = useRef(null)
  const [attacks, setAttacks] = useState([])

  useEffect(() => {
    const width = 800
    const height = 450
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    const projection = d3.geoMercator()
      .scale(120)
      .translate([width / 2, height / 1.5])

    const path = d3.geoPath().projection(projection)

    // Fetch world map data
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(data => {
      const countries = topojson.feature(data, data.objects.countries)

      svg.append('g')
        .selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', '#1e293b') // navy-800
        .attr('stroke', '#334155') // navy-700
        .attr('stroke-width', 0.5)

      // Simulated attack points generator
      const interval = setInterval(() => {
        const randomCountry = countries.features[Math.floor(Math.random() * countries.features.length)]
        if (!randomCountry) return

        const centroid = path.centroid(randomCountry)
        if (isNaN(centroid[0]) || isNaN(centroid[1])) return

        const id = Math.random().toString(36).substr(2, 9)
        const newAttack = {
          id,
          x: centroid[0],
          y: centroid[1],
          type: ['DoS', 'R2L', 'U2R', 'Probing'][Math.floor(Math.random() * 4)],
          severity: Math.random() > 0.7 ? 'high' : 'medium'
        }

        setAttacks(prev => [...prev.slice(-15), newAttack])

        // Visual effect for the attack
        const circle = svg.append('circle')
          .attr('cx', newAttack.x)
          .attr('cy', newAttack.y)
          .attr('r', 0)
          .attr('fill', newAttack.severity === 'high' ? '#ef4444' : '#f59e0b')
          .attr('opacity', 0.8)

        circle.transition()
          .duration(1000)
          .attr('r', 15)
          .attr('opacity', 0)
          .remove()

        // Line effect (simulated origin to target - target is "us")
        const target = [width / 2, height / 2] // Center as "our" location
        const line = svg.append('line')
          .attr('x1', newAttack.x)
          .attr('y1', newAttack.y)
          .attr('x2', newAttack.x)
          .attr('y2', newAttack.y)
          .attr('stroke', newAttack.severity === 'high' ? '#ef4444' : '#f59e0b')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '5,5')
          .attr('opacity', 0.5)

        line.transition()
          .duration(1500)
          .attr('x2', target[0])
          .attr('y2', target[1])
          .attr('opacity', 0)
          .remove()

      }, 2000)

      return () => clearInterval(interval)
    })
  }, [])

  return (
    <div className="relative w-full aspect-video bg-navy-950 rounded-2xl overflow-hidden border border-navy-800 shadow-inner">
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-navy-900/80 backdrop-blur-md border border-navy-700 rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Global Threat Monitor</span>
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] font-bold text-navy-400 uppercase tracking-wider bg-navy-900/50 p-2 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span>High Severity</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            <span>Medium Severity</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Overlay */}
      <div className="absolute bottom-4 left-4 z-10 max-w-[200px] pointer-events-none">
        <div className="space-y-1">
          {attacks.slice(-3).reverse().map((attack) => (
            <motion.div
              key={attack.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-2 py-1 bg-navy-900/60 border border-navy-700/50 rounded text-[9px] text-white/80 font-mono"
            >
              <span className={attack.severity === 'high' ? 'text-red-400' : 'text-amber-400'}>
                [{attack.type}]
              </span> INCOMING_THREAT_DETECTED
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
})

ThreatMap.displayName = 'ThreatMap'

export default ThreatMap
