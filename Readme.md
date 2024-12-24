-----------Server---------------
#Step 1
npm init -y
npm install express morgan cors nodemon bcryptjs jsonwebtoken

#Step 2
docker compose up -d

#Step 3
npm install prisma
npx prisma init
npm install @prisma/client

// Doc ใช้ในการสร้างและอัพเดตฐานข้อมูล
npx prisma migrate dev --name pm25

// update Scheme
npx prisma db push // no log
npx prisma migrate dev --create-only
npx prisma migrate dev --name pm25

//
อัพเดต Prisma schema
npx prisma migrate dev

#Step 4
เปิด Dbeaver สร้าง database postgres
--อย่าลืมเปลี่ยน DATABASE_URL ใน .env ให้ตรงกัน--
