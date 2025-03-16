#!/bin/bash

# 遍歷所有 HTML 文件
find /Users/jimwu/CascadeProjects/class607-website -name "*.html" -type f | while read file; do
  # 替換網站名稱
  sed -i '' 's/607班級網站/庚新宇宙/g' "$file"
  
  # 替換歡迎標題
  sed -i '' 's/歡迎來到607班級網站/歡迎來到六庚的天地/g' "$file"
  
  # 替換電子郵件
  sed -i '' 's/607class@example.com/jim20130131@gmail.com/g' "$file"
  
  # 替換電話號碼
  sed -i '' 's/(02) 1234-5678/886-966-258-238/g' "$file"
done

echo "網站信息更新完成！"
