import React from 'react';
import { View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface CompassTicksSvgProps {
  diameter: number;
  innerDiameter: number;
}

// Renders inner tick marks using react-native-svg to reduce view count overhead
export const CompassTicksSvg: React.FC<CompassTicksSvgProps> = ({ diameter, innerDiameter }) => {
  const { theme } = useTheme();
  const radius = innerDiameter / 2;
  const ticks = React.useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => {
      const angleDeg = i * 6;
      const angleRad = (angleDeg - 90) * Math.PI / 180; // rotate start from top
      const isMajor = angleDeg % 90 === 0;
      const tickLen = isMajor ? 10 : 4;
      const strokeWidth = isMajor ? 2 : 1;
      const x1 = radius + (radius - 8) * Math.cos(angleRad);
      const y1 = radius + (radius - 8) * Math.sin(angleRad);
      const x2 = radius + (radius - 8 - tickLen) * Math.cos(angleRad);
      const y2 = radius + (radius - 8 - tickLen) * Math.sin(angleRad);
      return (
        <Line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={theme.colors.textSecondary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      );
    });
  }, [radius, theme.colors.textSecondary]);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', width: diameter, height: diameter }}>
      <Svg width={innerDiameter + 20} height={innerDiameter + 20} style={{ position: 'absolute', top: (diameter - innerDiameter - 20)/2, left: (diameter - innerDiameter - 20)/2 }}>
        {ticks}
      </Svg>
    </View>
  );
};

export default CompassTicksSvg;
