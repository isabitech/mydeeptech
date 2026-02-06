import { RightOutlined, TeamOutlined } from "@ant-design/icons"
import { Button } from "antd"


const SlackNotification = () => {
  return (
   <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <TeamOutlined className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Join Our Community</h3>
                    <p className="text-purple-100 text-sm">
                      Connect with fellow annotators on Slack
                    </p>
                  </div>
                </div>
                
                <p className="text-purple-100 text-sm leading-relaxed max-w-2xl">
                  Be part of our growing community! Get real-time updates, collaborate with other annotators, 
                  ask questions, and stay connected with the MyDeepTech team on our official Slack channel.
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <Button
                  type="primary"
                  size="large"
                  href="https://join.slack.com/t/mydeeptechnologies/shared_invite/zt-3plfhy0a9-AWWnJfB9VuWPHPcFBMdzOA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-purple-600 border-0 hover:!bg-yellow-500 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-6 py-5 h-auto animate-bounce [animation-duration:2s]"
                  icon={<RightOutlined />}
                  iconPosition="end"
                >
                  Join Slack Community
                </Button>
              </div>
            </div>
  )
}

export default SlackNotification