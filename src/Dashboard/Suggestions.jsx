export default function Suggestions({ suggestions }) {
  return (
    <div className="dashboard-panel">
      <div className="dashboard-panel-header">
        <span className="dashboard-panel-icon">TIP</span>
        <div>
          <h2>Smart Suggestions</h2>
          <p>Focus on these improvements to raise your score faster.</p>
        </div>
      </div>

      <div className="dashboard-suggestions">
        {suggestions.map((suggestion, index) => (
          <div key={`${suggestion}-${index}`} className="dashboard-suggestion-item">
            <span className="dashboard-suggestion-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p>{suggestion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
