import { createRoot } from "react-dom/client";
import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import { ReactPlugin, Presets, ReactArea2D } from "rete-react-plugin";

// Types - defined first to avoid parsing errors
export type NodeType = "folder" | "file" | "class" | "method" | "function" | "variables";
export type ConnectionType = "contain" | "call";

// Custom Node class with additional properties
export class CustomNode extends ClassicPreset.Node {
  public nodeType: NodeType;
  public color: string;
  public layer: number;
  public group: string;
  public icon: string;
  public customLabel: string;

  constructor(label: string, nodeType: NodeType) {
    super(label);
    this.nodeType = nodeType;
    this.color = getNodeColor(nodeType);
    this.layer = 0;
    this.group = "none";
    this.icon = getNodeIcon(nodeType);
    this.customLabel = label;
  }
}

// Custom Connection class with additional properties
export class CustomConnection extends ClassicPreset.Connection<CustomNode, CustomNode> {
  public connectionType: ConnectionType;
  public color: string;
  public icon: string;
  public customLabel: string;

  constructor(source: CustomNode, sourceOutput: string, target: CustomNode, targetInput: string, connectionType: ConnectionType = "contain") {
    super(source, sourceOutput, target, targetInput);
    this.connectionType = connectionType;
    this.color = "black";
    this.icon = getConnectionIcon(connectionType);
    this.customLabel = connectionType;
  }
}

type Schemes = GetSchemes<CustomNode, CustomConnection>;
type AreaExtra = ReactArea2D<Schemes>;

// Helper functions
function getNodeColor(nodeType: NodeType): string {
  const colors = {
    folder: "#A3FFA9",
    file: "#D1ADFF", 
    class: "#FFC7C2",
    method: "#FFECBD",
    function: "#CDF4D3",
    variables: "#CDF4D3"
  };
  return colors[nodeType];
}

function getNodeIcon(nodeType: NodeType): string {
  const icons = {
    folder: "📁",
    file: "📄",
    class: "🏛️",
    method: "⚙️",
    function: "🔧",
    variables: "📊"
  };
  return icons[nodeType];
}

function getConnectionIcon(connectionType: ConnectionType): string {
  const icons = {
    contain: "📦",
    call: "📞"
  };
  return icons[connectionType];
}

// Interface definitions
interface Group {
  id: string;
  label: string;
  nodes: string[];
  bounds: { x: number; y: number; width: number; height: number };
  parentGroup?: string;
}

// Global state
let groups: Group[] = [];
let selectedNode: CustomNode | null = null;
let isCreatingConnection = false;
let minimapVisible = false;
let editor: NodeEditor<Schemes>;
let area: AreaPlugin<Schemes, AreaExtra>;

// Notification function
function showNotification(message: string) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.background = '#333';
  notification.style.color = 'white';
  notification.style.padding = '12px 20px';
  notification.style.borderRadius = '8px';
  notification.style.fontFamily = "'Manrope', sans-serif";
  notification.style.fontSize = '18px';
  notification.style.zIndex = '20000';
  notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

export async function createEditor(container: HTMLElement) {
  const socket = new ClassicPreset.Socket("socket");
  
  editor = new NodeEditor<Schemes>();
  area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });

  // Setup extensions
  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  // Use standard Rete.js presets
  render.addPreset(Presets.classic.setup());
  connection.addPreset(ConnectionPresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);

  AreaExtensions.simpleNodesOrder(area);

  // Setup context menu handling
  setupContextMenu(container, socket);

  // Setup minimap
  setupMinimap(container);

  // Setup keyboard shortcuts
  setupKeyboardShortcuts();

  // Create initial demonstration nodes with 100px spacing
  await createDemoNodes(socket);

  return {
    destroy: () => area.destroy(),
  };
}

async function createDemoNodes(socket: ClassicPreset.Socket) {
  // Create demo nodes showing all types and features with 100px spacing
  const folderNode = new CustomNode("Project", "folder");
  folderNode.addOutput('out', new ClassicPreset.Output(socket));
  await editor.addNode(folderNode);
  await area.translate(folderNode.id, { x: 100, y: 100 });

  const fileNode = new CustomNode("main.ts", "file");
  fileNode.addInput('in', new ClassicPreset.Input(socket));
  fileNode.addOutput('out', new ClassicPreset.Output(socket));
  await editor.addNode(fileNode);
  await area.translate(fileNode.id, { x: 260, y: 100 }); // 100px spacing + 60px node width

  const classNode = new CustomNode("MyClass", "class");
  classNode.addInput('in', new ClassicPreset.Input(socket));
  classNode.addOutput('out', new ClassicPreset.Output(socket));
  await editor.addNode(classNode);
  await area.translate(classNode.id, { x: 420, y: 100 });

  const methodNode = new CustomNode("myMethod", "method");
  methodNode.addInput('in', new ClassicPreset.Input(socket));
  methodNode.addOutput('out', new ClassicPreset.Output(socket));
  methodNode.layer = 1; // Example layer
  await editor.addNode(methodNode);
  await area.translate(methodNode.id, { x: 260, y: 240 }); // 100px vertical spacing + 40px node height

  const functionNode = new CustomNode("helper", "function");
  functionNode.addInput('in', new ClassicPreset.Input(socket));
  functionNode.addOutput('out', new ClassicPreset.Output(socket));
  await editor.addNode(functionNode);
  await area.translate(functionNode.id, { x: 420, y: 240 });

  const variableNode = new CustomNode("data", "variables");
  variableNode.addInput('in', new ClassicPreset.Input(socket));
  await editor.addNode(variableNode);
  await area.translate(variableNode.id, { x: 580, y: 100 });

  // Create connections demonstrating both types
  const conn1 = new CustomConnection(folderNode, 'out', fileNode, 'in', 'contain');
  await editor.addConnection(conn1);

  const conn2 = new CustomConnection(fileNode, 'out', classNode, 'in', 'contain');
  await editor.addConnection(conn2);

  const conn3 = new CustomConnection(classNode, 'out', methodNode, 'in', 'contain');
  await editor.addConnection(conn3);

  const conn4 = new CustomConnection(methodNode, 'out', functionNode, 'in', 'call');
  await editor.addConnection(conn4);

  const conn5 = new CustomConnection(classNode, 'out', variableNode, 'in', 'contain');
  await editor.addConnection(conn5);
}

function setupContextMenu(container: HTMLElement, socket: ClassicPreset.Socket) {
  let contextMenu: HTMLElement | null = null;

  function removeContextMenu() {
    if (contextMenu) {
      container.removeChild(contextMenu);
      contextMenu = null;
    }
  }

  function createContextMenuElement(x: number, y: number, items: Array<{label: string, action: () => void, submenu?: Array<{label: string, action: () => void}>}>) {
    removeContextMenu();
    
    contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.style.position = 'absolute';
    contextMenu.style.background = 'white';
    contextMenu.style.border = '2px solid #333';
    contextMenu.style.borderRadius = '8px';
    contextMenu.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
    contextMenu.style.zIndex = '10000';
    contextMenu.style.fontFamily = "'Manrope', sans-serif";
    contextMenu.style.fontSize = '18px';
    contextMenu.style.minWidth = '220px';

    items.forEach((item, index) => {
      const menuItem = document.createElement('div');
      menuItem.className = 'context-menu-item';
      menuItem.style.padding = '12px 16px';
      menuItem.style.cursor = 'pointer';
      menuItem.style.borderBottom = index < items.length - 1 ? '1px solid #eee' : 'none';
      menuItem.style.display = 'flex';
      menuItem.style.justifyContent = 'space-between';
      menuItem.style.alignItems = 'center';
      menuItem.style.fontFamily = "'Manrope', sans-serif";
      menuItem.style.fontSize = '18px';
      
      menuItem.textContent = item.label;
      
      if (item.submenu) {
        const arrow = document.createElement('span');
        arrow.textContent = '▶';
        arrow.style.fontSize = '14px';
        menuItem.appendChild(arrow);
      }

      menuItem.onmouseenter = () => {
        menuItem.style.backgroundColor = '#f0f8ff';
      };
      
      menuItem.onmouseleave = () => {
        menuItem.style.backgroundColor = 'transparent';
      };

      menuItem.onclick = (e) => {
        e.stopPropagation();
        if (item.submenu) {
          showSubmenu(item.submenu, x + 220, y + index * 45);
        } else {
          item.action();
          removeContextMenu();
        }
      };

      contextMenu!.appendChild(menuItem);
    });

    container.appendChild(contextMenu);
  }

  function showSubmenu(items: Array<{label: string, action: () => void}>, x: number, y: number) {
    const submenu = document.createElement('div');
    submenu.className = 'context-submenu';
    submenu.style.position = 'absolute';
    submenu.style.left = `${x}px`;
    submenu.style.top = `${y}px`;
    submenu.style.background = 'white';
    submenu.style.border = '2px solid #333';
    submenu.style.borderRadius = '8px';
    submenu.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
    submenu.style.zIndex = '10001';
    submenu.style.fontFamily = "'Manrope', sans-serif";
    submenu.style.fontSize = '18px';
    submenu.style.minWidth = '200px';

    items.forEach((item, index) => {
      const menuItem = document.createElement('div');
      menuItem.style.padding = '12px 16px';
      menuItem.style.cursor = 'pointer';
      menuItem.style.borderBottom = index < items.length - 1 ? '1px solid #eee' : 'none';
      menuItem.style.fontFamily = "'Manrope', sans-serif";
      menuItem.style.fontSize = '18px';
      menuItem.textContent = item.label;
      
      menuItem.onmouseenter = () => {
        menuItem.style.backgroundColor = '#f0f8ff';
      };
      
      menuItem.onmouseleave = () => {
        menuItem.style.backgroundColor = 'transparent';
      };

      menuItem.onclick = () => {
        item.action();
        removeContextMenu();
      };

      submenu.appendChild(menuItem);
    });

    container.appendChild(submenu);
  }

  // Context menu for empty space
  container.addEventListener('contextmenu', async (e) => {
    e.preventDefault();
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (element === container || element?.classList.contains('rete-area')) {
      const nodeTypes: NodeType[] = ["folder", "file", "class", "method", "function", "variables"];
      const menuItems = [
        {
          label: "Create Node",
          action: () => {},
          submenu: nodeTypes.map(type => ({
            label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${getNodeIcon(type)}`,
            action: async () => {
              await createNode(type, x, y, socket);
            }
          }))
        },
        {
          label: minimapVisible ? "Hide Minimap" : "Show Minimap",
          action: () => toggleMinimap(container)
        }
      ];
      
      createContextMenuElement(x, y, menuItems);
    }
  });

  // Handle connection creation clicks
  container.addEventListener('click', async (e) => {
    if (isCreatingConnection && selectedNode) {
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const nodeElement = element?.closest('[data-testid]');
      
      if (nodeElement) {
        const targetNodeId = nodeElement.getAttribute('data-testid')?.replace('node-', '');
        const targetNode = targetNodeId ? editor.getNode(targetNodeId) as CustomNode : null;
        
        if (targetNode && targetNode !== selectedNode) {
          if (!selectedNode.hasOutput('out')) {
            selectedNode.addOutput('out', new ClassicPreset.Output(socket));
          }
          if (!targetNode.hasInput('in')) {
            targetNode.addInput('in', new ClassicPreset.Input(socket));
          }

          const conn = new CustomConnection(selectedNode, 'out', targetNode, 'in', 'contain');
          await editor.addConnection(conn);
          showNotification("Connection created!");
        }
      } else {
        showNotification("Connection cancelled");
      }
      
      isCreatingConnection = false;
      selectedNode = null;
      container.style.cursor = 'default';
    }
  });

  document.addEventListener('click', (e) => {
    if (!contextMenu?.contains(e.target as Node)) {
      removeContextMenu();
    }
  });
}

async function createNode(nodeType: NodeType, x: number, y: number, socket: ClassicPreset.Socket) {
  const nodeLabel = prompt(`Enter label for ${nodeType} node:`, nodeType.charAt(0).toUpperCase() + nodeType.slice(1));
  if (!nodeLabel) return;

  const node = new CustomNode(nodeLabel, nodeType);
  node.addInput('in', new ClassicPreset.Input(socket));
  node.addOutput('out', new ClassicPreset.Output(socket));
  
  await editor.addNode(node);
  await area.translate(node.id, { x, y });
  
  showNotification(`${nodeType} node "${nodeLabel}" created!`);
}

function setupMinimap(container: HTMLElement) {
  // Create minimap toggle functionality
  const minimapContainer = document.createElement('div');
  minimapContainer.style.position = 'absolute';
  minimapContainer.style.bottom = '20px';
  minimapContainer.style.right = '20px';
  minimapContainer.style.width = '200px';
  minimapContainer.style.height = '150px';
  minimapContainer.style.border = '2px solid #333';
  minimapContainer.style.background = 'rgba(255,255,255,0.95)';
  minimapContainer.style.borderRadius = '8px';
  minimapContainer.style.display = 'none';
  minimapContainer.style.zIndex = '100';
  minimapContainer.style.fontFamily = "'Manrope', sans-serif";
  minimapContainer.style.fontSize = '18px';
  minimapContainer.className = 'minimap';
  
  const minimapContent = document.createElement('div');
  minimapContent.style.textAlign = 'center';
  minimapContent.style.lineHeight = '150px';
  minimapContent.style.fontSize = '18px';
  minimapContent.style.fontFamily = "'Manrope', sans-serif";
  minimapContent.textContent = 'Minimap View';
  
  minimapContainer.appendChild(minimapContent);
  container.appendChild(minimapContainer);

  // Right-click on minimap to hide
  minimapContainer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    toggleMinimap(container);
  });
}

function toggleMinimap(container: HTMLElement) {
  minimapVisible = !minimapVisible;
  const minimap = container.querySelector('.minimap') as HTMLElement;
  
  if (minimap) {
    minimap.style.display = minimapVisible ? 'block' : 'none';
  }
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case '=':
        case '+':
          e.preventDefault();
          showNotification("Zoom In");
          break;
        case '-':
          e.preventDefault();
          showNotification("Zoom Out");
          break;
        case '0':
          e.preventDefault();
          AreaExtensions.zoomAt(area, editor.getNodes());
          showNotification("Fit to View");
          break;
      }
    }
    
    if (e.key === 'Escape') {
      if (isCreatingConnection) {
        isCreatingConnection = false;
        selectedNode = null;
        document.body.style.cursor = 'default';
        showNotification("Connection cancelled");
      }
    }
  });
}
