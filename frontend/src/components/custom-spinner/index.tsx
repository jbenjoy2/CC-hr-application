const CenteredSpinner = () => {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div
        className="spinner-border text-primary"
        role="status"
        style={{ width: "3rem", height: "3rem" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default CenteredSpinner;
