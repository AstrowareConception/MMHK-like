@echo off
setlocal
cd /d "%~dp0"
echo === MMHK-like : recettes QA dans un Docker ISOLE ===
echo Votre partie habituelle ne sera pas supprimee.
where py >nul 2>nul
if not errorlevel 1 (
    py -3 tools\local\qa.py %*
) else (
    where python >nul 2>nul
    if errorlevel 1 (
        echo ERREUR : installez Python 3.10+.
        goto :end
    )
    python tools\local\qa.py %*
)
if errorlevel 1 (
    echo.
    echo Les tests ont signale une erreur. Consultez les rapports .qa-local\reports
)
:end
echo.
pause
endlocal
