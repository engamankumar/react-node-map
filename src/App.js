import './App.css';
import JsonData from './resources/react_nodalmap_test_data.json';
import DisplaNode from './Component/DisplayNode';
function App() {
  return (
    <div className="App">
      <DisplaNode orgData={JsonData} />
    </div>
  );
}

export default App;
