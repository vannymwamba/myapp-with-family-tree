import React, { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import { FaUser, FaUserTie, FaChild, FaFemale, FaTrash, FaDollarSign, FaPlus, FaRedo, FaFilePdf } from 'react-icons/fa';
import styled from 'styled-components';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  font-family: 'Roboto', sans-serif;
  max-width: 100%;
  height: 100vh;
  margin: 0 auto;
  padding: 20px;
`;

const TreeContainer = styled.div`
  width: 100%;
  height: 80vh;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }

  svg {
    margin-right: 5px;
  }
`;

const Input = styled.input`
  padding: 10px;
  margin: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 14px;
`;

const Select = styled.select`
  padding: 10px;
  margin: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 14px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
`;

const ResetButton = styled(Button)`
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const ExportButton = styled(Button)`
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
`;
const SearchContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const LanguageSelector = styled.select`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
`;

const StatsContainer = styled.div`
  position: absolute;
  bottom: 60px;
  right: 20px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
`;


const ADMIN_CODE = process.env.REACT_APP_ADMIN_CODE || '1234'; // Use environment variable in production
const SESSION_TIMEOUT = 30000; // 30 seconds

const FamilyTreeComponent = () => {
  const [familyData, setFamilyData] = useState(() => {
    const savedData = localStorage.getItem('familyTreeData');
    return savedData ? JSON.parse(savedData) : {
      name: 'Root Family',
      attributes: { birth: '', married: false, hasChildren: false, spouse: '', rank: 1, wealth: 3 },
      children: []
    };
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [newMember, setNewMember] = useState({
    name: '', birth: '', married: false, hasChildren: false, spouse: '', parentName: '', wealth: 3
  });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [familyName, setFamilyName] = useState("James");
  const [familyOrigin, setFamilyOrigin] = useState("USA");
  const treeContainerRef = useRef(null);
  const treeRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('familyTreeData', JSON.stringify(familyData));
  }, [familyData]);

  useEffect(() => {
    const updateDimensions = () => {
      if (treeContainerRef.current) {
        setDimensions({
          width: treeContainerRef.current.offsetWidth,
          height: treeContainerRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getFamilyName = (rank) => {
    const suffixes = ['st', 'nd', 'rd'];
    const suffix = suffixes[rank - 1] || 'th';
    return `${rank}${suffix} Generation`;
  };

  const getWealthIndicator = (wealth) => {
    return Array(wealth).fill(<FaDollarSign color="#FFD700" />);
  };

  const renderNodeWithCustomEvents = ({ nodeDatum, toggleNode }) => (
    <g>
      <circle r="25" fill="#8be9fd" onClick={toggleNode} />
      <text dy=".31em" x="30" textAnchor="start" onClick={toggleNode} style={{fontSize: '14px', fontWeight: 'bold', fontFamily: 'Roboto, sans-serif'}}>
        {nodeDatum.name}
      </text>
      <text dy="1.31em" x="30" textAnchor="start" onClick={toggleNode} style={{fontSize: '12px', fontFamily: 'Roboto, sans-serif'}}>
        {getFamilyName(nodeDatum.attributes.rank)}
      </text>
      <g transform="translate(-12, -12)">
        {nodeDatum.attributes.married ? <FaUserTie size={16} color="#ff79c6" /> : <FaUser size={16} color="#bd93f9" />}
      </g>
      {nodeDatum.attributes.hasChildren && (
        <g transform="translate(12, -12)">
          <FaChild size={16} color="#50fa7b" />
        </g>
      )}
      {nodeDatum.attributes.spouse && (
        <g transform="translate(-12, 12)">
          <FaFemale size={16} color="#ff5555" />
          <text dy=".31em" x="15" textAnchor="start" fontSize="12" fontFamily="Roboto, sans-serif">
            {nodeDatum.attributes.spouse}
          </text>
        </g>
      )}
      <g transform="translate(30, 30)">
        {getWealthIndicator(nodeDatum.attributes.wealth).map((icon, index) => (
          <g key={index} transform={`translate(${index * 15}, 0)`}>{icon}</g>
        ))}
      </g>
      {isAdmin && (
        <g transform="translate(50, -12)" onClick={() => deleteMember(nodeDatum.name)}>
          <FaTrash size={16} color="#ff5555" />
        </g>
      )}
      <g transform="translate(-25, -40)" onClick={() => handleAddMember(nodeDatum)}>
        <circle r="10" fill="#4CAF50" />
        <FaPlus size={12} color="white" x="-6" y="-6" />
      </g>
    </g>
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMember({ 
      ...newMember, 
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value 
    });
  };

  const addMember = () => {
    const addToTree = (tree) => {
      if (tree.name === selectedNode.name) {
        tree.children = tree.children || [];
        const newRank = tree.attributes.rank + 1;
        tree.children.push({
          name: newMember.name,
          attributes: { ...newMember, parentName: undefined, rank: newRank },
          children: []
        });
        tree.attributes.hasChildren = true;
        return true;
      }
      return tree.children && tree.children.some(addToTree);
    };

    setFamilyData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (addToTree(newData)) {
        setNewMember({
          name: '', birth: '', married: false, hasChildren: false, spouse: '', parentName: '', wealth: 3
        });
        setIsModalOpen(false);
        return newData;
      }
      alert('Parent not found');
      return prevData;
    });
  };

  const deleteMember = (memberName) => {
    const deleteFromTree = (tree) => {
      if (tree.children) {
        const index = tree.children.findIndex(child => child.name === memberName);
        if (index !== -1) {
          tree.children.splice(index, 1);
          tree.attributes.hasChildren = tree.children.length > 0;
          return true;
        }
        return tree.children.some(deleteFromTree);
      }
      return false;
    };

    setFamilyData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      if (deleteFromTree(newData)) {
        return newData;
      }
      alert('Member not found');
      return prevData;
    });
  };

  const handleAdminLogin = () => {
    if (adminCode === ADMIN_CODE) {
      setIsAdmin(true);
      setAdminCode('');
    } else {
      alert('Incorrect admin code');
    }
  };

  const handleAddMember = (node) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const resetTreeView = () => {
    if (treeRef.current && treeRef.current.state) {
      treeRef.current.setState({
        translate: { x: dimensions.width / 2, y: 50 },
        zoom: 0.7
      });
    }
  };

  const getGenerationCount = (node) => {
    if (!node.children || node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map(getGenerationCount));
  };

  const exportToPDF = () => {
    const input = document.getElementById('family-tree-container');
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.setFontSize(16);
      pdf.text(`Welcome to the ${familyName} Family Tree`, 20, 20);
      
      const generationCount = getGenerationCount(familyData);
      pdf.setFontSize(12);
      pdf.text(`This is a ${generationCount}-generation family starting off in ${familyOrigin}.`, 20, 27);

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${familyName}_family_tree.pdf`);
    });
  };

  return (
    <Container>
      <h1 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '28px', color: '#333' }}>
        {familyName} Family Tree
      </h1>
      <Controls>
        {!isAdmin && (
          <>
            <Input
              type="password"
              placeholder="Enter admin code"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
            />
            <Button onClick={handleAdminLogin}>Login as Admin</Button>
          </>
        )}
        {isAdmin && (
          <>
            <Button onClick={() => setIsAdmin(false)}>Logout Admin</Button>
            <Input
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Family Name"
            />
            <Input
              value={familyOrigin}
              onChange={(e) => setFamilyOrigin(e.target.value)}
              placeholder="Family Origin"
            />
          </>
        )}
      </Controls>
      <TreeContainer ref={treeContainerRef} id="family-tree-container">
        <Tree
          data={familyData}
          orientation="vertical"
          pathFunc="step"
          translate={{ x: dimensions.width / 2, y: 50 }}
          nodeSize={{ x: 200, y: 150 }}
          renderCustomNodeElement={renderNodeWithCustomEvents}
          separation={{ siblings: 2, nonSiblings: 2 }}
          zoomable={true}
          draggable={true}
          scaleExtent={{ min: 0.1, max: 1 }}
          zoom={0.7}
          ref={treeRef}
        />
        <ResetButton onClick={resetTreeView}>
          <FaRedo /> Reset View
        </ResetButton>
        <ExportButton onClick={exportToPDF}>
          <FaFilePdf /> Export to PDF
        </ExportButton>
      </TreeContainer>
      {isModalOpen && (
        <Modal>
          <ModalContent>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '20px', color: '#333' }}>Add New Family Member</h3>
            <Input name="name" value={newMember.name} onChange={handleInputChange} placeholder="Name" />
            <Input type="date" name="birth" value={newMember.birth} onChange={handleInputChange} />
            <label>
              <Input type="checkbox" name="married" checked={newMember.married} onChange={handleInputChange} />
              Married
            </label>
            <label>
              <Input type="checkbox" name="hasChildren" checked={newMember.hasChildren} onChange={handleInputChange} />
              Has Children
            </label>
            <Input name="spouse" value={newMember.spouse} onChange={handleInputChange} placeholder="Spouse's Name" />
            <Select name="wealth" value={newMember.wealth} onChange={handleInputChange}>
              {[1, 2, 3, 4, 5].map(value => (
                <option key={value} value={value}>{value} (Wealth Level)</option>
              ))}
            </Select>
            <Button onClick={addMember}>Add Member</Button>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default FamilyTreeComponent;