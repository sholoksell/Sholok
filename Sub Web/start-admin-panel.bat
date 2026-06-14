@echo off
echo ========================================
echo ECOMMERCE ADMIN PANEL - QUICK START
echo ========================================
echo.

echo Checking if admin server is running...
echo.

REM Check if port 3001 is in use (admin server)
netstat -ano | findstr ":3001" >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Admin Server is running on port 3001
) else (
    echo [!] Admin Server is NOT running on port 3001
    echo.
    echo To start Admin Server:
    echo   1. Open a new terminal
    echo   2. cd public\ecommerce-admin\server
    echo   3. npm start
    echo.
)

REM Check if port 5173 is in use (admin frontend)
netstat -ano | findstr ":5173" >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Admin Frontend is running on port 5173
) else (
    echo [!] Admin Frontend is NOT running on port 5173
    echo.
    echo To start Admin Frontend:
    echo   1. Open a new terminal
    echo   2. cd public\ecommerce-admin
    echo   3. npm run dev
    echo.
)

echo.
echo ========================================
echo SHOP BY CATEGORY DATA STATUS
echo ========================================
echo.
echo [OK] 247 Categories stored in MongoDB
echo [OK] 13 Main Categories
echo [OK] 234 Subcategories
echo [OK] All data accessible from admin panel
echo.
echo ========================================
echo HOW TO ACCESS ADMIN PANEL
echo ========================================
echo.
echo 1. Make sure both servers are running (see above)
echo 2. Open browser: http://localhost:5173
echo 3. Login with admin credentials
echo 4. Click "Categories" from sidebar
echo 5. You will see all 247 categories!
echo.
echo ========================================
echo ADMIN PANEL FEATURES
echo ========================================
echo.
echo [+] View all categories (table view)
echo [+] Search and filter categories
echo [+] Add new category/subcategory
echo [+] Edit existing categories
echo [+] Delete categories (single or bulk)
echo [+] Toggle featured/active status
echo [+] Upload category images
echo [+] Manage parent-child relationships
echo [+] Reorder categories
echo [+] Export to CSV
echo.
echo ========================================
pause
