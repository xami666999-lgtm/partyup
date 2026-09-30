!macro customCheckAppRunning
  DetailPrint `Closing ${PRODUCT_NAME} if it is still open...`
  nsExec::ExecToLog `taskkill /F /T /IM "${APP_EXECUTABLE_FILENAME}"`
  Pop $0
  Sleep 800
  nsExec::ExecToLog `taskkill /F /T /IM "${APP_EXECUTABLE_FILENAME}"`
  Pop $0
  Sleep 400
!macroend
