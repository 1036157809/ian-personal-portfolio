#!/bin/bash
cd /Users/zedzhang/Desktop/Zyf/ian-personal-portfolio/apps/frontend
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
node spa-server.cjs &
SERVER_PID=$!
sleep 2
npx playwright test --reporter=line 2>&1 | tee e2e-output.txt
EXIT_CODE=$?
kill $SERVER_PID 2>/dev/null || true
exit $EXIT_CODE
