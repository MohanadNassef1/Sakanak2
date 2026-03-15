import React, { useState, useEffect } from 'react';
import { ScoreBreakdown } from '@/lib/matchScore';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MatchScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  breakdown?: ScoreBreakdown[];
  showLabel?: boolean;
}

const SIZES = {
  sm: { outer: 44, stroke: 3, fontSize: 'text-xs', radius: 17, labelSize: 'text-[9px]' },
  md: { outer: 60, stroke: 4, fontSize: 'text-sm', radius: 24, labelSize: 'text-[10px]' },
  lg: { outer: 80, stroke: 5, fontSize: 'text-lg', radius: 32, labelSize: 'text-xs' },
};

const MatchScoreCircle: React.FC<MatchScoreCircleProps> = ({
  score,
  size = 'md',
  className = '',
  breakdown,
  showLabel = false,
}) => {
  const { isRTL } = useLanguage();
  const { outer, stroke, fontSize, radius, labelSize } = SIZES[size];
  const circumference = 2 * Math.PI * radius;
  const center = outer / 2;

  // Animate score on mount
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;

  // Color gradient based on score
  const getColor = () => {
    if (score >= 70) return { stroke: 'url(#greenGrad)', text: 'text-green-500', label: isRTL ? 'متوافق جداً' : 'Great Match' };
    if (score >= 40) return { stroke: 'url(#amberGrad)', text: 'text-amber-500', label: isRTL ? 'متوافق' : 'Good Match' };
    return { stroke: 'url(#redGrad)', text: 'text-red-400', label: isRTL ? 'توافق قليل' : 'Low Match' };
  };

  const color = getColor();

  const activeBreakdown = breakdown?.filter(b => b.points > 0) || [];

  const circle = (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <div className="relative inline-flex items-center justify-center" title={`${score}% match`}>
        <svg width={outer} height={outer} className="-rotate-90">
          <defs>
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted/20"
          />
          {/* Score arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={stroke + 1}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-sm"
          />
        </svg>
        <span className={`absolute font-bold ${fontSize} ${color.text}`}>
          {animatedScore}%
        </span>
      </div>
      {showLabel && (
        <span className={`${labelSize} font-medium ${color.text} mt-0.5 whitespace-nowrap`}>
          {color.label}
        </span>
      )}
    </div>
  );

  // If breakdown is provided, wrap in tooltip
  if (breakdown && breakdown.length > 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="focus:outline-none">
              {circle}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[260px] p-3">
            <p className="font-semibold text-xs mb-2">
              {isRTL ? 'تفاصيل التوافق' : 'Match Breakdown'}
            </p>
            <div className="space-y-1.5">
              {breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span>{item.icon}</span>
                    <span className={item.points > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                      {isRTL ? item.labelAr : item.label}
                    </span>
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.points === item.maxPoints
                            ? 'bg-green-500'
                            : item.points > 0
                            ? 'bg-amber-400'
                            : 'bg-transparent'
                        }`}
                        style={{ width: `${(item.points / item.maxPoints) * 100}%` }}
                      />
                    </div>
                    <span className={`w-7 text-right font-mono ${item.points > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.points}/{item.maxPoints}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {activeBreakdown.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-[10px] text-muted-foreground">
                  {isRTL
                    ? `${activeBreakdown.length} من ${breakdown.length} عوامل متطابقة`
                    : `${activeBreakdown.length} of ${breakdown.length} factors matched`}
                </p>
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return circle;
};

export default MatchScoreCircle;
