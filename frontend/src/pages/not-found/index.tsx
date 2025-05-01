import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center p-4">
      <h1 className="display-3 text-danger">404</h1>
      <p className="lead">Oops! That page doesn't exist.</p>
      <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
        Go Home
      </button>
    </div>
  );
};

export default NotFoundPage;
