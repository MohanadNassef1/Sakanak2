import React from 'react';

interface MatchScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { outer: 40, stroke: 3, fontSize: 'text-xs', radius: 16 },
  md: { outer: 56, stroke: 4, fontSize: 'text-sm', radius: 22 },
  lg: { outer: 72, stroke: 5, fontSize: 'text-lg', radius: 28 },
};

const MatchScoreCircle: React.FC<MatchScoreCircleProps> = ({ score, size = 'md', className = '' }) => {
  const { outer, stroke, fontSize, radius } = SIZES[size];
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = outer / 2;

  // Color based on score
  const getColor = () => {
    if (score >= 70) return { stroke: '#22c55e', text: 'text-green-500' }; // green
    if (score >= 40) return { stroke: '#f59e0b', text: 'text-amber-500' }; // amber
    return { stroke: '#ef4444', text: 'text-red-500' }; // red
  };

  const color = getColor();

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} title={`${score}% match`}>
      <svg width={outer} height={outer} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/30"
        />
        {/* Score arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className={`absolute font-bold ${fontSize} ${color.text}`}>
        {score}%
      </span>
    </div>
  );
};

export default MatchScoreCircle;
