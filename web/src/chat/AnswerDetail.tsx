import { ConversationItem } from "@/types/app";
import { useLocation } from "react-router-dom";
import img_check_circle from '@/assets/images/check-circle.svg';
import img_alert_circle from '@/assets/images/alert-circle.svg';

import './answer-detail.css'

const AnswerDetail = () => {
  const location = useLocation();
  const item = location.state as ConversationItem

  return (
    <>
      {
        item &&
        <div className="ad-workflow-container">
          <div className="ad-workflow-title">工作流</div>
          {
            item.workflow?.nodes?.map((node: any, index: number) => {
              return (
                <div className="ad-workflow-item" key={index}>
                  <img className="ad-workflow-item-status-icon" src={node.finish.data.status === 'failed' ? img_alert_circle : img_check_circle} />
                  <div className="ad-workflow-item-title">{node.start.data.title}</div>
                  <div className="ad-workflow-item-content">
                    {
                    }
                  </div>
                </div>
              )
            })
          }
        </div>
      }
    </>
  );
}

export default AnswerDetail;