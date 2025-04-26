// src/App.js
import React, { useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import ForceGraph3D from 'react-force-graph-3d';
import './App.css';

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [nodeCount, setNodeCount] = useState(150);
  const [connectionDensity, setConnectionDensity] = useState(0.2);
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeDetails, setNodeDetails] = useState([]);
  
  // Computer network node types
  const nodeTypes = [
    'Router', 'Switch', 'Server', 'Client', 
    'Firewall', 'Gateway', 'Access Point', 'Load Balancer',
    'Database', 'Web Server', 'DNS Server', 'Proxy'
  ];
  
  // Color palette for different node types
  const typeColors = {
    'Router': '#1E88E5', // blue
    'Switch': '#D81B60', // red
    'Server': '#FFC107', // yellow
    'Client': '#004D40', // dark green
    'Firewall': '#8E24AA', // purple
    'Gateway': '#00ACC1', // cyan
    'Access Point': '#FB8C00', // orange
    'Load Balancer': '#5E35B1', // deep purple
    'Database': '#43A047', // green
    'Web Server': '#E53935', // red
    'DNS Server': '#6D4C41', // brown
    'Proxy': '#00897B', // teal
  };
  
  // Create clusters of nodes (similar to the image)
  const generateClusteredNetwork = () => {
    // Create hub nodes (larger, important connection points)
    const hubCount = 12;
    const hubs = Array(hubCount).fill(0).map((_, i) => ({
      id: `hub-${i}`,
      name: `Network Hub ${i}`,
      hubId: i,
      isHub: true,
      type: 'Hub',
      color: '#FFFFFF', // White hubs like in image
      val: 25, // Larger nodes for hubs
      neighbors: []
    }));
    
    // Create clusters around hubs
    const clusterNodes = [];
    hubs.forEach(hub => {
      // Random cluster size
      const clusterSize = Math.floor(Math.random() * 25) + 5;
      
      // Create nodes in this cluster
      for (let i = 0; i < clusterSize; i++) {
        const nodeId = `node-${hub.hubId}-${i}`;
        const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
        clusterNodes.push({
          id: nodeId,
          name: `${type} ${hub.hubId}-${i}`,
          type: type,
          hubId: hub.hubId,
          color: typeColors[type],
          val: 8 + Math.random() * 5,
          ipAddress: generateRandomIP(),
          macAddress: generateRandomMAC(),
          status: Math.random() > 0.1 ? 'Online' : 'Offline',
          bandwidth: `${Math.floor(Math.random() * 10) + 1}Gbps`,
          protocol: randomProtocol(),
          securityLevel: Math.floor(Math.random() * 5) + 1
        });
        
        // Add to hub's neighbors for data tracking
        hub.neighbors.push(nodeId);
      }
    });
    
    // Combine hubs and cluster nodes
    const nodes = [...hubs, ...clusterNodes];
    
    // Create links
    const links = [];
    
    // Connect nodes to their hub
    clusterNodes.forEach(node => {
      links.push({
        source: node.id,
        target: `hub-${node.hubId}`,
        strength: 0.2 + Math.random() * 0.3,
        width: 1,
        bandwidth: `${Math.floor(Math.random() * 1000) + 100}Mbps`,
        latency: `${Math.floor(Math.random() * 50)}ms`,
        packetLoss: `${(Math.random() * 2).toFixed(2)}%`
      });
    });
    
    // Connect hubs to create a network structure
    for (let i = 0; i < hubs.length; i++) {
      // Connect to 2-4 other hubs
      const connectionsCount = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < connectionsCount; j++) {
        const targetIndex = (i + j + 1) % hubs.length;
        links.push({
          source: hubs[i].id,
          target: hubs[targetIndex].id,
          strength: 0.05,
          width: 3,
          bandwidth: `${Math.floor(Math.random() * 10) + 1}Gbps`,
          latency: `${Math.floor(Math.random() * 10)}ms`,
          packetLoss: '0.00%'
        });
      }
    }
    
    // Add some random cross-cluster connections
    const crossClusterCount = Math.floor(nodes.length * connectionDensity);
    for (let i = 0; i < crossClusterCount; i++) {
      const sourceNode = clusterNodes[Math.floor(Math.random() * clusterNodes.length)];
      const targetNode = clusterNodes[Math.floor(Math.random() * clusterNodes.length)];
      
      // Don't connect nodes in same cluster and avoid duplicates
      if (sourceNode.hubId !== targetNode.hubId && 
          !links.some(link => 
            (link.source === sourceNode.id && link.target === targetNode.id) || 
            (link.source === targetNode.id && link.target === sourceNode.id))) {
        links.push({
          source: sourceNode.id,
          target: targetNode.id,
          strength: 0.1,
          width: 1,
          bandwidth: `${Math.floor(Math.random() * 500) + 100}Mbps`,
          latency: `${Math.floor(Math.random() * 80) + 20}ms`,
          packetLoss: `${(Math.random() * 5).toFixed(2)}%`
        });
      }
    }
    
    setGraphData({ nodes, links });
    
    // Generate connection details for the table view
    const connectionDetails = links.map(link => {
      const sourceNode = nodes.find(n => n.id === link.source) || 
                         nodes.find(n => n.id.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target) || 
                         nodes.find(n => n.id.id === link.target);
      
      return {
        source: sourceNode?.name || link.source,
        sourceType: sourceNode?.type || 'Unknown',
        target: targetNode?.name || link.target,
        targetType: targetNode?.type || 'Unknown',
        bandwidth: link.bandwidth || 'N/A',
        latency: link.latency || 'N/A',
        packetLoss: link.packetLoss || 'N/A',
        protocol: randomProtocol()
      };
    });
    
    setNodeDetails(connectionDetails);
  };
  
  // Helper functions for random data generation
  function generateRandomIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }
  
  function generateRandomMAC() {
    const hexDigits = "0123456789ABCDEF";
    let mac = "";
    for (let i = 0; i < 6; i++) {
      mac += hexDigits.charAt(Math.floor(Math.random() * 16));
      mac += hexDigits.charAt(Math.floor(Math.random() * 16));
      if (i < 5) mac += ":";
    }
    return mac;
  }
  
  function randomProtocol() {
    const protocols = [
      'HTTP', 'HTTPS', 'FTP', 'SSH', 'SMTP', 
      'TCP', 'UDP', 'ICMP', 'DNS', 'DHCP',
      'RIP', 'OSPF', 'BGP', 'SNMP', 'TLS'
    ];
    const count = Math.floor(Math.random() * 2) + 1;
    const selected = new Set();
    
    for (let i = 0; i < count; i++) {
      selected.add(protocols[Math.floor(Math.random() * protocols.length)]);
    }
    
    return Array.from(selected).join(', ');
  }
  
  // Generate initial network on component mount
  useEffect(() => {
    generateClusteredNetwork();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Node click handler
  const handleNodeClick = node => {
    setSelectedNode(node);
  };
  
  return (
    <div className="App">
      <div className="controls">
        <h2>Random Node Creation</h2>
        <div className="control-row">
          <div>
            <label>
              Number of Nodes:
              <input 
                type="number" 
                value={nodeCount} 
                onChange={e => setNodeCount(Math.max(30, parseInt(e.target.value) || 30))} 
                min="30"
              />
            </label>
          </div>
          <div>
            <label>
              Connection Density:
              <input 
                type="range" 
                min="0.1" 
                max="0.5" 
                step="0.05" 
                value={connectionDensity} 
                onChange={e => setConnectionDensity(parseFloat(e.target.value))} 
              />
              {connectionDensity.toFixed(2)}
            </label>
          </div>
          <div>
            <label>
              View Mode:
              <select 
                value={viewMode} 
                onChange={e => setViewMode(e.target.value)}
              >
                <option value="2d">2D View</option>
                <option value="3d">3D View</option>
                <option value="data">Connection Data</option>
              </select>
            </label>
          </div>
          <button onClick={generateClusteredNetwork}>Generate New Network</button>
        </div>
        
        <div className="legend">
          <h3>Node Types</h3>
          <div className="legend-container">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="legend-item">
                <span style={{ background: color }} className="color-box"></span>
                <span>{type}</span>
              </div>
            ))}
            <div className="legend-item">
              <span style={{ background: '#FFFFFF' }} className="color-box"></span>
              <span>Hub</span>
            </div>
          </div>
        </div>
      </div>
      
      {viewMode === '2d' && (
        <div className="graph-container">
          <ForceGraph2D
            graphData={graphData}
            nodeLabel={node => `${node.name}\nIP: ${node.ipAddress || 'N/A'}`}
            linkLabel={link => `Bandwidth: ${link.bandwidth}, Latency: ${link.latency}`}
            nodeColor={node => node.color}
            nodeRelSize={3}
            nodeVal={node => node.val}
            linkWidth={link => link.width || 1}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            cooldownTime={5000}
            onNodeClick={handleNodeClick}
            linkColor={() => "rgba(200, 200, 200, 0.5)"}
            backgroundColor="#ffffff"
          />
        </div>
      )}
      
      {viewMode === '3d' && (
        <div className="graph-container">
          <ForceGraph3D
            graphData={graphData}
            nodeLabel={node => `${node.name}\nIP: ${node.ipAddress || 'N/A'}`}
            linkLabel={link => `Bandwidth: ${link.bandwidth}, Latency: ${link.latency}`}
            nodeColor={node => node.color}
            nodeRelSize={6}
            nodeVal={node => node.val / 2}
            linkWidth={link => link.width || 1}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            cooldownTime={5000}
            onNodeClick={handleNodeClick}
          />
        </div>
      )}
      
      {viewMode === 'data' && (
        <div className="data-container">
          <h3>Network Connection Data</h3>
          <table className="connections-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Type</th>
                <th>Target</th>
                <th>Type</th>
                <th>Bandwidth</th>
                <th>Latency</th>
                <th>Packet Loss</th>
                <th>Protocol</th>
              </tr>
            </thead>
            <tbody>
              {nodeDetails.slice(0, 100).map((conn, idx) => (
                <tr key={idx}>
                  <td>{conn.source}</td>
                  <td>{conn.sourceType}</td>
                  <td>{conn.target}</td>
                  <td>{conn.targetType}</td>
                  <td>{conn.bandwidth}</td>
                  <td>{conn.latency}</td>
                  <td>{conn.packetLoss}</td>
                  <td>{conn.protocol}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {nodeDetails.length > 100 && (
            <div className="table-note">Showing first 100 connections of {nodeDetails.length} total</div>
          )}
        </div>
      )}
      
      {selectedNode && (
        <div className="node-details-panel">
          <div className="node-details-header">
            <h3>{selectedNode.name}</h3>
            <button onClick={() => setSelectedNode(null)}>Close</button>
          </div>
          <div className="node-details-content">
            <p><strong>Type:</strong> {selectedNode.type}</p>
            {selectedNode.isHub ? (
              <>
                <p><strong>Connected Devices:</strong> {selectedNode.neighbors?.length || 0}</p>
                <p><strong>Network Role:</strong> Central Hub</p>
              </>
            ) : (
              <>
                <p><strong>IP Address:</strong> {selectedNode.ipAddress || 'N/A'}</p>
                <p><strong>MAC Address:</strong> {selectedNode.macAddress || 'N/A'}</p>
                <p><strong>Status:</strong> {selectedNode.status || 'Unknown'}</p>
                <p><strong>Bandwidth:</strong> {selectedNode.bandwidth || 'N/A'}</p>
                <p><strong>Protocols:</strong> {selectedNode.protocol || 'N/A'}</p>
                <p><strong>Security Level:</strong> {selectedNode.securityLevel || 'N/A'}/5</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;