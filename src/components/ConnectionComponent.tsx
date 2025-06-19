import React from 'react';
import { CustomConnection } from '../editor';

interface ConnectionComponentProps {
  data: CustomConnection;
  emit: any;
}

export const ConnectionComponent: React.FC<ConnectionComponentProps> = ({ data, emit }) => {
  return (
    <g 
      className="rete-connection"
      onContextMenu={(e) => {
        e.preventDefault();
        emit({
          type: 'contextmenu',
          data: { type: 'connection', payload: data, event: e }
        });
      }}
    >
      {/* Main connection path */}
      <path
        stroke={data.color}
        strokeWidth="3"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      
      {/* Circle in the center of the connection */}
      <circle
        r="20"
        fill="white"
        stroke={data.color}
        strokeWidth="2"
        className="connection-circle"
      />
      
      {/* Connection type icon in the circle */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fontFamily="'Manrope', sans-serif"
        fill={data.color}
      >
        {data.icon}
      </text>
      
      {/* Connection label */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="18"
        fontFamily="'Manrope', sans-serif"
        fill="black"
        y="30"
      >
        {data.customLabel}
      </text>
    </g>
  );
};
