@echo off

mt.exe -nologo -inputresource:%~dp0..\dist\win-unpacked\SJCloudUploader.exe;#1 -out:%~dp0..\dist\win-unpacked\default_manifest.xml

set "infile=%~dp0..\dist\win-unpacked\default_manifest.xml"
set "search=asInvoker"
set "replace=requireAdministrator"
set "outfile=%~dp0..\dist\win-unpacked\SJCloudUploader.exe.manifest"
copy /y NUL %outfile% >NUL
for /f "delims=" %%i in (%infile%) do (
    set "line=%%i"
    setlocal enabledelayedexpansion
    set "line=!line:%search%=%replace%!"
    echo !line! >>%outfile%
    endlocal
)

mt.exe -nologo -manifest %outfile% -outputresource:%~dp0..\dist\win-unpacked\SJCloudUploader.exe;1