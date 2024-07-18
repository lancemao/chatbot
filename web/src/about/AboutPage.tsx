import AppContext from "@/AppContext";
import { useContext } from "react";
import './about.css'
import Markdown from "@/components/Markdown";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {

  const { appInfo } = useContext(AppContext)
  const navigate = useNavigate();

  const onLogClick = () => {
    navigate('/chatx/log');
  }

  return (
    <div className="about-container">
      <div className="chat-header">
        <div className="chat-header-title">关于{appInfo?.title}</div>
        <div style={{marginRight: 16}} onClick={onLogClick}>运行日志</div>
      </div>
      <div className="about-content">
        <Markdown content={appInfo?.description}></Markdown>
        {
          appInfo?.custom_disclaimer && <div className="about-custom-disclaimer">{appInfo?.custom_disclaimer}</div>
        }
      </div>
    </div>
  );
}

export default AboutPage;