import React from 'react';
import { CustomNode } from '../editor';

interface NodeComponentProps {
  data: CustomNode;
  emit: any;
}

export const NodeComponent: React.FC<NodeComponentProps> = ({ data, emit }) => {
  return (
    <div 
      className="rete-node"
      data-node-type={data.nodeType}
      style={{
        width: '60px',
        height: '40px',
        borderRadius: '8px',
        backgroundColor: data.color,
        border: '2px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        fontFamily: "'Manrope', sans-serif",
        boxSizing: 'border-box',
        userSelect: 'none'
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        emit({
          type: 'contextmenu',
          data: { type: 'node', payload: data, event: e }
        });
      }}
    >
      {/* Node Label - positioned outside the node */}
      <div 
        className="node-label"
        style={{
          position: 'absolute',
          top: '-35px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'black',
          fontFamily: "'Manrope', sans-serif",
          fontSize: '18px',
          fontWeight: 'normal',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          background: 'rgba(255,255,255,0.95)',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          zIndex: 100,
          textAlign: 'center',
          minWidth: '60px',
          boxSizing: 'border-box'
        }}
      >
        {data.customLabel}
      </div>

      {/* Node Icon */}
      <span 
        className="node-icon"
        style={{
          fontSize: '18px',
          lineHeight: '1'
        }}
      >
        {data.icon}
      </span>

      {/* Layer indicator if layer > 0 */}
      {data.layer > 0 && (
        <div 
          className="layer-badge"
          style={{
            position: 'absolute',
            top: '-12px',
            right: '-12px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#ff6b6b',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Manrope', sans-serif",
            border: '2px solid white',
            zIndex: 101
          }}
        >
          {data.layer}
        </div>
      )}

      {/* Group indicator if in a group */}
      {data.group !== "none" && (
        <div 
          className="group-badge"
          style={{
            position: 'absolute',
            bottom: '-12px',
            left: '-12px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#4ecdc4',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Manrope', sans-serif",
            border: '2px solid white',
            zIndex: 101
          }}
        >
          G
        </div>
      )}
    </div>
  );
};
