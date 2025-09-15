@echo off
echo Iniciando o Frontend da Prefeitura...
echo.

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js 18+ e tente novamente.
    pause
    exit /b 1
)

REM Verificar se o npm está instalado
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: npm nao encontrado!
    echo Por favor, instale o npm e tente novamente.
    pause
    exit /b 1
)

REM Instalar dependências se necessário
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)

REM Iniciar o servidor de desenvolvimento
echo.
echo Iniciando servidor de desenvolvimento...
echo Acesse: http://localhost:5173
echo.
npm run dev

pause
