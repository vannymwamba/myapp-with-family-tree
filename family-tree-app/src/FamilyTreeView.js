import React from 'react';
import Tree from 'react-d3-tree';

const FamilyTreeView = ({ data }) => {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Tree 
        data={data}
        orientation="vertical"
        pathFunc="step"
        translate={{ x: 300, y: 50 }}
        nodeSize={{ x: 200, y: 100 }}
        renderCustomNodeElement={(rd3tProps) => (
          <g>
            <circle r="15" fill="lightblue" />
            <text dy=".31em" x="20" textAnchor="start">
              {rd3tProps.nodeDatum.name}
            </text>
          </g>
        )}
      />
    </div>
  );
};

export default FamilyTreeView;