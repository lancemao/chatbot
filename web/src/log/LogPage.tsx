import AppContext from "@/AppContext";
import { useContext } from "react";
import './log.css'

const LogPage = () => {

  const { logs } = useContext(AppContext)

  return (
    <div className="log-container">
      <div className="log-header">
        <div className="log-title">运行日志</div>
      </div>
      {
        logs.map((log, index) => (
          <div key={index} className={`log-item log-item-${log.level}`}>
            <div className={`log-item-text log-item-text-${log.level}`}>
              {log.message}
            </div>
          </div>
        ))
      }
    </div>
  );
}

export default LogPage;