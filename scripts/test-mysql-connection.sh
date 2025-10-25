#!/bin/bash
# Test MySQL connections

echo "Testing Remote MySQL Connection..."
echo "Host: srv557.hstgr.io"
echo "User: u744630877_tasks"
echo ""

# Test connection
MYSQL_PWD='###Taskstasks123' mysql -h srv557.hstgr.io -u u744630877_tasks -e "SELECT 'Connection successful!' as status, DATABASE() as current_db, VERSION() as version;" u744630877_tasks

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Remote connection works!"
    echo ""
    echo "Testing schema export..."
    MYSQL_PWD='###Taskstasks123' mysqldump -h srv557.hstgr.io -u u744630877_tasks --no-data --skip-comments u744630877_tasks > test-remote-schema.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Schema export works!"
        ls -lh test-remote-schema.sql
        echo ""
        echo "First 20 lines:"
        head -n 20 test-remote-schema.sql
    else
        echo "❌ Schema export failed"
    fi
else
    echo "❌ Remote connection failed"
    echo ""
    echo "Trying without MYSQL_PWD..."
    mysqldump -h srv557.hstgr.io -u u744630877_tasks -p'###Taskstasks123' --no-data --skip-comments u744630877_tasks > test-remote-schema2.sql 2>&1
    echo "Exit code: $?"
fi

echo ""
echo "Testing Local MySQL (Docker)..."
docker exec mysql mysql -u root -proot -e "SELECT 'Connection successful!' as status, DATABASE() as current_db, VERSION() as version;" u744630877_tasks

if [ $? -eq 0 ]; then
    echo "✅ Local connection works!"
else
    echo "❌ Local connection failed"
fi
