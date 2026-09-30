!macro customInit
  ExecWait '"$SYSDIR\taskkill.exe" /F /T /IM "PartyUp.exe"'
  Sleep 400
  ExecWait '"$SYSDIR\taskkill.exe" /F /T /IM "PartyUp.exe"'
  Sleep 400
!macroend

!macro customCheckAppRunning
  ExecWait '"$SYSDIR\taskkill.exe" /F /T /IM "PartyUp.exe"'
  Sleep 400
!macroend
