npm run build
zip -r chatx.zip ./dist
scp chatx.zip lance:/root/agent
ssh -t lance 'rm -rf /root/agent/chatx'
ssh -t lance 'unzip /root/agent/chatx.zip -d /root/agent'
ssh -t lance 'mv /root/agent/dist /root/agent/chatx'
rm -rf chatx.zip