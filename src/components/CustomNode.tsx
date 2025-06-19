import React from 'react';
import { CustomNode } from '../editor-new'; // Adjust the path if necessary

interface CustomNodeProps {
  data: CustomNode;
}

const CustomNodeComponent: React.FC<CustomNodeProps> = ({ data }) => {
  return (
    <div
      className="rete-node"
      data-node-id={data.id}
      style={{
        width: "60px",
        height: "40px",
        borderRadius: "8px",
        backgroundColor: data.color,
        border: "2px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        fontFamily: "'Manrope', sans-serif",
        boxSizing: "border-box",
        userSelect: "none"
      }}
    >
      <div
        className="node-label"
        style={{
          position: "absolute",
          top: "-35px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "black",
          fontFamily: "'Manrope', sans-serif",
          fontSize: "18px",
          fontWeight: "normal",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          background: "rgba(255,255,255,0.95)",
          padding: "4px 8px",
          borderRadius: "4px",
          border: "1px solid #ddd",
          zIndex: "100",
          textAlign: "center",
          minWidth: "60px",
          boxSizing: "border-box"
        }}
      >
        {data.customLabel}
      </div>
      <span style={{ fontSize: "18px", lineHeight: "1" }}>{data.icon}</span>
      {data.layer > 0 && (
        <div
          className="layer-indicator"
          style={{
            position: "absolute",
            top: "-10px",
            right: "-10px",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "#ff6b6b",
            color: "white",
            fontSize: "12px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Manrope', sans-serif",
            border: "2px solid white",
            zIndex: "101"
          }}
        >
          {data.layer}
        </div>
      )}
      {data.group !== "none" && (
        <div
          className="group-indicator"
          style={{
            position: "absolute",
            bottom: "-10px",
            left: "-10px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "#4ecdc4",
            color: "white",
            fontSize: "10px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Manrope', sans-serif",
            border: "2px solid white",
            zIndex: "101"
          }}
        >
          G
        </div>
      )}
    </div>
  );
};

export default CustomNodeComponent;
