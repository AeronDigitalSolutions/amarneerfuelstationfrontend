import React from "react";
import "./FullScreenLoader.css";

interface Props {
  loading: boolean;
}

const FullScreenLoader: React.FC<Props> = ({ loading }) => {
  if (!loading) return null;

  return (
    // <div className="fs-loader-overlay">
    //   <div className="fs-loader-spinner"></div>
    // </div>
<div className="loader">
  <div className="justify-content-center jimu-primary-loading"></div>
</div>
  );
};

export default FullScreenLoader;
