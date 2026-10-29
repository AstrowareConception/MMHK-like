@echo off
setlocal
cd /d "%~dp0"
echo.
echo === MMHK-like : demarrage du prototype local ===
echo Assurez-vous que Docker Desktop est ouvert.
echo.
where py >nul 2>nul
if not errorlevel 1 (
    py -3 tools\local\stack.py start --historical %*
) else (
    where python >nul 2>nul
    if errorlevel 1 (
        echo ERREUR : Python 3.10+ est requis.
        echo Installez Python depuis https://www.python.org/downloads/
        echo et cochez l'option d'ajout au PATH.
        goto :end
    )
    python tools\local\stack.py start --historical %*
)
if errorlevel 1 (
    echo.
    echo Le demarrage a echoue : verifiez les messages ci-dessus.
)
:end
echo.
echo Gardez cette fenetre pour noter les identifiants du compte.
pause
endlocal
