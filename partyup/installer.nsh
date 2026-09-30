; Runs after the folder page, before NSIS extracts plugins into Temp.
; Temp must be on the same drive as the install, or WinShell.dll fails when C: is tight.
!macro customPageAfterChangeDir
  !undef MUI_PAGE_CUSTOMFUNCTION_PRE
  !define MUI_PAGE_CUSTOMFUNCTION_PRE PartyUpInstFilesPre
  Var /GLOBAL partyUpCustomTemp

  Function PartyUpInstFilesPre
    ${StrContains} $0 "${APP_FILENAME}" $INSTDIR
    ${If} $0 == ""
      StrCpy $INSTDIR "$INSTDIR\${APP_FILENAME}"
    ${EndIf}

    StrCpy $partyUpCustomTemp "0"
    StrCpy $1 $INSTDIR 1
    StrCmp $1 "\" tempDone
    IfFileExists "$1:\*.*" 0 tempDone
    CreateDirectory "$1:\PartyUpTemp"
    IfFileExists "$1:\PartyUpTemp\*.*" 0 tempDone
    StrCpy $TEMP "$1:\PartyUpTemp"
    StrCpy $TMP "$1:\PartyUpTemp"
    StrCpy $partyUpCustomTemp "1"

    tempDone:
  FunctionEnd
!macroend

!macro customCheckAppRunning
!macroend

!macro customUnInstallCheck
!macroend

!macro customUnInstallCheckCurrentUser
!macroend

!macro customInstall
  StrCmp $partyUpCustomTemp "1" 0 skipTempClean
  RMDir /r "$TEMP"
  skipTempClean:
!macroend
