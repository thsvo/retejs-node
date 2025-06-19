import React, { useState } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  items: Array<{
    label: string;
    action: () => void;
    submenu?: Array<{
      label: string;
      action: () => void;
    }>;
  }>;
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);

  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
    fontFamily: 'Manrope, sans-serif',
    fontSize: '18px',
    minWidth: '200px'
  };

  const itemStyle: React.CSSProperties = {
    padding: '8px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const handleItemClick = (item: any, index: number) => {
    if (item.submenu) {
      setActiveSubmenu(activeSubmenu === index ? null : index);
    } else {
      item.action();
      onClose();
    }
  };

  return (
    <div style={menuStyle}>
      {items.map((item, index) => (
        <div key={index}>
          <div
            style={itemStyle}
            onClick={() => handleItemClick(item, index)}
            onMouseEnter={() => setActiveSubmenu(index)}
          >
            <span>{item.label}</span>
            {item.submenu && <span>▶</span>}
          </div>
          {item.submenu && activeSubmenu === index && (
            <div style={{
              position: 'absolute',
              left: '100%',
              top: `${index * 40}px`,
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              minWidth: '150px'
            }}>
              {item.submenu.map((subItem, subIndex) => (
                <div
                  key={subIndex}
                  style={itemStyle}
                  onClick={() => {
                    subItem.action();
                    onClose();
                  }}
                >
                  {subItem.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
