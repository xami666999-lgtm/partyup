!macro customInit
  StrCpy $INSTDIR "$LOCALAPPDATA\Programs\PartyUp"
  ExecWait '"$SYSDIR\taskkill.exe" /F /T /IM "PartyUp.exe"'
  Sleep 300
!macroend

!macro customCheckAppRunning
!macroend

!macro customUnInstallCheck
!macroend

!macro customUnInstallCheckCurrentUser
!macroend
