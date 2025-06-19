import React from 'react';

interface CustomConnectionProps {
  data: {
    connectionType: string;
    color: string;
    icon: string;
    label?: string;
  };
  styles?: () => React.CSSProperties;
}

export function CustomConnection({ data, styles }: CustomConnectionProps) {
  const circleStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'white',
    border: `2px solid ${data.color}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    ...styles?.()
  };

  return (
    <div style={circleStyle}>
      <span>{data.icon}</span>
      {data.label && (
        <div style={{
          position: 'absolute',
          top: '45px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: data.color,
          fontFamily: 'Manrope, sans-serif',
          fontSize: '14px',
          whiteSpace: 'nowrap',
          background: 'rgba(255,255,255,0.9)',
          padding: '2px 6px',
          borderRadius: '4px'
        }}>
          {data.label}
        </div>
      )}
    </div>
  );
}
