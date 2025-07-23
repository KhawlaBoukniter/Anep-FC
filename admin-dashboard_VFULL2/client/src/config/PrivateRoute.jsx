import { useContext } from "react";
import { Navigate } from "react-router-dom";
import UserContext from "../auth/user-context";
import PropTypes from "prop-types";

const PrivateRoute = ({ children }) => {
  const [currentUser] = useContext(UserContext);


  if (!currentUser) {
    return <Navigate to="/" />;
  }

  return children;
};
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
